import { config } from '../config';
import { logger } from '../utils/logger';
import type { FlightSearchInput } from '../validation/schemas';

const KIWI_SEARCH_ENDPOINT = 'https://api.tequila.kiwi.com/v2/search';
const REQUEST_TIMEOUT_MS = 15000;

const CABIN_CLASS_TO_KIWI: Record<FlightSearchInput['cabinClass'], string> = {
  ECONOMY: 'M',
  PREMIUM_ECONOMY: 'W',
  BUSINESS: 'C',
  FIRST: 'F',
};

type KiwiRouteLeg = {
  flyFrom?: string;
  flyTo?: string;
  cityFrom?: string;
  cityTo?: string;
  local_departure?: string;
  local_arrival?: string;
  airline?: string;
};

type KiwiFlight = {
  id?: string;
  airlines?: string[];
  route?: KiwiRouteLeg[];
  local_departure?: string;
  local_arrival?: string;
  cityFrom?: string;
  cityTo?: string;
  flyFrom?: string;
  flyTo?: string;
  duration?: {
    total?: number;
  };
  price?: number;
  currency?: string;
  deep_link?: string;
};

type KiwiSearchResponse = {
  data?: KiwiFlight[];
  currency?: string;
};

export interface NormalizedFlightResult {
  id: string;
  airline: string;
  departure: {
    iata: string;
    city: string;
    time: string;
  };
  arrival: {
    iata: string;
    city: string;
    time: string;
  };
  duration: string;
  stops: number;
  price: number;
  currency: string;
  deep_link: string;
}

export class KiwiServiceError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const toKiwiDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const formatDuration = (totalSeconds: number): string => {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 'N/A';
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

const buildQueryParams = (input: FlightSearchInput): URLSearchParams => {
  const params = new URLSearchParams();
  params.set('fly_from', input.from);
  params.set('fly_to', input.to);
  params.set('date_from', toKiwiDate(input.departDate));
  params.set('date_to', toKiwiDate(input.departDate));
  params.set('adults', String(input.adults));
  params.set('children', String(input.children));
  params.set('infants', String(input.infants));
  params.set('selected_cabins', CABIN_CLASS_TO_KIWI[input.cabinClass]);
  params.set('curr', 'USD');
  params.set('limit', '30');
  params.set('sort', 'price');
  params.set('one_for_city', '1');

  if (input.returnDate) {
    const kiwiReturnDate = toKiwiDate(input.returnDate);
    params.set('return_from', kiwiReturnDate);
    params.set('return_to', kiwiReturnDate);
  }

  return params;
};

const normalizeFlight = (item: KiwiFlight, currencyFallback: string): NormalizedFlightResult => {
  const route = Array.isArray(item.route) ? item.route : [];
  const firstLeg = route[0] || {};
  const lastLeg = route[route.length - 1] || firstLeg;
  const departureTime = firstLeg.local_departure || item.local_departure || '';
  const arrivalTime = lastLeg.local_arrival || item.local_arrival || '';
  const airline =
    (Array.isArray(item.airlines) && item.airlines[0]) ||
    firstLeg.airline ||
    'N/A';

  return {
    id: item.id || `${airline}-${departureTime}-${arrivalTime}`,
    airline,
    departure: {
      iata: firstLeg.flyFrom || item.flyFrom || '',
      city: firstLeg.cityFrom || item.cityFrom || '',
      time: departureTime,
    },
    arrival: {
      iata: lastLeg.flyTo || item.flyTo || '',
      city: lastLeg.cityTo || item.cityTo || '',
      time: arrivalTime,
    },
    duration: formatDuration(item.duration?.total || 0),
    stops: Math.max(route.length - 1, 0),
    price: Number(item.price || 0),
    currency: item.currency || currencyFallback || 'USD',
    deep_link: item.deep_link || '',
  };
};

export const searchKiwiFlights = async (
  input: FlightSearchInput
): Promise<NormalizedFlightResult[]> => {
  if (!config.kiwiApiKey) {
    throw new KiwiServiceError(
      'Flight search is temporarily unavailable.',
      503,
      'KIWI_NOT_CONFIGURED'
    );
  }

  const queryParams = buildQueryParams(input);
  const url = `${KIWI_SEARCH_ENDPOINT}?${queryParams.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: config.kiwiApiKey,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const providerMessage = await response.text().catch(() => '');
      logger.warn('Kiwi API request failed', {
        status: response.status,
        providerMessage: providerMessage.slice(0, 200),
      });

      if (response.status === 429) {
        throw new KiwiServiceError(
          'Flight search provider is temporarily rate limited. Please try again shortly.',
          503,
          'KIWI_RATE_LIMITED'
        );
      }

      throw new KiwiServiceError(
        'Flight search provider is currently unavailable.',
        503,
        'KIWI_UNAVAILABLE'
      );
    }

    const payload = (await response.json()) as KiwiSearchResponse;
    const flights = Array.isArray(payload.data) ? payload.data : [];
    const currencyFallback = payload.currency || 'USD';

    return flights.map((item) => normalizeFlight(item, currencyFallback));
  } catch (error: unknown) {
    if (error instanceof KiwiServiceError) {
      throw error;
    }

    if ((error as Error)?.name === 'AbortError') {
      throw new KiwiServiceError(
        'Flight search timed out. Please try again.',
        504,
        'KIWI_TIMEOUT'
      );
    }

    logger.error('Unexpected Kiwi search error', error as Error);
    throw new KiwiServiceError(
      'Unable to fetch flights right now. Please try again later.',
      503,
      'KIWI_REQUEST_FAILED'
    );
  } finally {
    clearTimeout(timeout);
  }
};
