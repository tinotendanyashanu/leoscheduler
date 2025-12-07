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
import { Calendar as CalendarIcon, Layout, PenTool, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/planner/calendar-view";
import { QuickComposer } from "@/components/composer/quick-composer";

export default function Page() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const startPolling = usePosts(s => s.startPolling);
  const stopPolling = usePosts(s => s.stopPolling);

  useEffect(() => {
    // Capture token on root redirect (worker may send token here)
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlToken = params?.get('token');
    if (urlToken) {
      try {
        const payload = JSON.parse(atob(urlToken.split('.')[1]));
        const newSession = { token: urlToken, user: { id: payload.sub, username: '', displayName: '' } };
        
        // Persist to localStorage
        setSession(newSession);
        // Update UI state
        setCurrentSession(newSession);
        
        // clean URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch {}
    }

    const s = getSession();
    if (s) {
      setCurrentSession(s);
      
      // Load user info if we don't have it
      if (!s.user.username) {
        getCurrentUser().then(user => {
          const updatedSession = { ...s, user };
          setSession(updatedSession); // Persist updated user info
          setCurrentSession(updatedSession);
          setUserLoaded(true);
        }).catch((err) => {
          console.error(err);
          setUserLoaded(true);
        });
      } else {
        setUserLoaded(true);
      }

      // Start polling for posts
      startPolling();
    } else {
      setUserLoaded(true);
    }

    return () => stopPolling();
  }, [startPolling, stopPolling]);

  const [authInvalid, setAuthInvalid] = useState(false);
  useEffect(() => {
    const onInvalid = () => setAuthInvalid(true);
    window.addEventListener('auth-invalid', onInvalid);
    return () => window.removeEventListener('auth-invalid', onInvalid);
  }, []);

  if (!currentSession) {
    return (
      <main className="min-h-screen flex flex-col">
        <header className="p-6 flex items-center justify-between border-b bg-background/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="font-bold text-xl tracking-tight">LeoScheduler</div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <LoginButton />
          </div>
        </header>

        <section className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent pb-2">
              Schedule Tweets Like a Pro
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The modern, privacy-focused tweet scheduler. Drag, drop, and automate your X presence without the monthly fees.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <LoginButton />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 text-left">
            <Feature icon={Layout} title="Kanban Board" desc="Visualize your content pipeline with an intuitive drag-and-drop board." />
            <Feature icon={CalendarIcon} title="Smart Scheduling" desc="Queue up threads and tweets to go out at the perfect time." />
            <Feature icon={PenTool} title="Thread Composer" desc="Write long-form threads with a powerful, distraction-free editor." />
            <Feature icon={ShieldCheck} title="Secure & Private" desc="Your tokens are stored securely in Cloudflare KV. You own your data." />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="flex-none h-14 px-4 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="font-semibold tracking-tight flex items-center gap-2">
          LeoScheduler
        </div>
        <div className="flex items-center gap-2">
          <Link href="/calendar" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2">
            Calendar
          </Link>
          <Link href="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2">
            Settings
          </Link>
          <div className="h-4 w-[1px] bg-border mx-2" />
          <ComposeDialog />
          <UserMenu />
          <ModeToggle />
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {authInvalid && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm flex items-center justify-between border-b border-destructive/20">
            <span>Session expired. Please reconnect your X account.</span>
            <LoginButton />
          </div>
        )}
        <PauseBanner />

        <div className="grid grid-cols-12 h-full">
          {/* Left: Board */}
          <section className="col-span-12 lg:col-span-8 xl:col-span-9 h-full overflow-hidden border-r bg-muted/5 flex flex-col">
            <div className="flex-1 overflow-hidden flex flex-col p-4">
              <QuickComposer />
              
              <Tabs defaultValue="board" className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold tracking-tight">Content Pipeline</h2>
                  <TabsList>
                    <TabsTrigger value="board" className="gap-2">
                      <Layout className="h-4 w-4" /> Board
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2">
                      <CalendarIcon className="h-4 w-4" /> Calendar
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="board" className="flex-1 overflow-hidden mt-0">
                  <div className="h-full overflow-y-auto pr-2">
                    <PlannerBoard />
                  </div>
                </TabsContent>
                
                <TabsContent value="calendar" className="flex-1 overflow-hidden mt-0">
                  <CalendarView />
                </TabsContent>
              </Tabs>
            </div>
          </section>

          {/* Right: Live Preview */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 h-full bg-background">
            <TweetPreview />
          </aside>
        </div>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
