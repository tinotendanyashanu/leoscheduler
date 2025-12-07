"use client";

import { useEffect } from "react";
import { Toaster, toast } from "sonner";

export function GlobalToaster() {
  useEffect(() => {
    const onApiError = (e: Event) => {
      const detail = (e as CustomEvent).detail as { status?: number; message?: string; path?: string } | undefined;
      const msg = detail?.status
        ? `Request failed (${detail.status}): ${detail?.message ?? 'Unknown error'}`
        : `Request failed`;
      toast.error(msg);
    };

    const onAuthInvalid = () => {
      toast.error("Session expired. Please reconnect X.");
    };

    window.addEventListener("api-error", onApiError as EventListener);
    window.addEventListener("auth-invalid", onAuthInvalid);
    return () => {
      window.removeEventListener("api-error", onApiError as EventListener);
      window.removeEventListener("auth-invalid", onAuthInvalid);
    };
  }, []);

  return <Toaster position="bottom-right" richColors closeButton />;
}
