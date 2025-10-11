"use client";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { PlannerBoard } from "@/components/planner/planner-board";
import { TweetPreview } from "@/components/preview/tweet-preview";
import { ComposeDialog } from "@/components/composer/compose-dialog";
import { PauseBanner } from "@/components/pause-banner";
import { LoginButton } from "@/components/auth/login-button";
import { UserMenu } from "@/components/auth/user-menu";
import { getSession, setSession, getCurrentUser, type Session } from "@/lib/api";
import { usePosts } from "@/hooks/use-posts";
import Link from "next/link";

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const loadFromApi = usePosts(s => s.loadFromApi);

  useEffect(() => {
    // Capture token on root redirect (worker may send token here)
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlToken = params?.get('token');
    if (urlToken) {
      try {
        const payload = JSON.parse(atob(urlToken.split('.')[1]));
        setSession({ token: urlToken, user: { id: payload.sub, username: '', displayName: '' } });
        // clean URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch {}
    }

    const s = getSession();
    if (s) {
      setSession(s);
      
      // Load user info if we don't have it
      if (!s.user.username) {
        getCurrentUser().then(user => {
          const updatedSession = { ...s, user };
          setSession(updatedSession);
          setUserLoaded(true);
        }).catch((err) => {
          console.error(err);
          setUserLoaded(true);
        });
      } else {
        setUserLoaded(true);
      }

      // Load posts from API
      loadFromApi().catch(console.error);
    } else {
      setUserLoaded(true);
    }
  }, [loadFromApi]);

  const [authInvalid, setAuthInvalid] = useState(false);
  useEffect(() => {
    const onInvalid = () => setAuthInvalid(true);
    window.addEventListener('auth-invalid', onInvalid);
    return () => window.removeEventListener('auth-invalid', onInvalid);
  }, []);

  return (
    <main className="p-4">
      <header className="mb-4 flex items-center justify-between border-b pb-3">
        <div className="font-semibold">LeoScheduler</div>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/calendar" className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground">
                Calendar
              </Link>
              <Link href="/settings" className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground">
                Settings
              </Link>
              <ComposeDialog />
              <UserMenu />
              <ModeToggle />
            </>
          ) : (
            <>
              <LoginButton />
              <ModeToggle />
            </>
          )}
        </div>
      </header>

      {session ? (
        <>
          {authInvalid ? (
            <div className="mb-3 rounded-md border bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200 px-3 py-2 flex items-center justify-between gap-2">
              <div className="text-sm">Session expired. Please reconnect X.</div>
              <LoginButton />
            </div>
          ) : null}
          <PauseBanner />

          <div className="grid grid-cols-12 gap-4">
            {/* Left: Board */}
            <section className="col-span-12 lg:col-span-8 xl:col-span-9">
              <PlannerBoard />
            </section>

            {/* Right: Live Preview */}
            <aside className="col-span-12 lg:col-span-4 xl:col-span-3 h-[calc(100vh-8rem)] sticky top-20">
              <TweetPreview />
            </aside>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-lg font-medium mb-2">Welcome to LeoScheduler</h2>
          <p className="text-sm text-muted-foreground mb-6">Connect your X account to start planning and scheduling your tweets.</p>
          {!userLoaded && <p className="text-xs text-muted-foreground">Loading...</p>}
        </div>
      )}
    </main>
  );
}
