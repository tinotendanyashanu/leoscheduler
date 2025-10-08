"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePosts } from "@/hooks/use-posts";
import { useSettings } from "@/hooks/use-settings";
import { combineDateTimeToUTCISO } from "@/lib/utils";

export function QuickAdd({
  dateAtSlot,
  defaultTime,
  children,
}: {
  dateAtSlot: Date;
  defaultTime?: string;
  children: React.ReactNode; // the grid cell (acts as trigger)
}) {
  const { addPostViaApi } = usePosts();
  const { defaultTime: cfgTime } = useSettings();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [time, setTime] = React.useState(defaultTime ?? cfgTime ?? "09:00");

  async function save(kind: "draft" | "schedule") {
    if (!text.trim()) return;
    await addPostViaApi({
      content: text.trim(),
      status: kind === "schedule" ? "scheduled" : "draft",
      scheduledFor: kind === "schedule" ? combineDateTimeToUTCISO(dateAtSlot, time) : null,
    });
    setText("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-3" side="right" align="start">
        <div className="space-y-2">
          <Textarea
            placeholder="What's happening?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground w-14">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-9 w-[120px] rounded-md border bg-background px-2 text-sm"
              aria-label="Schedule time"
            />
            <span className="text-xs text-muted-foreground">Europe/Warsaw</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => save("draft")}>
              Draft
            </Button>
            <Button className="flex-1" onClick={() => save("schedule")}>
              Schedule
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}