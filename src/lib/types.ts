export type TravelTag = {
  id: string;
  public_code: string;
  status: "unclaimed" | "active" | "lost" | "disabled";
  traveler_name: string | null;
  finder_message: string;
  public_email: string | null;
  public_phone: string | null;
  alternate_name: string | null;
  alternate_phone: string | null;
  preferred_language: string;
  reward_message: string | null;
  tag_scans?: TagScan[];
};

export type TagScan = {
  id: number;
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
  created_at: string;
};
