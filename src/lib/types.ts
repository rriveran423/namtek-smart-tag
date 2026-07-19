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
  flight_number: string | null;
  flight_date: string | null;
  baggage_report_number: string | null;
  airline_bag_tag_number: string | null;
  checked_bag_count: number;
  tracker_type: "apple_find_my" | "google_find_hub" | "other" | null;
  tracker_url: string | null;
  recovery_packet_enabled: boolean;
  recovery_share_code: string;
  show_direct_contact: boolean;
  notification_email: string | null;
  notification_sms_phone: string | null;
  notify_by_email: boolean;
  notify_by_sms: boolean;
  tag_scans?: TagScan[];
  recovery_cases?: RecoveryCase[];
  tag_trips?: TagTrip[];
};

export type TripEvent = {
  id: number;
  event_type: string;
  title: string;
  detail: string | null;
  source: "customer" | "flight_provider" | "automation" | "finder";
  event_at: string;
};

export type TagTrip = {
  id: string;
  tag_id: string;
  airline: string;
  flight_number: string;
  flight_date: string;
  origin: string;
  destination: string;
  status: "submitted" | "scheduled" | "delayed" | "in_flight" | "landed" | "collected" | "lost" | "archived_unconfirmed";
  provider_status: string | null;
  scheduled_departure: string | null;
  actual_departure: string | null;
  scheduled_arrival: string | null;
  actual_arrival: string | null;
  arrival_terminal: string | null;
  arrival_gate: string | null;
  baggage_claim: string | null;
  airline_bag_tag_number: string | null;
  checked_bag_count: number;
  issue_type: "missing" | "damaged" | null;
  reminder_count: number;
  completed_at: string | null;
  archived_at: string | null;
  created_at: string;
  trip_events?: TripEvent[];
};

export type TagScan = {
  id: number;
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
  created_at: string;
};

export type RecoveryMessage = {
  id: number;
  sender_role: "finder" | "owner";
  body: string;
  created_at: string;
};

export type RecoveryCase = {
  id: string;
  finder_name: string | null;
  finder_contact: string | null;
  finder_email: string | null;
  finder_notify_by_email: boolean;
  finder_reply_code: string;
  handoff_type: "still_with_me" | "airline" | "airport_lost_found" | "hotel" | "police" | "other";
  handoff_location: string | null;
  finder_note: string | null;
  status: "open" | "contacted" | "pickup_arranged" | "recovered" | "closed";
  created_at: string;
  updated_at: string;
  recovery_messages?: RecoveryMessage[];
};
