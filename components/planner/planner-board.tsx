"use client";

import { KanbanColumn } from "./kanban-column";
import { usePosts } from "@/hooks/use-posts";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostStatus } from "@/types/post";
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { useState } from "react";
import { TweetCard } from "./tweet-card";

const COLUMNS: { key: PostStatus; title: string; color: string }[] = [
  { key: "draft",     title: "Drafts",    color: "#9CA3AF" },
  { key: "ready",     title: "Ready",     color: "#60A5FA" },
  { key: "scheduled", title: "Scheduled", color: "#A78BFA" },
  { key: "sent",      title: "Sent",      color: "#34D399" },
];

export function PlannerBoard() {
  const { posts, isLoading, moveTo, reorder } = usePosts();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  function onDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const activeCol = active.data.current?.column as PostStatus | undefined;
    const overCol   = over.data?.current?.column as PostStatus | undefined;

    if (!activeCol || !overCol) return;

    const cardId = String(active.id);

    if (activeCol !== overCol) {
      moveTo(cardId, overCol);
      return;
    }

    const idsInColumn = posts.filter(p => p.status === activeCol).map(p => p.id);
    const oldIndex = idsInColumn.indexOf(cardId);
    let newIndex = idsInColumn.length - 1;

    if (typeof over.id === "string" && idsInColumn.includes(String(over.id))) {
      newIndex = idsInColumn.indexOf(String(over.id));
    }

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newOrder = [...idsInColumn];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, cardId);
      reorder(newOrder, activeCol);
    }
  }

  const activePost = activeId ? posts.find(p => p.id === activeId) : null;

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners} 
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="h-[calc(100vh-8rem)] overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[300px] md:min-w-full h-full">
          {isLoading
            ? COLUMNS.map((c) => (
                <div key={c.key} className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ))
            : COLUMNS.map((c) => (
                <div key={c.key} className="h-full min-w-[280px]">
                  <KanbanColumn status={c.key} title={c.title} accent={c.color} />
                </div>
              ))}
        </div>
      </div>
      
      <DragOverlay>
        {activePost ? (
          <div className="opacity-80 rotate-2 cursor-grabbing">
            <TweetCard post={activePost} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
