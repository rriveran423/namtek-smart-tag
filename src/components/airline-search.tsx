"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Plane } from "lucide-react";

const airlines = [
  ["Aer Lingus", "EI", "EIN"], ["Aeroméxico", "AM", "AMX"], ["Air Canada", "AC", "ACA"],
  ["Air China", "CA", "CCA"], ["Air Europa", "UX", "AEA"], ["Air France", "AF", "AFR"],
  ["Air India", "AI", "AIC"], ["Air New Zealand", "NZ", "ANZ"], ["Air Serbia", "JU", "ASL"],
  ["Air Transat", "TS", "TSC"], ["Alaska Airlines", "AS", "ASA"], ["All Nippon Airways", "NH", "ANA"],
  ["American Airlines", "AA", "AAL"], ["Asiana Airlines", "OZ", "AAR"], ["Austrian Airlines", "OS", "AUA"],
  ["Avianca", "AV", "AVA"], ["Azores Airlines", "S4", "RZO"], ["Breeze Airways", "MX", "MXY"],
  ["British Airways", "BA", "BAW"], ["Brussels Airlines", "SN", "BEL"], ["Cathay Pacific", "CX", "CPA"],
  ["Cebu Pacific", "5J", "CEB"], ["China Airlines", "CI", "CAL"], ["China Eastern Airlines", "MU", "CES"],
  ["China Southern Airlines", "CZ", "CSN"], ["Condor", "DE", "CFG"], ["Copa Airlines", "CM", "CMP"],
  ["Delta Air Lines", "DL", "DAL"], ["easyJet", "U2", "EZY"], ["EL AL", "LY", "ELY"],
  ["Emirates", "EK", "UAE"], ["Ethiopian Airlines", "ET", "ETH"], ["Etihad Airways", "EY", "ETD"],
  ["EVA Air", "BR", "EVA"], ["Fiji Airways", "FJ", "FJI"], ["Finnair", "AY", "FIN"],
  ["Flair Airlines", "F8", "FLE"], ["Frontier Airlines", "F9", "FFT"], ["Garuda Indonesia", "GA", "GIA"],
  ["GOL Airlines", "G3", "GLO"], ["Gulf Air", "GF", "GFA"], ["Hainan Airlines", "HU", "CHH"],
  ["Hawaiian Airlines", "HA", "HAL"], ["Iberia", "IB", "IBE"], ["Icelandair", "FI", "ICE"],
  ["IndiGo", "6E", "IGO"], ["ITA Airways", "AZ", "ITY"], ["Japan Airlines", "JL", "JAL"],
  ["JetBlue", "B6", "JBU"], ["Jetstar", "JQ", "JST"], ["Kenya Airways", "KQ", "KQA"],
  ["KLM", "KL", "KLM"], ["Korean Air", "KE", "KAL"], ["LATAM Airlines", "LA", "LAN"],
  ["LOT Polish Airlines", "LO", "LOT"], ["Lufthansa", "LH", "DLH"], ["Malaysia Airlines", "MH", "MAS"],
  ["Norse Atlantic Airways", "N0", "NBT"], ["Norwegian", "DY", "NOZ"], ["Oman Air", "WY", "OMA"],
  ["Philippine Airlines", "PR", "PAL"], ["Porter Airlines", "PD", "POE"], ["Qantas", "QF", "QFA"],
  ["Qatar Airways", "QR", "QTR"], ["Royal Air Maroc", "AT", "RAM"], ["Royal Jordanian", "RJ", "RJA"],
  ["Ryanair", "FR", "RYR"], ["Saudia", "SV", "SVA"], ["Scandinavian Airlines", "SK", "SAS"],
  ["Singapore Airlines", "SQ", "SIA"], ["South African Airways", "SA", "SAA"], ["Southwest Airlines", "WN", "SWA"],
  ["Spirit Airlines", "NK", "NKS"], ["SriLankan Airlines", "UL", "ALK"], ["Sun Country Airlines", "SY", "SCX"],
  ["SWISS", "LX", "SWR"], ["TAP Air Portugal", "TP", "TAP"], ["Thai Airways", "TG", "THA"],
  ["Turkish Airlines", "TK", "THY"], ["United Airlines", "UA", "UAL"], ["Vietnam Airlines", "VN", "HVN"],
  ["Virgin Atlantic", "VS", "VIR"], ["Virgin Australia", "VA", "VOZ"], ["Volaris", "Y4", "VOI"],
  ["Vueling", "VY", "VLG"], ["WestJet", "WS", "WJA"], ["Wizz Air", "W6", "WZZ"],
] as const;

export function AirlineSearch({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return airlines.slice(0, 12);
    return airlines.filter(([name, iata, icao]) => `${name} ${iata} ${icao}`.toLowerCase().includes(query)).slice(0, 12);
  }, [value]);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={root} className="relative">
      <label className="text-sm font-bold">
        Airline
        <div className="relative mt-2">
          <Plane size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35" />
          <input name="airline" value={value} onChange={(event) => { setValue(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} autoComplete="off" placeholder="Search airline name, IATA or ICAO code" className="w-full rounded-xl border border-black/15 bg-white py-3 pl-11 pr-4 outline-none focus:border-[#ff5a36]" />
        </div>
      </label>
      {open && (
        <div className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-black/10 bg-white p-2 shadow-2xl">
          {results.map(([name, iata, icao]) => (
            <button key={iata} type="button" onClick={() => { setValue(name); setOpen(false); }} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-[#eef4ff]">
              <span className="min-w-10 rounded-lg bg-[#2463eb] px-2 py-1 text-center text-xs font-extrabold text-white">{iata}</span>
              <span><span className="block text-sm font-bold">{name}</span><span className="block text-xs text-black/40">IATA {iata} · ICAO {icao}</span></span>
            </button>
          ))}
          {results.length === 0 && <p className="p-3 text-sm leading-6 text-black/45">No suggestion found. You may keep the airline name you typed.</p>}
        </div>
      )}
      <p className="mt-2 text-xs text-black/40">Search worldwide airlines by name or code. You can also enter an airline manually.</p>
    </div>
  );
}
