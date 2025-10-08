"use client";

import * as React from "react";
import {
  getMonthMatrix, labelMonthYear, isSameMonth, isToday, format
} from "@/lib/calendar-utils";
import { QuickAdd } from "./quick-add";
import { usePosts } from "@/hooks/use-posts";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, startOfMonth } from "date-fns";

export function MonthGrid() {
  const [base, setBase] = React.useState<Date>(startOfMonth(new Date()));
  const { posts } = usePosts();
  const { defaultTime: cfgTime } = useSettings();

  const weeks = getMonthMatrix(base, 1); // Monday-start

  // Helper to collect scheduled posts per day
  function itemsOnDay(day: Date) {
    return posts.filter(p => {
      if (!p.runAtUTC) return false;
      const t = new Date(p.runAtUTC);
      return (
        t.getFullYear() === day.getFullYear() &&
        t.getMonth() === day.getMonth() &&
        t.getDate() === day.getDate()
      );
    });
  }

  return (
    <div className="space-y-3">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{labelMonthYear(base)}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setBase(addMonths(base, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setBase(startOfMonth(new Date()))}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => setBase(addMonths(base, +1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 text-xs text-muted-foreground">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className="px-2 py-2">{d}</div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-[1px] bg-border rounded-lg overflow-hidden">
        {weeks.map((week, i) => (
          <React.Fragment key={i}>
            {week.map((day) => {
              const outside = !isSameMonth(day, base);
              const today   = isToday(day);
              const items   = itemsOnDay(day);

              return (
                <QuickAdd key={day.toISOString()} dateAtSlot={day} defaultTime={cfgTime}>
                  <div
                    className={`
                      min-h-[110px] bg-background p-2 relative text-left hover:bg-muted/30 transition
                      ${outside ? "opacity-50" : ""}
                      ${today ? "ring-2 ring-primary" : ""}
                    `}
                  >
                    {/* Day number */}
                    <div className="text-xs font-medium">{format(day, "d")}</div>

                    {/* Pills preview */}
                    <div className="mt-2 space-y-1 pointer-events-none">
                      {items.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="text-[10px] leading-tight px-2 py-1 rounded bg-primary/10 border border-primary/20 line-clamp-1"
                          title={p.text}
                        >
                          {p.text}
                        </div>
                      ))}
                      {items.length > 3 ? (
                        <div className="text-[10px] text-muted-foreground">
                          +{items.length - 3} more
                        </div>
                      ) : null}
                    </div>
                  </div>
                </QuickAdd>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}