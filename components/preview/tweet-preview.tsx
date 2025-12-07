"use client";

import { useEffect, useState } from "react";
import { usePosts } from "@/hooks/use-posts";
import { useSettings } from "@/hooks/use-settings";
import type { Post } from "@/types/post";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Repeat2, Heart, Share, MoreHorizontal, Trash2, Edit2, CalendarOff, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

function formatWhen(p?: Post, tz?: string) {
  if (!p?.runAtUTC) return "Not scheduled";
  const dt = new Date(p.runAtUTC);
  const d = dt.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", timeZone: tz });
  const t = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: tz });
  return `${d} • ${t} (${tz})`;
}

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" className="text-blue-400 hover:underline">
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
  const post = posts.find((p) => p.id === selectedId);

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
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center border-l bg-muted/5">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Smartphone className="h-8 w-8 opacity-50" />
        </div>
        <h3 className="font-semibold text-lg mb-1">Preview Mode</h3>
        <p className="text-sm max-w-[200px]">Select a tweet from the board to see how it looks and make edits.</p>
      </div>
    );
  }

  let lastSnapshot = post;

  async function unschedule() {
    await updatePostViaApi(post!.id, { status: "draft", scheduledFor: null, runAtUTC: null });
  }
  async function onDelete() {
    lastSnapshot = post!;
    setSelected(null);
    await deletePostViaApi(post!.id);
  }

  async function saveEdit(newText: string) {
    await updatePostViaApi(post!.id, { text: newText, content: newText });
  }

  return (
    <div className="h-full flex flex-col border-l bg-background">
      <div className="p-4 border-b flex items-center justify-between bg-muted/10">
        <span className="font-semibold text-sm">Preview</span>
        <div className="flex items-center gap-2">
          {post.status !== 'sent' && (
            <>
              {post.status === 'scheduled' && (
                <Button size="icon" variant="ghost" onClick={unschedule} title="Unschedule (Move to Drafts)">
                  <CalendarOff className="h-4 w-4 text-orange-500" />
                </Button>
              )}
              <UndoableDelete onConfirm={onDelete} />
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Mobile Preview Container */}
        <div className="max-w-[380px] mx-auto bg-background border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4">
            {/* Header */}
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-[15px] truncate">{displayName || "User Name"}</span>
                    <span className="text-[14px] text-muted-foreground truncate">@{handle || "username"}</span>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mt-3 text-[15px] leading-normal whitespace-pre-wrap break-words">
              {linkify(post.text || "")}
            </div>

            {/* Media */}
            {post.mediaCount ? (
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden border">
                {Array.from({ length: Math.min(4, post.mediaCount) }).map((_, i) => (
                  <div key={i} className="aspect-video bg-muted flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                ))}
              </div>
            ) : null}

            {/* Timestamp */}
            <div className="mt-3 text-[14px] text-muted-foreground border-b pb-3">
              {formatWhen(post, timezone)}
            </div>

            {/* Stats */}
            <div className="py-3 border-b flex gap-4 text-sm text-muted-foreground">
              <span><strong className="text-foreground">0</strong> Reposts</span>
              <span><strong className="text-foreground">0</strong> Quotes</span>
              <span><strong className="text-foreground">0</strong> Likes</span>
            </div>

            {/* Actions */}
            <div className="py-2 flex items-center justify-around text-muted-foreground">
              <MessageCircle className="h-5 w-5 hover:text-blue-500 cursor-pointer" />
              <Repeat2 className="h-5 w-5 hover:text-green-500 cursor-pointer" />
              <Heart className="h-5 w-5 hover:text-pink-500 cursor-pointer" />
              <Share className="h-5 w-5 hover:text-blue-500 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Edit Area */}
        {post.status !== 'sent' && (
          <div className="mt-8 max-w-[380px] mx-auto">
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Quick Edit</div>
            <InlineEdit text={post.text || ''} onSave={saveEdit} />
          </div>
        )}
      </div>
    </div>
  );
}

function InlineEdit({ text, onSave }: { text: string; onSave: (t: string) => Promise<void> }) {
  const [val, setVal] = useState(text);
  const [isDirty, setIsDirty] = useState(false);
  
  useEffect(() => { 
    setVal(text); 
    setIsDirty(false);
  }, [text]);

  return (
    <div className="space-y-2">
      <textarea 
        className="w-full min-h-[100px] p-3 rounded-md border bg-background text-sm resize-none focus:ring-1 focus:ring-primary"
        value={val} 
        onChange={(e) => {
          setVal(e.target.value);
          setIsDirty(e.target.value !== text);
        }} 
      />
      {isDirty && (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => { setVal(text); setIsDirty(false); }}>Reset</Button>
          <Button size="sm" onClick={async () => { await onSave(val.trim()); setIsDirty(false); }}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}

function UndoableDelete({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (pending) {
      t = setTimeout(() => {
        onConfirm().catch(console.error);
        setPending(false);
      }, 3000);
    }
    return () => { if (t) clearTimeout(t); };
  }, [pending, onConfirm]);

  if (!pending) return (
    <Button size="icon" variant="ghost" onClick={() => setPending(true)} title="Delete">
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
  
  return (
    <Button size="sm" variant="destructive" onClick={() => setPending(false)} className="h-8">
      Undo (3s)
    </Button>
  );
}

import { Image as ImageIcon } from "lucide-react";
