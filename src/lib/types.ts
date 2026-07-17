export type LinkItem = {
  id: string;
  label: string;
  url: string;
  kind: string;
  position: number;
};

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  accent_color: string;
  is_published: boolean;
  links?: LinkItem[];
};
