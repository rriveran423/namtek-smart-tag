"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Languages } from "lucide-react";

type Language = "en" | "es" | "fr" | "de" | "pt";
const labels: Record<Language, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
};
const copy = {
  en: {
    verified: "VERIFIED TRAVEL TAG",
    found: "You found {name}'s luggage.",
    from: "FROM",
    to: "TO",
    connections: "CONNECTIONS",
    contact: "Contact the owner",
    call: "Call",
    text: "Text",
    email: "Email owner",
    alternate: "Alternate contact",
    privacy: "Please never share this traveler's information publicly.",
    help: "Help return this luggage",
    handoff: "Where is the luggage now?",
    still: "It is with me",
    airline: "Airline desk",
    airport: "Airport lost & found",
    hotel: "Hotel",
    police: "Police",
    other: "Other",
    location: "Exact location or desk name",
    name: "Your name (optional)",
    contactInfo: "Your email or phone (kept private)",
    note: "Message for the owner",
    submit: "Send secure recovery update",
    sending: "Sending…",
    saved: "Update sent. Continue in your private message thread.",
    error: "We could not send the update. Please try again.",
  },
  es: {
    verified: "ETIQUETA DE VIAJE VERIFICADA",
    found: "Encontraste el equipaje de {name}.",
    from: "DESDE",
    to: "HACIA",
    connections: "CONEXIONES",
    contact: "Contactar al propietario",
    call: "Llamar",
    text: "Mensaje",
    email: "Enviar correo",
    alternate: "Contacto alternativo",
    privacy: "Nunca compartas públicamente la información de este viajero.",
    help: "Ayuda a devolver este equipaje",
    handoff: "¿Dónde está el equipaje ahora?",
    still: "Está conmigo",
    airline: "Mostrador de aerolínea",
    airport: "Objetos perdidos del aeropuerto",
    hotel: "Hotel",
    police: "Policía",
    other: "Otro",
    location: "Ubicación exacta o nombre del mostrador",
    name: "Tu nombre (opcional)",
    contactInfo: "Tu correo o teléfono (privado)",
    note: "Mensaje para el propietario",
    submit: "Enviar actualización segura",
    sending: "Enviando…",
    saved: "Actualización enviada. Continúa en tu conversación privada.",
    error: "No pudimos enviar la actualización. Inténtalo de nuevo.",
  },
  fr: {
    verified: "ÉTIQUETTE DE VOYAGE VÉRIFIÉE",
    found: "Vous avez trouvé le bagage de {name}.",
    from: "DE",
    to: "VERS",
    connections: "CORRESPONDANCES",
    contact: "Contacter le propriétaire",
    call: "Appeler",
    text: "Message",
    email: "Envoyer un e-mail",
    alternate: "Autre contact",
    privacy: "Ne partagez jamais publiquement les informations de ce voyageur.",
    help: "Aidez à rendre ce bagage",
    handoff: "Où se trouve le bagage maintenant ?",
    still: "Il est avec moi",
    airline: "Comptoir de la compagnie",
    airport: "Objets trouvés de l'aéroport",
    hotel: "Hôtel",
    police: "Police",
    other: "Autre",
    location: "Lieu exact ou nom du comptoir",
    name: "Votre nom (facultatif)",
    contactInfo: "E-mail ou téléphone (privé)",
    note: "Message au propriétaire",
    submit: "Envoyer une mise à jour sécurisée",
    sending: "Envoi…",
    saved: "Mise à jour envoyée. Continuez dans votre conversation privée.",
    error: "Impossible d'envoyer la mise à jour. Réessayez.",
  },
  de: {
    verified: "VERIFIZIERTER REISEANHÄNGER",
    found: "Sie haben das Gepäck von {name} gefunden.",
    from: "VON",
    to: "NACH",
    connections: "VERBINDUNGEN",
    contact: "Besitzer kontaktieren",
    call: "Anrufen",
    text: "Nachricht",
    email: "E-Mail senden",
    alternate: "Alternativer Kontakt",
    privacy: "Bitte teilen Sie die Daten dieses Reisenden niemals öffentlich.",
    help: "Helfen Sie, dieses Gepäck zurückzugeben",
    handoff: "Wo ist das Gepäck jetzt?",
    still: "Es ist bei mir",
    airline: "Fluggesellschaftsschalter",
    airport: "Fundbüro am Flughafen",
    hotel: "Hotel",
    police: "Polizei",
    other: "Andere",
    location: "Genauer Ort oder Schaltername",
    name: "Ihr Name (optional)",
    contactInfo: "E-Mail oder Telefon (privat)",
    note: "Nachricht an den Besitzer",
    submit: "Sicheres Update senden",
    sending: "Wird gesendet…",
    saved: "Update gesendet. Fahren Sie in Ihrem privaten Chat fort.",
    error: "Das Update konnte nicht gesendet werden.",
  },
  pt: {
    verified: "ETIQUETA DE VIAGEM VERIFICADA",
    found: "Você encontrou a bagagem de {name}.",
    from: "DE",
    to: "PARA",
    connections: "CONEXÕES",
    contact: "Contatar o proprietário",
    call: "Ligar",
    text: "Mensagem",
    email: "Enviar e-mail",
    alternate: "Contato alternativo",
    privacy: "Nunca compartilhe publicamente as informações deste viajante.",
    help: "Ajude a devolver esta bagagem",
    handoff: "Onde está a bagagem agora?",
    still: "Está comigo",
    airline: "Balcão da companhia aérea",
    airport: "Achados e perdidos do aeroporto",
    hotel: "Hotel",
    police: "Polícia",
    other: "Outro",
    location: "Local exato ou nome do balcão",
    name: "Seu nome (opcional)",
    contactInfo: "E-mail ou telefone (privado)",
    note: "Mensagem para o proprietário",
    submit: "Enviar atualização segura",
    sending: "Enviando…",
    saved: "Atualização enviada. Continue na conversa privada.",
    error: "Não foi possível enviar. Tente novamente.",
  },
} as const;

type CopyKey = keyof typeof copy.en;
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (value: Language) => void;
}>({ language: "en", setLanguage: () => undefined });

export function FinderLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("namtek-language") as Language | null;
      const browser = navigator.language.slice(0, 2) as Language;
      setLanguage(saved && saved in labels ? saved : browser in labels ? browser : "en");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function change(value: Language) {
    setLanguage(value);
    localStorage.setItem("namtek-language", value);
    document.documentElement.lang = value;
  }
  return (
    <LanguageContext.Provider value={{ language, setLanguage: change }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function FinderLanguageSelector() {
  const { language, setLanguage } = useContext(LanguageContext);
  return (
    <label className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold">
      <Languages size={14} />
      <select
        aria-label="Language"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="bg-transparent outline-none"
      >
        {Object.entries(labels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FinderText({
  id,
  values,
}: {
  id: CopyKey;
  values?: Record<string, string>;
}) {
  const { language } = useContext(LanguageContext);
  let value: string = copy[language][id];
  for (const [key, replacement] of Object.entries(values ?? {}))
    value = value.replace(`{${key}}`, replacement);
  return <>{value}</>;
}

export function useFinderCopy() {
  const { language } = useContext(LanguageContext);
  return copy[language];
}
