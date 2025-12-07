"use client";

import { ReactNode, useMemo } from "react";
import { TweetCard } from "./tweet-card";
import { Card } from "@/components/ui/card";
import { usePosts } from "@/hooks/use-posts";
import type { PostStatus } from "@/types/post";
import { Inbox, CheckCircle2, CalendarClock, Send } from "lucide-react";

import {
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
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

const EmptyState = ({ status }: { status: PostStatus }) => {
  const config = {
    draft: { icon: Inbox, text: "No drafts yet" },
    ready: { icon: CheckCircle2, text: "Nothing ready" },
    scheduled: { icon: CalendarClock, text: "Nothing scheduled" },
    sent: { icon: Send, text: "No sent tweets" },
    error: { icon: Inbox, text: "No errors" }
  };
  
  const { icon: Icon, text } = config[status] || config.draft;

  return (
    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50 border-2 border-dashed rounded-lg">
      <Icon className="h-8 w-8 mb-2" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

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
    <Card className="flex flex-col h-full bg-muted/10 border-none shadow-none">
      <div className="px-3 py-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        <div className="font-semibold text-sm">{title}</div>
        <div className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {items.length}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-3 min-h-40 rounded-xl transition-colors ${
          isOver ? "bg-muted/30 ring-2 ring-primary/20" : ""
        }`}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((p) => (
            <SortableItem key={p.id} id={p.id} column={status}>
              <TweetCard post={p} />
            </SortableItem>
          ))}
        </SortableContext>
        
        {items.length === 0 && <EmptyState status={status} />}
      </div>
    </Card>
  );
}
