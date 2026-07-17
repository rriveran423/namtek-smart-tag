"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Plane, Plus, X } from "lucide-react";

type Airport = {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  label: string;
};

function useAirportResults(query: string) {
  const [results, setResults] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `/api/airports?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        setResults(await response.json());
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  return { results, setResults, loading };
}

export function AirportSearch({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const { results, setResults, loading } = useAirportResults(query);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={root} className="relative">
      <label className="text-sm font-bold">
        {label}
        <div className="relative mt-2">
          <Plane
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setValue(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="w-full rounded-xl border border-black/15 bg-white py-3 pl-11 pr-4 outline-none focus:border-[#ff5a36]"
            placeholder={placeholder}
            autoComplete="off"
          />
          <input type="hidden" name={name} value={value} />
        </div>
      </label>
      {open && query.length >= 2 && (
        <div className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-black/10 bg-white p-2 shadow-2xl">
          {loading && (
            <p className="p-3 text-sm text-black/40">
              Searching worldwide airports…
            </p>
          )}
          {!loading && results.length === 0 && (
            <p className="p-3 text-sm text-black/40">
              No airport found. Keep your typed location if needed.
            </p>
          )}
          {results.map((airport) => (
            <button
              key={`${airport.icao}-${airport.iata}`}
              type="button"
              onClick={() => {
                setValue(airport.label);
                setQuery(airport.label);
                setResults([]);
                setOpen(false);
              }}
              className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-[#eef4ff]"
            >
              <span className="rounded-lg bg-[#2463eb] px-2 py-1 text-xs font-extrabold text-white">
                {airport.iata}
              </span>
              <span>
                <span className="block text-sm font-bold">
                  {airport.city || airport.name}
                </span>
                <span className="block text-xs leading-5 text-black/45">
                  {airport.name} · {airport.country}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AirportStops({ defaultValue }: { defaultValue: string[] }) {
  const [stops, setStops] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { results, setResults, loading } = useAirportResults(query);
  function add(label: string) {
    if (!stops.includes(label)) setStops([...stops, label]);
    setQuery("");
    setResults([]);
    setOpen(false);
  }
  return (
    <div className="sm:col-span-2">
      <label className="text-sm font-bold">
        Stops / connections
        <div className="relative mt-2">
          <MapPin
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && query.trim()) {
                event.preventDefault();
                add(query.trim());
              }
            }}
            className="w-full rounded-xl border border-black/15 bg-white py-3 pl-11 pr-12 outline-none focus:border-[#ff5a36]"
            placeholder="Search a city or airport, then add it"
            autoComplete="off"
          />
          <button
            type="button"
            aria-label="Add typed stop"
            onClick={() => query.trim() && add(query.trim())}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#171713] p-1.5 text-white"
          >
            <Plus size={15} />
          </button>
        </div>
      </label>
      <input type="hidden" name="route_stops" value={stops.join("|||")} />
      {open && query.length >= 2 && (
        <div className="relative z-30">
          <div className="absolute mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-black/10 bg-white p-2 shadow-2xl">
            {loading && (
              <p className="p-3 text-sm text-black/40">
                Searching worldwide airports…
              </p>
            )}
            {results.map((airport) => (
              <button
                key={`${airport.icao}-${airport.iata}`}
                type="button"
                onClick={() => add(airport.label)}
                className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-[#eef4ff]"
              >
                <span className="rounded-lg bg-[#2463eb] px-2 py-1 text-xs font-extrabold text-white">
                  {airport.iata}
                </span>
                <span>
                  <span className="block text-sm font-bold">
                    {airport.city || airport.name}
                  </span>
                  <span className="block text-xs text-black/45">
                    {airport.name} · {airport.country}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {stops.map((stop) => (
          <span
            key={stop}
            className="flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-2 text-xs font-bold text-[#2454a6]"
          >
            {stop}
            <button
              type="button"
              aria-label={`Remove ${stop}`}
              onClick={() => setStops(stops.filter((item) => item !== stop))}
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-black/40">
        Domestic and international airports are included. Add as many
        connections as needed.
      </p>
    </div>
  );
}
