export type AirlineSupport = { baggageUrl: string; phone?: string; hours: string; label: string };

const support: Record<string, AirlineSupport> = {
  "air india": { label: "Air India baggage support", baggageUrl: "https://www.airindia.com/in/en/travel-information/baggage-guidelines/lost-delayed-damaged-baggage.html", hours: "Airport baggage desk hours vary by location" },
  "american airlines": { label: "American Airlines baggage support", baggageUrl: "https://www.aa.com/i18n/travel-info/baggage/delayed-or-damaged-baggage.jsp", hours: "Airport baggage desk hours vary by location" },
  "delta air lines": { label: "Delta baggage support", baggageUrl: "https://www.delta.com/us/en/baggage/delayed-lost-damaged-baggage", phone: "1-800-325-8224", hours: "Phone availability may vary; airport Baggage Service Office is recommended before leaving" },
  "united airlines": { label: "United baggage support", baggageUrl: "https://www.united.com/en/us/fly/travel/baggage/delayed-damaged-bags.html", hours: "Airport baggage desk hours vary by location" },
  "southwest airlines": { label: "Southwest baggage support", baggageUrl: "https://support.southwest.com/helpcenter/s/article/Damaged-lost-or-delayed-baggage", hours: "Airport baggage desk hours vary by location" },
  "jetblue": { label: "JetBlue baggage support", baggageUrl: "https://www.jetblue.com/help/delayed-damaged-or-lost-baggage", hours: "Airport baggage desk hours vary by location" },
  "air canada": { label: "Air Canada baggage support", baggageUrl: "https://www.aircanada.com/ca/en/aco/home/plan/baggage/delayed-damaged-baggage.html", hours: "Airport baggage desk hours vary by location" },
  "british airways": { label: "British Airways baggage support", baggageUrl: "https://www.britishairways.com/content/information/baggage-essentials/lost-and-damaged-baggage", hours: "Airport baggage desk hours vary by location" },
  "emirates": { label: "Emirates baggage support", baggageUrl: "https://www.emirates.com/us/english/before-you-fly/baggage/delayed-or-damaged-baggage/", hours: "Airport baggage desk hours vary by location" },
  "lufthansa": { label: "Lufthansa baggage support", baggageUrl: "https://www.lufthansa.com/us/en/baggage-irregularities", hours: "Airport baggage desk hours vary by location" },
  "qatar airways": { label: "Qatar Airways baggage support", baggageUrl: "https://www.qatarairways.com/en/baggage/mishandled.html", hours: "Airport baggage desk hours vary by location" },
  "turkish airlines": { label: "Turkish Airlines baggage support", baggageUrl: "https://www.turkishairlines.com/en-int/any-questions/lost-and-delayed-baggage/", hours: "Airport baggage desk hours vary by location" },
};

export function airlineSupport(airline: string) {
  return support[airline.trim().toLowerCase()] ?? {
    label: `${airline} official support`,
    baggageUrl: `https://www.google.com/search?q=${encodeURIComponent(`${airline} official delayed damaged baggage support`)}`,
    hours: "Contact the airline baggage desk at the arrival airport before leaving",
  };
}
