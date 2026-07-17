import type { Profile } from "./types";

export const demoProfile: Profile = {
  id: "demo",
  username: "alex",
  display_name: "Alex Morgan",
  headline: "Product designer · Detroit",
  bio: "I design simple, human products and help ambitious teams turn good ideas into useful experiences.",
  company: "Northstar Studio",
  location: "Detroit, Michigan",
  email: "hello@example.com",
  phone: "+13135550142",
  avatar_url: null,
  accent_color: "#FF5A36",
  is_published: true,
  links: [
    { id: "1", label: "My portfolio", url: "https://example.com", kind: "website", position: 0 },
    { id: "2", label: "Connect on LinkedIn", url: "https://linkedin.com", kind: "linkedin", position: 1 },
    { id: "3", label: "Book a conversation", url: "https://cal.com", kind: "calendar", position: 2 },
  ],
};
