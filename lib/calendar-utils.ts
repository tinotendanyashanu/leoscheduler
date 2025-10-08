import {
  addDays, startOfWeek, format,
  startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, isToday
} from "date-fns";

export function getWeekDays(base = new Date(), weekStartsOn: 1 | 0 = 1) {
  const start = startOfWeek(base, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i); // 08:00..20:00

export function labelDay(d: Date) {
  return format(d, "EEE dd");
}

/** Build a 6x7 month matrix (weeks × days) covering leading/trailing days. */
export function getMonthMatrix(base = new Date(), weekStartsOn: 1 | 0 = 1) {
  const start = startOfWeek(startOfMonth(base), { weekStartsOn });
  const end   = endOfWeek(endOfMonth(base),   { weekStartsOn });
  const allDays = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) weeks.push(allDays.slice(i, i + 7));
  return weeks; // always 5–6 rows
}

export function labelMonthYear(d: Date) {
  return format(d, "MMMM yyyy");
}

export { isSameMonth, isToday, format };