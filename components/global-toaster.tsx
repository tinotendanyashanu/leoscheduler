"use client";

import { useEffect, useState } from "react";

type Toast = { id: string; message: string; kind?: "error" | "info" };

export function GlobalToaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function add(message: string, kind: Toast["kind"] = "info") {
      const t: Toast = { id: crypto.randomUUID(), message, kind };
      setToasts((prev) => [...prev, t]);
      // Auto-dismiss after 5s
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 5000);
    }

    const onApiError = (e: Event) => {
      const detail = (e as CustomEvent).detail as { status?: number; message?: string; path?: string } | undefined;
      const msg = detail?.status
        ? `Request failed (${detail.status})${detail.path ? ` ${detail.path}` : ''}: ${detail?.message ?? 'Unknown error'}`
        : `Request failed`;
      add(msg, "error");
    };

    const onAuthInvalid = () => {
      add("Session expired. Please reconnect X.", "error");
    };

    window.addEventListener("api-error", onApiError as any);
    window.addEventListener("auth-invalid", onAuthInvalid);
    return () => {
      window.removeEventListener("api-error", onApiError as any);
      window.removeEventListener("auth-invalid", onAuthInvalid);
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            `min-w-[260px] max-w-sm rounded-md border px-3 py-2 text-sm shadow ` +
            (t.kind === "error"
              ? "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200 border-red-300/50"
              : "bg-background text-foreground")
          }
          role="status"
          aria-live="polite"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

