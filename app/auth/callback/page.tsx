"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startAuth } from "@/lib/api";

export default function AuthCallback() {
  const [status, setStatus] = useState("Finishing sign-in…");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const session = {
            token,
            user: {
              id: payload.sub,
              username: '',
              displayName: ''
            }
          };

          const { setSession } = await import("@/lib/api");
          setSession(session);

          setStatus("Connected. Redirecting…");
          setTimeout(() => { router.replace("/"); }, 800);
        } else {
          setError("No authentication token found in URL.");
          setStatus("");
        }
      } catch (e: unknown) {
        setError(`Auth error: ${e instanceof Error ? e.message : String(e)}`);
        setStatus("");
        console.error('Auth callback error:', e);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <h1 className="text-xl font-semibold mb-1">LeoScheduler</h1>
        {status ? (
          <p className="text-sm text-muted-foreground">{status}</p>
        ) : null}
        {error ? (
          <>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" onClick={async () => {
                try {
                  const { authUrl } = await startAuth();
                  window.location.href = authUrl;
                } catch (e) {
                  console.error(e);
                }
              }}>Try Again</Button>
              <Button size="sm" variant="secondary" onClick={() => router.replace('/')}>Back Home</Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
