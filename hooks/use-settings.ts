import { create } from "zustand";

type Settings = {
  pauseAll: boolean;
  timezone: string;      // e.g., "Europe/Warsaw"
  defaultTime: string;   // "HH:mm"
  displayName: string;   // "LeoScheduler"
  handle: string;        // "@leoscheduler"
  setPauseAll: (v: boolean) => void;
  setTimezone: (tz: string) => void;
  setDefaultTime: (t: string) => void;
  setProfile: (name: string, handle: string) => void;
  hydrate: () => void;   // load from localStorage
};

const KEY = "leoscheduler:settings";

export const useSettings = create<Settings>((set, get) => ({
  pauseAll: false,
  timezone: "Europe/Warsaw",
  defaultTime: "09:00",
  displayName: "LeoScheduler",
  handle: "@leoscheduler",

  setPauseAll: (v) => {
    set({ pauseAll: v });
    save();
  },
  setTimezone: (tz) => {
    set({ timezone: tz });
    save();
  },
  setDefaultTime: (t) => {
    set({ defaultTime: t });
    save();
  },
  setProfile: (name, handle) => {
    set({ displayName: name, handle });
    save();
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      set({ ...get(), ...obj });
    } catch {}
  },
}));

function save() {
  if (typeof window === "undefined") return;
  const s = useSettings.getState();
  const { pauseAll, timezone, defaultTime, displayName, handle } = s;
  localStorage.setItem(
    KEY,
    JSON.stringify({ pauseAll, timezone, defaultTime, displayName, handle })
  );
}