"use client";

import { useTrack } from "@insyte/track/react";

export function TrackDemoButton() {
  const track = useTrack();

  return (
    <button
      type="button"
      onClick={() =>
        track("demo_button_clicked", {
          source: "homepage",
          timestamp: new Date().toISOString(),
        })
      }
      className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
    >
      Track analytics event
    </button>
  );
}
