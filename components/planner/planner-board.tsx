"use client";

import { KanbanColumn } from "./kanban-column";
import { usePosts } from "@/hooks/use-posts";
import type { PostStatus } from "@/types/post";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCorners,
} from "@dnd-kit/core";

const COLUMNS: { key: PostStatus; title: string; color: string }[] = [
  { key: "draft",     title: "Drafts",    color: "#9CA3AF" },
  { key: "ready",     title: "Ready",     color: "#60A5FA" },
  { key: "scheduled", title: "Scheduled", color: "#A78BFA" },
  { key: "sent",      title: "Sent",      color: "#34D399" },
];

export function PlannerBoard() {
  const { posts, moveTo, reorder } = usePosts();

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;

    const activeCol = active.data.current?.column as PostStatus | undefined;
    const overCol   = over.data?.current?.column as PostStatus | undefined;

    // If dropped on a column header/body rather than a specific item, over.id will be the column id (status).
    // If dropped over an item, over.data.current.column will still tell us the target column.

    if (!activeCol || !overCol) return;

    const cardId = String(active.id);

    if (activeCol !== overCol) {
      // Cross-column move: just move the card to the target column (append to end).
      moveTo(cardId, overCol);
      return;
    }

    // Same-column reorder: compute new order
    const idsInColumn = posts.filter(p => p.status === activeCol).map(p => p.id);

    const oldIndex = idsInColumn.indexOf(cardId);
    // If dropped over a column (not a specific item), put at end
    let newIndex = idsInColumn.length - 1;

    // If dropped over an item, place relative to that item
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

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-8rem)]">
        {COLUMNS.map((c) => (
          <KanbanColumn key={c.key} status={c.key} title={c.title} accent={c.color} />
        ))}
      </div>
    </DndContext>
  );
}
