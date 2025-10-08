"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { usePosts } from "@/hooks/use-posts";
import { useSettings } from "@/hooks/use-settings";
import { MAX_TWEET, combineDateTimeToUTCISO, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";

type Step = { id: string; text: string };

export function ComposeDialog() {
  const { addPostViaApi } = usePosts();
  const { pauseAll, defaultTime: cfgTime, timezone } = useSettings();

  const [open, setOpen] = React.useState(false);
  const [isThread, setIsThread] = React.useState(false);
  const [steps, setSteps] = React.useState<Step[]>([{ id: crypto.randomUUID(), text: "" }]);
  const [date, setDate] = React.useState<Date | undefined>(addDays(new Date(), 1));
  const [time, setTime] = React.useState(cfgTime || "09:00");
  const [mode, setMode] = React.useState<"draft" | "schedule">("schedule");

  const activeCount = steps.reduce((sum, s) => sum + s.text.length, 0);
  const overLimit = steps.some((s) => s.text.length > MAX_TWEET);

  function addStep() {
    setSteps((prev) => [...prev, { id: crypto.randomUUID(), text: "" }]);
    setIsThread(true);
  }
  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
    if (steps.length - 1 <= 1) setIsThread(false);
  }
  function moveStep(i: number, dir: -1 | 1) {
    setSteps((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function onSave(kind: "draft" | "schedule") {
    const body = steps.map((s) => s.text.trim()).filter(Boolean);
    if (body.length === 0) return; // nothing to save

    const content = isThread ? body[0] : body[0]; // For now store first step in card; thread count shows on card
    const scheduledFor = kind === "schedule" ? combineDateTimeToUTCISO(date!, time) : null;

    await addPostViaApi({
      content,
      status: kind === "schedule" ? "scheduled" : "draft",
      scheduledFor,
      threadOrder: isThread ? body.length : 0,
    });

    setOpen(false);
    // reset
    setIsThread(false);
    setSteps([{ id: crypto.randomUUID(), text: "" }]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ New Post</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Compose</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Thread steps */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={isThread ? "default" : "secondary"}>
                {isThread ? `${steps.length} steps` : "Single"}
              </Badge>
              <div className={cn("text-xs ml-auto", overLimit ? "text-red-500" : "text-muted-foreground")}>
                {activeCount} chars total
              </div>
            </div>

            {steps.map((s, i) => (
              <Card key={s.id} className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Step {i + 1}</span>
                  <span className={s.text.length > MAX_TWEET ? "text-red-500" : ""}>
                    {s.text.length} / {MAX_TWEET}
                  </span>
                </div>
                <Textarea
                  value={s.text}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSteps((prev) => prev.map((p, idx) => (idx === i ? { ...p, text: v } : p)));
                  }}
                  placeholder={i === 0 ? "What's happening?" : "Add next step…"}
                  rows={i === 0 ? 4 : 3}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => moveStep(i, -1)} disabled={i === 0}>↑</Button>
                  <Button variant="ghost" size="sm" onClick={() => moveStep(i, +1)} disabled={i === steps.length - 1}>↓</Button>
                  <Button variant="destructive" size="sm" onClick={() => removeStep(i)} disabled={steps.length === 1}>
                    Remove
                  </Button>
                </div>
              </Card>
            ))}

            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={addStep}>Add step</Button>
              <div className="text-xs text-muted-foreground">
                Tip: Each step posts as a reply in a thread.
              </div>
            </div>
          </div>

          {/* Right: Schedule */}
          <div className="space-y-3">
            <Card className="p-3 space-y-3">
              <div className="text-sm font-medium">Schedule</div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setDate(d)}
                className="rounded-md border"
              />
              <div className="flex items-center gap-2">
                <label className="text-sm w-16 text-muted-foreground">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-9 w-[140px] rounded-md border bg-background px-2 text-sm"
                  aria-label="Schedule time"
                />
                <span className="text-xs text-muted-foreground">{timezone}</span>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => onSave("draft")}
                disabled={steps.every(s => !s.text.trim())}
              >
                Save Draft
              </Button>
              <Button
                className="flex-1"
                onClick={() => onSave("schedule")}
                disabled={!date || steps.every(s => !s.text.trim()) || overLimit}
                title={pauseAll ? "Posting is paused; scheduled items won't send until unpaused." : undefined}
              >
                Schedule
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}