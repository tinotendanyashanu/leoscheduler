"use client";

import { usePosts } from "@/hooks/use-posts";
import { useSettings } from "@/hooks/use-settings";
import type { Post } from "@/types/post";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function formatWhen(p?: Post, tz?: string) {
  if (!p?.runAtUTC) return "Not scheduled";
  const dt = new Date(p.runAtUTC);
  const d = dt.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", timeZone: tz });
  const t = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: tz });
  return `${d} • ${t} (${tz})`;
}

function linkify(text: string) {
  // super-light link renderer
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" className="text-primary underline underline-offset-2">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function TweetPreview() {
  const { posts, selectedId } = usePosts();
  const { displayName, handle, timezone } = useSettings();
  const post = posts.find((p) => p.id === selectedId) ?? posts[0];

  if (!post) {
    return (
      <Card className="p-6 h-full flex items-center justify-center text-muted-foreground">
        Select a post to preview
      </Card>
    );
  }

  return (
    <Card className="p-4 h-full">
      {/* Header: account */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback>L</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">{displayName}</span>
          <span className="text-xs text-muted-foreground">{handle}</span>
        </div>
        <div className="ml-auto">
          {post.threadSteps ? <Badge variant="outline">{post.threadSteps} steps</Badge> : null}
        </div>
      </div>

      {/* Body: text */}
      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-3">
        {linkify(post.text || "")}
      </div>

      {/* Media grid placeholder */}
      {post.mediaCount ? (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {Array.from({ length: Math.min(4, post.mediaCount) }).map((_, i) => (
            <div key={i} className="aspect-video rounded-md bg-muted" />
          ))}
        </div>
      ) : null}

      {/* Footer: meta */}
      <div className="text-xs text-muted-foreground border-t pt-3">
        {formatWhen(post, timezone)}
      </div>
    </Card>
  );
}