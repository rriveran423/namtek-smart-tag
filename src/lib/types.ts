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
  nickname: string | null;
  luggage_type: string | null;
  luggage_brand: string | null;
  luggage_color: string | null;
  luggage_notes: string | null;
  bag_photo_url: string | null;
  traveler_photo_url: string | null;
  show_bag_photo: boolean;
  show_traveler_photo: boolean;
  airline: string | null;
  route_origin: string | null;
  route_destination: string | null;
  route_stops: string[];
  trip_type: "vacation" | "business" | "emergency" | "other";
  tag_scans?: TagScan[];
};

export type TagScan = {
  id: number;
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
  created_at: string;
};
