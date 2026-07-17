import { NextResponse } from "next/server";
import airports from "@/data/airports.json";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export async function GET(request: Request) {
  const query = normalize(new URL(request.url).searchParams.get("q")?.trim() ?? "");
  if (query.length < 2) return NextResponse.json([]);
  const results = airports.map((airport) => {
    const fields = [airport.iata, airport.icao, airport.city, airport.name, airport.country].map(normalize);
    const starts = fields.some((field) => field.startsWith(query));
    const includes = fields.some((field) => field.includes(query));
    return { airport, score: starts ? 2 : includes ? 1 : 0 };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.airport.city.localeCompare(b.airport.city)).slice(0, 12).map(({ airport }) => ({ ...airport, label: `${airport.city ? `${airport.city} — ` : ""}${airport.name} (${airport.iata}), ${airport.country}` }));
  return NextResponse.json(results, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
