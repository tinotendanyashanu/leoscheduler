"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: string; message: string; kind?: "error" | "info" | "success" };

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
        ? `Request failed (${detail.status}): ${detail?.message ?? 'Unknown error'}`
        : `Request failed`;
      add(msg, "error");
    };

    const onAuthInvalid = () => {
      add("Session expired. Please reconnect X.", "error");
    };

    window.addEventListener("api-error", onApiError as EventListener);
    window.addEventListener("auth-invalid", onAuthInvalid);
    return () => {
      window.removeEventListener("api-error", onApiError as EventListener);
      window.removeEventListener("auth-invalid", onAuthInvalid);
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full",
            t.kind === "error" 
              ? "bg-destructive text-destructive-foreground border-destructive/50" 
              : "bg-background text-foreground border-border"
          )}
          role="status"
          aria-live="polite"
        >
          {t.kind === "error" ? (
            <AlertCircle className="h-5 w-5 shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
          )}
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {t.message}
          </div>
          <button 
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="shrink-0 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
