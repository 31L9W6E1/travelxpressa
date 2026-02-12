import api, { handleApiError } from './client';

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface FlightSearchRequest {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
}

export interface FlightResult {
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

type FlightSearchResponse = {
  success: boolean;
  data?: {
    flights?: FlightResult[];
  };
  error?: string;
};

export const searchFlights = async (
  payload: FlightSearchRequest
): Promise<FlightResult[]> => {
  try {
    const response = await api.post<FlightSearchResponse>('/api/flights/search', payload);
    return response.data?.data?.flights || [];
  } catch (error) {
    throw handleApiError(error);
  }
};
