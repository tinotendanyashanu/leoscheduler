const BASE = process.env.NEXT_PUBLIC_WORKER_URL!;
const SESSION_KEY = "leoscheduler:session";

export type Session = { token: string; user: { id: string; username: string; displayName: string } };

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const s = getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as any),
  };
  if (s?.token) headers.Authorization = `Bearer ${s.token}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: "omit" });

  if (!res.ok) {
    const status = res.status;
    let message = '';
    try {
      const text = await res.text();
      message = text || res.statusText;
    } catch {
      message = res.statusText;
    }

    if (typeof window !== 'undefined') {
      // Emit a global event for UI toast handling
      window.dispatchEvent(new CustomEvent('api-error', { detail: { status, message, path } }));
      if (status === 401) {
        // Session likely invalid/expired
        try { clearSession(); } catch {}
        window.dispatchEvent(new CustomEvent('auth-invalid'));
      }
    }

    throw new Error(`${status} ${message}`);
  }

  return res.json() as Promise<T>;
}

// AUTH
export async function startAuth(): Promise<{ authUrl: string }> {
  return api("/auth/connect");
}

// USER
export async function getCurrentUser() {
  return api<{ id: string; username: string; displayName: string }>("/api/user");
}

// POSTS
export type ApiPost = {
  id: string;
  content: string;
  mediaUrls: string[];
  scheduledFor: string | null;
  status: "draft" | "ready" | "scheduled" | "sent" | "error";
  userId: string;
  threadOrder: number;
  parentId: string | null;
  postedTweetId: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listPosts(): Promise<ApiPost[]> {
  return api<ApiPost[]>("/api/posts");
}

export async function createPost(body: { 
  content: string; 
  scheduledFor?: string | null; 
  status?: "draft" | "ready" | "scheduled";
  threadOrder?: number;
  parentId?: string | null;
}) {
  return api<ApiPost>("/api/posts", { method: "POST", body: JSON.stringify(body) });
}

export async function updatePost(id: string, patch: Partial<ApiPost>) {
  return api<ApiPost>(`/api/posts/${id}`, { method: "PUT", body: JSON.stringify(patch) });
}

export async function deletePost(id: string) {
  return api<{ success: true }>(`/api/posts/${id}`, { method: "DELETE" });
}
