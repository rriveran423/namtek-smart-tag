"use client";

import { Trash2 } from "lucide-react";
import { clearLuggageJourney } from "@/app/dashboard/actions";

export function ClearJourneyForm({ tripId, tagCode }: { tripId: string; tagCode: string }) {
  return (
    <form
      action={clearLuggageJourney}
      className="mt-4"
      onSubmit={(event) => {
        const proceed = window.confirm(
          "Proceed with clearing this journey?\n\nThe existing flight tracking and its entire audit trail will be permanently deleted. It will not be saved in Journey History. This cannot be undone."
        );
        if (!proceed) event.preventDefault();
      }}
    >
      <input type="hidden" name="trip_id" value={tripId} />
      <input type="hidden" name="tag_code" value={tagCode} />
      <button className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100">
        <Trash2 size={15} /> Clear current journey
      </button>
    </form>
  );
}
