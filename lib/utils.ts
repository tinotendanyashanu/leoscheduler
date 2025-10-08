import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function combineDateTimeToUTCISO(date: Date | null, timeHHmm: string | null) {
  if (!date) return null;
  const [hh = "09", mm = "00"] = (timeHHmm ?? "09:00").split(":");
  const local = new Date(date);
  local.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
  return new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString();
}

export const MAX_TWEET = 280; // simple local limit
