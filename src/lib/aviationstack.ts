type AviationFlight = {
  flight_status?: string;
  flight?: { iata?: string; icao?: string };
  airline?: { name?: string; iata?: string };
  departure?: { airport?: string; iata?: string; scheduled?: string; actual?: string };
  arrival?: { airport?: string; iata?: string; scheduled?: string; actual?: string; terminal?: string; gate?: string; baggage?: string };
};

const airportCode = (value: string) => {
  const parenthesized = value.match(/\(([A-Z]{3})\)/i)?.[1];
  if (parenthesized) return parenthesized.toUpperCase();
  return value.match(/\b([A-Z]{3})\b/i)?.[1]?.toUpperCase();
};

export async function getFlightStatus(input: {
  flightNumber: string;
  flightDate: string;
  origin: string;
  destination: string;
}) {
  const key = process.env.AVIATIONSTACK_API_KEY;
  if (!key) throw new Error("AVIATIONSTACK_API_KEY is not configured");
  const flightIata = input.flightNumber.replace(/\s+/g, "").toUpperCase();
  const query = new URLSearchParams({ access_key: key, flight_iata: flightIata });
  const response = await fetch(`https://api.aviationstack.com/v1/flights?${query}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Aviationstack request failed (${response.status})`);
  const payload = (await response.json()) as { data?: AviationFlight[]; error?: { message?: string } };
  if (payload.error) throw new Error(payload.error.message || "Aviationstack returned an error");
  const origin = airportCode(input.origin);
  const destination = airportCode(input.destination);
  const candidates = payload.data ?? [];
  const flight = candidates.find((item) => {
    const scheduledDate = item.departure?.scheduled?.slice(0, 10);
    return (!origin || item.departure?.iata === origin) && (!destination || item.arrival?.iata === destination) && (!scheduledDate || scheduledDate === input.flightDate);
  }) ?? candidates[0];
  if (!flight) return null;
  return {
    providerStatus: flight.flight_status ?? "unknown",
    providerFlightId: flight.flight?.iata ?? flight.flight?.icao ?? flightIata,
    scheduledDeparture: flight.departure?.scheduled ?? null,
    actualDeparture: flight.departure?.actual ?? null,
    scheduledArrival: flight.arrival?.scheduled ?? null,
    actualArrival: flight.arrival?.actual ?? null,
    arrivalTerminal: flight.arrival?.terminal ?? null,
    arrivalGate: flight.arrival?.gate ?? null,
    baggageClaim: flight.arrival?.baggage ?? null,
  };
}

export function journeyStatus(providerStatus: string, actualDeparture: string | null, actualArrival: string | null) {
  if (actualArrival || providerStatus === "landed") return "landed" as const;
  if (actualDeparture || providerStatus === "active") return "in_flight" as const;
  if (providerStatus === "delayed") return "delayed" as const;
  return "scheduled" as const;
}
