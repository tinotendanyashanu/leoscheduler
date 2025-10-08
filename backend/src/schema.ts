export type PostStatus = "draft" | "ready" | "scheduled" | "sent" | "error";

export interface Post {
  id: string
  content: string
  mediaUrls: string[]
  scheduledFor: string | null
  status: PostStatus
  userId: string
  threadOrder: number
  parentId: string | null
  postedTweetId: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username: string
  displayName: string
  profileImage?: string
  accessToken: string
  refreshToken: string | null
  tokenExpiry: string
  createdAt: string
  updatedAt: string
}

export type TokenData = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};