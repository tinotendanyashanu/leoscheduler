"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import { usePosts } from "@/hooks/use-posts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TweetCard } from "./tweet-card";
import { Badge } from "@/components/ui/badge";

export function CalendarView() {
  const { posts } = usePosts();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const firstDay = startOfWeek(startOfMonth(currentMonth));
  const lastDay = endOfWeek(endOfMonth(currentMonth));
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  function prevMonth() {
    setCurrentMonth(subMonths(currentMonth, 1));
  }

  function nextMonth() {
    setCurrentMonth(addMonths(currentMonth, 1));
  }

  // Filter posts that have a scheduled date
  const scheduledPosts = posts.filter(p => p.scheduledFor);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center rounded-md border bg-muted/50">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-background">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-4 bg-border" />
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-background">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-b bg-muted/20 text-center text-sm text-muted-foreground font-medium py-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="grid grid-cols-7 auto-rows-fr min-h-0">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const dayPosts = scheduledPosts.filter(p => isSameDay(new Date(p.scheduledFor!), day));

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[120px] p-2 border-b border-r relative group transition-colors",
                  !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                  isToday && "bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1">
                  {dayPosts.map(post => (
                    <div 
                      key={post.id} 
                      className="text-xs p-1.5 rounded border bg-card shadow-sm truncate hover:ring-1 ring-primary cursor-pointer"
                    >
                      <div className="flex items-center gap-1 mb-0.5 text-muted-foreground">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "h-1.5 w-1.5 p-0 rounded-full",
                            post.status === 'sent' ? "bg-green-500" : "bg-blue-500"
                          )} 
                        />
                        {format(new Date(post.scheduledFor!), "HH:mm")}
                      </div>
                      <span className="font-medium text-card-foreground">
                        {post.content}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
