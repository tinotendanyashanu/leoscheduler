"use client";

import * as React from "react";
import { Send, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePosts } from "@/hooks/use-posts";
import { MAX_TWEET } from "@/lib/utils";
import { toast } from "sonner";

export function QuickComposer() {
  const { addPostViaApi } = usePosts();
  const [content, setContent] = React.useState("");
  const [isPosting, setIsPosting] = React.useState(false);

  async function onPost() {
    if (!content.trim()) return;
    
    setIsPosting(true);
    try {
      await addPostViaApi({
        content: content.trim(),
        status: "sending", // Immediate post
        scheduledFor: null,
      });
      setContent("");
      toast.success("Tweet sent successfully!");
    } catch (error) {
      toast.error("Failed to send tweet. Saved as draft.");
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <div className="p-4 border rounded-xl bg-card shadow-sm mb-6">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-3">
          <Textarea 
            placeholder="What's happening right now?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none border-none bg-muted/30 focus-visible:ring-0 text-lg px-0"
          />
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/70 hover:text-primary hover:bg-primary/10">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <span className={`text-xs ${content.length > MAX_TWEET ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                {content.length} / {MAX_TWEET}
              </span>
            </div>
            <Button 
              onClick={onPost} 
              disabled={!content.trim() || content.length > MAX_TWEET || isPosting}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
            >
              {isPosting ? "Posting..." : "Post Now"}
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
