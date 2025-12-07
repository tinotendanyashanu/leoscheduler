import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function combineDateTimeToLocalISO(date: Date | null, timeHHmm: string | null) {
  if (!date) return null;
  const [hh = "09", mm = "00"] = (timeHHmm ?? "09:00").split(":");
  const local = new Date(date);
  local.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
  
  // Return YYYY-MM-DDTHH:mm:ss.sss
  // We use sv-SE locale trick or manual formatting to ensure YYYY-MM-DD format, or just string manipulation
  // Safer:
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day = String(local.getDate()).padStart(2, '0');
  const hour = String(local.getHours()).padStart(2, '0');
  const minute = String(local.getMinutes()).padStart(2, '0');
  const second = String(local.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000`;
}

export const MAX_TWEET = 280; // simple local limit
