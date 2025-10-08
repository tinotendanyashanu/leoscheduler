"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const [status, setStatus] = useState("Finishing sign-in…");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Check for token in URL params (from the worker redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
          // Parse JWT payload to get user info (simple decode, not verification)
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Store session - we'll fetch full user info from API later
          const session = {
            token,
            user: {
              id: payload.sub,
              username: '', // Will be populated when we fetch user info
              displayName: ''
            }
          };
          
          // Import dynamically to avoid SSR issues
          const { setSession } = await import("@/lib/api");
          setSession(session);
          
          setStatus("Connected. Redirecting…");
          
          setTimeout(() => {
            router.replace("/");
          }, 1000);
        } else {
          setStatus("No authentication token found in URL");
        }
      } catch (e: any) {
        setStatus(`Auth error: ${e.message || e}`);
        console.error('Auth callback error:', e);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Leo Scheduler</h1>
        <p className="text-sm text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}