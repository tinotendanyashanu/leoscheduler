"use client";

import { ReactNode, useMemo } from "react";
import { TweetCard } from "./tweet-card";
import { Card } from "@/components/ui/card";
import { usePosts } from "@/hooks/use-posts";
import type { PostStatus } from "@/types/post";

import {
  useDroppable,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id, children, column }: { id: string; children: ReactNode; column: PostStatus }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    data: { column }, // IMPORTANT: card carries its source column
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export function KanbanColumn({
  status,
  title,
  accent,
}: {
  status: PostStatus;
  title: string;
  accent: string;
}) {
  const { posts } = usePosts();
  const items = useMemo(() => posts.filter((p) => p.status === status), [posts, status]);
  const ids = items.map((i) => i.id);

  // Make the whole column body a droppable target identified by its status
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { column: status },
  });

  return (
    <Card className="flex flex-col h-full">
      <div className="px-3 py-2 border-b flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        <div className="font-medium">{title}</div>
        <div className="ml-auto text-xs text-muted-foreground">{items.length}</div>
      </div>

      <div
        ref={setNodeRef}
        className={`p-3 overflow-y-auto space-y-3 min-h-40 rounded-b-xl transition-colors ${
          isOver ? "bg-muted/50" : ""
        }`}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((p) => (
            <SortableItem key={p.id} id={p.id} column={status}>
              <TweetCard post={p} />
            </SortableItem>
          ))}
        </SortableContext>
      </div>
    </Card>
  );
}
