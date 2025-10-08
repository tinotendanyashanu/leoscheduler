"use client";
import { useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";

export function SettingsHydrator() {
  const hydrate = useSettings(s => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return null;
}