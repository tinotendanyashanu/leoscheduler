export type PostStatus = "draft" | "ready" | "scheduled" | "sent" | "error";

export interface Post {
  id: string;
  content: string; // renamed from text to match API
  status: PostStatus;
  scheduledFor?: string | null; // renamed from runAtUTC
  mediaUrls?: string[]; // renamed from mediaCount
  threadOrder?: number; // renamed from threadSteps
  parentId?: string | null; // for threading
  postedTweetId?: string | null; // API field
  userId?: string; // API field
  createdAt?: string; // API field
  updatedAt?: string; // API field
  
  // Keep legacy fields for backward compatibility during migration
  text?: string;
  runAtUTC?: string | null;
  mediaCount?: number;
  threadSteps?: number;
  tags?: string[];
}
