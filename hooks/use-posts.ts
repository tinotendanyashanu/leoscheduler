import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Post, PostStatus } from "../types/post";
import * as api from "@/lib/api";

// Helper to convert API post to internal Post format
function apiToPost(apiPost: api.ApiPost): Post {
  return {
    id: apiPost.id,
    content: apiPost.content,
    text: apiPost.content, // Legacy compatibility
    status: apiPost.status,
    scheduledFor: apiPost.scheduledFor,
    runAtUTC: apiPost.scheduledFor, // Legacy compatibility
    mediaUrls: apiPost.mediaUrls,
    mediaCount: apiPost.mediaUrls?.length || 0, // Legacy compatibility
    threadOrder: apiPost.threadOrder,
    threadSteps: apiPost.threadOrder, // Legacy compatibility
    parentId: apiPost.parentId,
    postedTweetId: apiPost.postedTweetId,
    userId: apiPost.userId,
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
  };
}

// Helper to convert internal Post to API format
function postToApi(post: Partial<Post>): Partial<api.ApiPost> {
  return {
    content: post.content || post.text || "",
    scheduledFor: post.scheduledFor || post.runAtUTC,
    status: post.status,
    mediaUrls: post.mediaUrls || [],
    threadOrder: post.threadOrder || post.threadSteps || 0,
    parentId: post.parentId || null,
    parentId: post.parentId || null,
  };
}

type Store = {
  posts: Post[];
  selectedId: string | null;
  isLoading: boolean;
  setSelected: (id: string | null) => void;

  moveTo: (id: string, to: PostStatus) => void;
  reorder: (idsInOrder: string[], column: PostStatus) => void;
  upsert: (p: Post) => void;


  addPost: (p: Omit<Post, "id" | "createdAt" | "updatedAt">) => string;

  // API methods
  loadFromApi: () => Promise<void>;
  addPostViaApi: (p: { content: string; scheduledFor?: string | null; timezone?: string; status?: PostStatus; threadOrder?: number; parentId?: string | null }) => Promise<string>;
  updatePostViaApi: (id: string, patch: Partial<Post>) => Promise<void>;
  deletePostViaApi: (id: string) => Promise<void>;
  
  // Polling
  pollingId: NodeJS.Timeout | null;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
};

export const usePosts = create<Store>((set, get) => ({
  posts: [],
  selectedId: null,
  isLoading: false,
  pollingId: null,
  setSelected: (id) => set({ selectedId: id }),
  startPolling: (intervalMs = 30000) => {
    const { pollingId, loadFromApi } = get();
    if (pollingId) return; // Already polling

    // Initial load
    loadFromApi();

    const id = setInterval(() => {
      // Don't poll if we're currently loading to avoid race conditions/flicker
      if (!get().isLoading) {
        get().loadFromApi();
        // Also trigger cron for local dev automation
        api.triggerCron().catch(err => console.error("Cron trigger failed:", err));
      }
    }, intervalMs);

    set({ pollingId: id });
  },

  stopPolling: () => {
    const { pollingId } = get();
    if (pollingId) {
      clearInterval(pollingId);
      set({ pollingId: null });
    }
  },

  moveTo: (id, to) => {
    // Update locally first for responsive UI
    set({ posts: get().posts.map((p) => (p.id === id ? { ...p, status: to } : p)) });
    
    // Sync with API in background
    const post = get().posts.find(p => p.id === id);
    if (post) {
      get().updatePostViaApi(id, { status: to }).catch(console.error);
    }
  },

  reorder: (idsInOrder, column) => {
    // Update locally first for responsive UI
    set({
      posts: [
        // keep everything that is NOT in this column
        ...get().posts.filter((p) => p.status !== column),
        // then append items in the new order, setting their status = column
        ...idsInOrder.map((id) => {
          const found = get().posts.find((p) => p.id === id)!;
          return { ...found, status: column };
        }),
      ],
    });
    
    // Sync status changes with API in background
    idsInOrder.forEach(id => {
      get().updatePostViaApi(id, { status: column }).catch(console.error);
    });
  },

  upsert: (p) =>
    set({
      posts: [...get().posts.filter((x) => x.id !== p.id), p],
    }),

  addPost: (p) => {
    const id = nanoid();
    const now = new Date().toISOString();
    const newPost: Post = {
      id,
      content: p.content || p.text || "",
      text: p.content || p.text || "", // Legacy compatibility
      status: p.status || "draft",
      scheduledFor: p.scheduledFor ?? p.runAtUTC ?? null,
      runAtUTC: p.scheduledFor ?? p.runAtUTC ?? null, // Legacy compatibility
      mediaUrls: p.mediaUrls ?? [],
      mediaCount: p.mediaUrls?.length ?? p.mediaCount ?? 0, // Legacy compatibility
      threadOrder: p.threadOrder ?? p.threadSteps ?? 0,
      threadSteps: p.threadOrder ?? p.threadSteps ?? 0, // Legacy compatibility
      parentId: p.parentId ?? null,
      tags: p.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };
    set({ posts: [...get().posts, newPost], selectedId: id });
    return id;
  },

  // API methods
  loadFromApi: async () => {
    try {
      set({ isLoading: true });
      const apiPosts = await api.listPosts();
      const posts = apiPosts.map(apiToPost);
      set({ posts });
    } catch (error) {
      console.error('Failed to load posts from API:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addPostViaApi: async (p) => {
    try {
      const apiPost = await api.createPost(p);
      const post = apiToPost(apiPost);
      set({ posts: [...get().posts, post], selectedId: post.id });
      return post.id;
    } catch (error) {
      console.error('Failed to create post via API:', error);
      // Fallback to local creation
      return get().addPost(p as any);
    }
  },

  updatePostViaApi: async (id, patch) => {
    try {
      const apiPatch = postToApi(patch);
      const apiPost = await api.updatePost(id, apiPatch);
      const updatedPost = apiToPost(apiPost);
      set({ posts: get().posts.map(p => p.id === id ? updatedPost : p) });
    } catch (error) {
      console.error('Failed to update post via API:', error);
      // Fallback to local update
      set({ posts: get().posts.map(p => p.id === id ? { ...p, ...patch } : p) });
    }
  },

  deletePostViaApi: async (id) => {
    try {
      await api.deletePost(id);
      set({ posts: get().posts.filter(p => p.id !== id) });
      if (get().selectedId === id) {
        set({ selectedId: null });
      }
    } catch (error) {
      console.error('Failed to delete post via API:', error);
      // Fallback to local deletion
      set({ posts: get().posts.filter(p => p.id !== id) });
      if (get().selectedId === id) {
        set({ selectedId: null });
      }
    }
  },
}));
