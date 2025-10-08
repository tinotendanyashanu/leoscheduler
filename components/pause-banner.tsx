"use client";
import { useSettings } from "@/hooks/use-settings";
import { AlertTriangle } from "lucide-react";

export function PauseBanner() {
  const pauseAll = useSettings(s => s.pauseAll);
  if (!pauseAll) return null;
  return (
    <div className="mb-3 rounded-md border bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200 px-3 py-2 flex items-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      Posting is paused. Scheduled items won't be sent until you unpause in Settings.
    </div>
  );
}