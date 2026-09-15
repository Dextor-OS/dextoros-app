"use client";

import { useEffect } from "react";
import { getFleetSource } from "@/lib/api";

/** Starts the fleet stream once the app shell mounts and stops it on unmount. */
export function FleetProvider() {
  useEffect(() => {
    const source = getFleetSource();
    source.start();
    return source.stop;
  }, []);
  return null;
}
