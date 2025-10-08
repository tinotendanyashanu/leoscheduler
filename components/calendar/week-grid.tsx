"use client";

import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
import { getWeekDays, HOURS, labelDay } from "@/lib/calendar-utils";
import { QuickAdd } from "./quick-add";
import { usePosts } from "@/hooks/use-posts";

export function WeekGrid({ base = new Date() }: { base?: Date }) {
  const week = getWeekDays(base, 1); // Monday-start
  const { posts } = usePosts();

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="grid" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
        <div className="bg-muted/40 p-2 text-xs font-medium">Time</div>
        {week.map((d) => (
          <div key={d.toISOString()} className="bg-muted/40 p-2 text-xs font-medium text-center">
            {labelDay(d)}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="grid" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
        {/* Time labels + day columns */}
        {HOURS.map((h) => (
          <React.Fragment key={h}>
            {/* time gutter */}
            <div className="border-t text-xs text-muted-foreground p-2">{String(h).padStart(2, "0")}:00</div>
            {/* 7 day cells */}
            {week.map((d) => {
              const slotDate = setMinutes(setHours(new Date(d), h), 0);
              const key = d.toDateString() + "-" + h;

              // render any scheduled posts that fall into this hour (simple grouping)
              const itemsHere = posts.filter((p) => {
                if (!p.runAtUTC) return false;
                const t = new Date(p.runAtUTC);
                return (
                  t.getFullYear() === slotDate.getFullYear() &&
                  t.getMonth() === slotDate.getMonth() &&
                  t.getDate() === slotDate.getDate() &&
                  t.getHours() === slotDate.getHours()
                );
              });

              return (
                <QuickAdd key={key} dateAtSlot={slotDate} defaultTime={format(slotDate, "HH:mm")}>
                  <button
                    className="border-t border-l w-full h-16 text-left relative group hover:bg-muted/30 transition"
                    title="Click to quick-schedule"
                  >
                    {/* scheduled items preview pills */}
                    <div className="absolute inset-1 flex flex-col gap-1 pointer-events-none">
                      {itemsHere.slice(0, 2).map((p) => (
                        <div
                          key={p.id}
                          className="text-[10px] leading-tight px-2 py-1 rounded bg-primary/10 border border-primary/20 line-clamp-1"
                        >
                          {p.text}
                        </div>
                      ))}
                      {itemsHere.length > 2 ? (
                        <div className="text-[10px] text-muted-foreground">+{itemsHere.length - 2} more</div>
                      ) : null}
                    </div>
                  </button>
                </QuickAdd>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}