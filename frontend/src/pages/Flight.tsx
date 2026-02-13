import { useMemo, useState } from 'react';
import { AlertCircle, ExternalLink, Loader2, Plane, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from "@/components/PageHeader";
import { searchFlights, type CabinClass, type FlightResult } from '@/api/flights';
import { ApiError } from '@/api/client';

type FlightSearchFormState = {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
};

const INITIAL_FORM_STATE: FlightSearchFormState = {
  from: '',
  to: '',
  departDate: '',
  returnDate: '',
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: 'ECONOMY',
};

const CABIN_OPTIONS: Array<{ value: CabinClass; label: string }> = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
];

const Flight = () => {
  const [form, setForm] = useState<FlightSearchFormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleIataChange = (field: 'from' | 'to', value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3),
    }));
  };

  const updateNumber = (field: 'adults' | 'children' | 'infants', value: string) => {
    const parsed = Number.parseInt(value, 10);
    setForm((previous) => ({
      ...previous,
      [field]: Number.isFinite(parsed) ? Math.max(0, Math.min(9, parsed)) : 0,
    }));
  };

  const formatDateTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value || 'N/A';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (amount: number, currency: string): string => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency || 'USD'} ${amount}`;
    }
  };

  const validateForm = (): string | null => {
    if (form.from.length !== 3) return 'Origin IATA code must be 3 letters.';
    if (form.to.length !== 3) return 'Destination IATA code must be 3 letters.';
    if (form.from === form.to) return 'Destination must be different from origin.';
    if (!form.departDate) return 'Departure date is required.';
    if (form.returnDate && form.returnDate < form.departDate) {
      return 'Return date must be on or after departure date.';
    }
    if (form.infants > form.adults) {
      return 'Infants cannot exceed number of adults.';
    }
    return null;
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSearched(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setFlights([]);
      return;
    }

    setLoading(true);
    setError(null);
    setFlights([]);

    try {
      const results = await searchFlights({
        from: form.from,
        to: form.to,
        departDate: form.departDate,
        returnDate: form.returnDate || undefined,
        adults: form.adults,
        children: form.children,
        infants: form.infants,
        cabinClass: form.cabinClass,
      });
      setFlights(results);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 429) {
          setError('Too many flight searches. Please wait a minute and try again.');
        } else {
          setError(err.message || 'Unable to search flights right now.');
        }
      } else {
        setError('Unable to search flights right now.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Flight Search"
        subtitle="Search live flights for itinerary planning and visa preparation."
      />

      <section className="py-10 border-b border-dashed border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Flights
              </CardTitle>
              <CardDescription>
                Enter IATA airport codes (example: UBN → NRT). Prices are live and may change before booking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from">From (IATA)</Label>
                    <Input
                      id="from"
                      value={form.from}
                      onChange={(e) => handleIataChange('from', e.target.value)}
                      placeholder="UBN"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to">To (IATA)</Label>
                    <Input
                      id="to"
                      value={form.to}
                      onChange={(e) => handleIataChange('to', e.target.value)}
                      placeholder="NRT"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departDate">Depart Date</Label>
                    <Input
                      id="departDate"
                      type="date"
                      value={form.departDate}
                      min={minDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, departDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="returnDate">Return Date (Optional)</Label>
                    <Input
                      id="returnDate"
                      type="date"
                      value={form.returnDate}
                      min={form.departDate || minDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, returnDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adults">Adults</Label>
                    <Input
                      id="adults"
                      type="number"
                      min={1}
                      max={9}
                      value={form.adults}
                      onChange={(e) => updateNumber('adults', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="children">Children</Label>
                    <Input
                      id="children"
                      type="number"
                      min={0}
                      max={9}
                      value={form.children}
                      onChange={(e) => updateNumber('children', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="infants">Infants</Label>
                    <Input
                      id="infants"
                      type="number"
                      min={0}
                      max={9}
                      value={form.infants}
                      onChange={(e) => updateNumber('infants', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cabinClass">Cabin Class</Label>
                    <select
                      id="cabinClass"
                      value={form.cabinClass}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, cabinClass: e.target.value as CabinClass }))
                      }
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {CABIN_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search Flights
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Prices are live and may change before booking.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {error && (
            <Card className="border-destructive/40 mb-6">
              <CardContent className="pt-6 text-destructive flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <p>{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && hasSearched && !error && flights.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-muted-foreground">
                No flights found for this search. Try different dates or airports.
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {flights.map((flight) => (
              <Card key={flight.id} className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      {flight.airline}
                    </span>
                    <span className="text-primary">{formatPrice(flight.price, flight.currency)}</span>
                  </CardTitle>
                  <CardDescription>
                    {flight.departure.iata || '-'} → {flight.arrival.iata || '-'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Departure</p>
                      <p className="font-medium">{formatDateTime(flight.departure.time)}</p>
                      <p className="text-xs text-muted-foreground">{flight.departure.city || flight.departure.iata}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Arrival</p>
                      <p className="font-medium">{formatDateTime(flight.arrival.time)}</p>
                      <p className="text-xs text-muted-foreground">{flight.arrival.city || flight.arrival.iata}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded bg-secondary">Duration: {flight.duration}</span>
                    <span className="px-2 py-1 rounded bg-secondary">
                      {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                      disabled={!flight.deep_link}
                    >
                      <a href={flight.deep_link || '#'} target="_blank" rel="noreferrer">
                        Book / View Offer
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Flight;
