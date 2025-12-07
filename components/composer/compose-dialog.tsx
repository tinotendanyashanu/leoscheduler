"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Image as ImageIcon, Plus, X, Send, Save } from "lucide-react";
import { usePosts } from "@/hooks/use-posts";
import { useSettings } from "@/hooks/use-settings";
import { MAX_TWEET, combineDateTimeToLocalISO, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type Step = { id: string; text: string };

export function ComposeDialog() {
  const { addPostViaApi } = usePosts();
  const { pauseAll, defaultTime: cfgTime, timezone } = useSettings();

  const [open, setOpen] = React.useState(false);
  const [steps, setSteps] = React.useState<Step[]>([{ id: crypto.randomUUID(), text: "" }]);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [time, setTime] = React.useState(cfgTime || "09:00");

  // Reset state when opening
  React.useEffect(() => {
    if (open) {
      setSteps([{ id: crypto.randomUUID(), text: "" }]);
      setDate(undefined);
      setTime(cfgTime || "09:00");
    }
  }, [open, cfgTime]);

  const activeCount = steps.reduce((sum, s) => sum + s.text.length, 0);
  const overLimit = steps.some((s) => s.text.length > MAX_TWEET);
  const isThread = steps.length > 1;

  function addStep() {
    setSteps((prev) => [...prev, { id: crypto.randomUUID(), text: "" }]);
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSave(kind: "draft" | "schedule") {
    const body = steps.map((s) => s.text.trim()).filter(Boolean);
    if (body.length === 0) return;

    const content = body[0];
    // If scheduling, use date. If "Post Now" (kind=schedule but no date), use null.
    const scheduledFor = (kind === "schedule" && date) ? combineDateTimeToLocalISO(date, time) : null;
    
    // Determine status: 
    // - draft -> 'draft'
    // - schedule + date -> 'scheduled'
    // - schedule + no date -> 'sending' (immediate post)
    let status = "draft";
    if (kind === "schedule") {
      status = date ? "scheduled" : "sending";
    }

    await addPostViaApi({
      content,
      status: status as any,
      scheduledFor,
      timezone,
      threadOrder: isThread ? body.length : 0,
    });

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>Compose</span>
            <div className={cn("text-xs font-normal", overLimit ? "text-red-500" : "text-muted-foreground")}>
              {activeCount} characters
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="relative">
            {/* Thread connector line */}
            {isThread && (
              <div className="absolute left-[20px] top-4 bottom-12 w-0.5 bg-border -z-10" />
            )}

            {steps.map((s, i) => (
              <div key={s.id} className="flex gap-3 mb-4 group relative">
                <div className="flex flex-col items-center gap-2 pt-1">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 border z-10">
                    <span className="text-xs font-medium text-muted-foreground">{i + 1}</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={s.text}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSteps((prev) => prev.map((p, idx) => (idx === i ? { ...p, text: v } : p)));
                    }}
                    placeholder={i === 0 ? "What's happening?" : "Add another tweet..."}
                    className="min-h-[100px] resize-none text-base border-none focus-visible:ring-0 p-0 shadow-none"
                  />
                  
                  {/* Media Placeholder */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/70 hover:text-primary hover:bg-primary/10">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <div className="text-xs text-muted-foreground ml-auto">
                      <span className={s.text.length > MAX_TWEET ? "text-red-500 font-bold" : ""}>
                        {s.text.length}
                      </span>
                      <span className="opacity-50"> / {MAX_TWEET}</span>
                    </div>
                  </div>

                  {/* Remove button for thread items */}
                  {i > 0 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeStep(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {i < steps.length - 1 && <Separator className="my-4" />}
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="ml-12 text-primary hover:text-primary/80 hover:bg-primary/10" onClick={addStep}>
            <Plus className="h-4 w-4 mr-2" /> Add to thread
          </Button>
        </div>

        <div className="p-4 border-t bg-muted/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2", date ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground")}>
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "MMM d") : "Schedule"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2", time ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground")}>
                  <Clock className="h-4 w-4" />
                  {time}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" align="start">
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="flex-1 h-9 rounded-md border bg-background px-2 text-sm"
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Timezone: {timezone}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onSave("draft")} disabled={steps.every(s => !s.text.trim())}>
              Save Draft
            </Button>
            <Button 
              onClick={() => onSave("schedule")} 
              disabled={steps.every(s => !s.text.trim()) || overLimit}
              className="gap-2"
            >
              {date ? "Schedule" : "Post"} 
              {date ? <Clock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}