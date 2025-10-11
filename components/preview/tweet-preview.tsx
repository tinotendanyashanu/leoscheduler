"use client";

import { useEffect, useState } from "react";
import { usePosts } from "@/hooks/use-posts";
import { useSettings } from "@/hooks/use-settings";
import type { Post } from "@/types/post";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { posts, selectedId, isLoading, updatePostViaApi, deletePostViaApi, setSelected } = usePosts();
  const { displayName, handle, timezone } = useSettings();
  const post = posts.find((p) => p.id === selectedId) ?? posts[0];

  if (isLoading) {
    return (
      <Card className="p-4 h-full space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </Card>
    );
  }

  if (!post) {
    return (
      <Card className="p-6 h-full flex items-center justify-center text-muted-foreground">
        Select a post to preview
      </Card>
    );
  }

  let undoTimer: any;
  let lastSnapshot = post;

  async function unschedule() {
    await updatePostViaApi(post.id, { status: "draft", scheduledFor: null, runAtUTC: null });
  }
  async function onDelete() {
    // optimistic remove
    lastSnapshot = post;
    setSelected(null);
    await deletePostViaApi(post.id);
  }

  async function saveEdit(newText: string) {
    await updatePostViaApi(post.id, { text: newText, content: newText });
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
        <div className="ml-auto flex items-center gap-2">
          {post.threadSteps ? <Badge variant="outline">{post.threadSteps} steps</Badge> : null}
          {/* Actions */}
          {post.status !== 'sent' && (
            <div className="flex items-center gap-2">
              <InlineEdit text={post.text || ''} onSave={saveEdit} />
              {post.status === 'scheduled' && (
                <Button size="sm" variant="secondary" onClick={unschedule} title="Move to Drafts">Unschedule</Button>
              )}
              <UndoableDelete onConfirm={onDelete} />
            </div>
          )}
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

function InlineEdit({ text, onSave }: { text: string; onSave: (t: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(text);
  useEffect(() => { setVal(text); }, [text]);
  if (!editing) return <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>;
  return (
    <div className="flex items-center gap-2">
      <input className="text-sm px-2 py-1 border rounded w-40 bg-background" value={val} onChange={(e) => setVal(e.target.value)} />
      <Button size="sm" onClick={async () => { await onSave(val.trim()); setEditing(false); }} disabled={!val.trim()}>Save</Button>
      <Button size="sm" variant="ghost" onClick={() => { setVal(text); setEditing(false); }}>Cancel</Button>
    </div>
  );
}

function UndoableDelete({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  useEffect(() => {
    let t: any;
    if (pending) {
      t = setTimeout(() => {
        onConfirm().catch(console.error);
        setPending(false);
      }, 5000);
    }
    return () => { if (t) clearTimeout(t); };
  }, [pending, onConfirm]);

  if (!pending) return <Button size="sm" variant="destructive" onClick={() => setPending(true)}>Delete</Button>;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span>Deleting…</span>
      <Button size="sm" variant="secondary" onClick={() => setPending(false)}>Undo</Button>
    </div>
  );
}
