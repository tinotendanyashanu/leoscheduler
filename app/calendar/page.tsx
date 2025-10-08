"use client";
import { useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { PauseBanner } from "@/components/pause-banner";
import { getSession } from "@/lib/api";
import { usePosts } from "@/hooks/use-posts";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeekGrid } from "@/components/calendar/week-grid";
import { MonthGrid } from "@/components/calendar/month-grid";

export default function CalendarPage() {
  const loadFromApi = usePosts(s => s.loadFromApi);

  useEffect(() => {
    if (getSession()) {
      loadFromApi().catch(console.error);
    }
  }, [loadFromApi]);

  return (
    <main className="p-4">
      <header className="mb-4 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">LeoScheduler</Link>
          <nav className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Calendar</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings" className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground">
            Settings
          </Link>
          <ModeToggle />
        </div>
      </header>

      <PauseBanner />

      <Tabs defaultValue="week" className="space-y-4">
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Click an hour slot to **Quick Add** (Draft or Schedule at that time).
          </div>
          <WeekGrid />
        </TabsContent>

        <TabsContent value="month" className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Click any day to **Quick Add** (defaults to 09:00 Europe/Warsaw; you can change in Settings later).
          </div>
          <MonthGrid />
        </TabsContent>
      </Tabs>
    </main>
  );
}