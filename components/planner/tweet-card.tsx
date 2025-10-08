"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Post } from "@/types/post";
import { usePosts } from "@/hooks/use-posts";
import clsx from "clsx";

export function TweetCard({ post }: { post: Post }) {
  const { selectedId, setSelected } = usePosts();

  const isActive = selectedId === post.id;

  return (
    <Card
      onClick={() => setSelected(post.id)}
      className={clsx(
        "p-3 flex flex-col gap-2 cursor-pointer outline-offset-2",
        isActive
          ? "ring-2 ring-primary/60"
          : "hover:ring-1 hover:ring-border transition"
      )}
      role="button"
      aria-pressed={isActive}
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback>L</AvatarFallback>
        </Avatar>
        <div className="text-sm font-medium leading-none">LeoScheduler</div>
        {post.threadSteps ? (
          <Badge variant="secondary" className="ml-auto">
            {post.threadSteps} steps
          </Badge>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3">{post.text}</p>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {post.mediaCount ? <span>📷 {post.mediaCount}</span> : null}
        {post.runAtUTC ? (
          <span>
            🕘{" "}
            {new Date(post.runAtUTC).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
