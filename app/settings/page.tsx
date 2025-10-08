"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { useSettings } from "@/hooks/use-settings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TZ = [
  "Europe/Warsaw","Europe/London","Europe/Berlin","Africa/Harare","Africa/Johannesburg",
  "UTC","America/New_York","America/Los_Angeles","Asia/Dubai"
];

export default function SettingsPage() {
  const {
    pauseAll, setPauseAll,
    timezone, setTimezone,
    defaultTime, setDefaultTime,
    displayName, handle, setProfile
  } = useSettings();

  return (
    <main className="p-4">
      <header className="mb-4 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">LeoScheduler</Link>
          <nav className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Settings</span>
          </nav>
        </div>
        <ModeToggle />
      </header>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Posting controls */}
        <Card className="p-4 space-y-4">
          <div className="text-sm font-semibold">Posting Controls</div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Pause All</Label>
              <div className="text-xs text-muted-foreground">
                Temporarily prevent scheduled posts from being sent.
              </div>
            </div>
            <Switch checked={pauseAll} onCheckedChange={setPauseAll} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue placeholder="Timezone" /></SelectTrigger>
                <SelectContent>
                  {TZ.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Default Post Time</Label>
              <Input type="time" value={defaultTime} onChange={(e) => setDefaultTime(e.target.value)} />
              <div className="text-xs text-muted-foreground mt-1">
                Used by Quick Add and Month view.
              </div>
            </div>
          </div>
        </Card>

        {/* Profile */}
        <Card className="p-4 space-y-4">
          <div className="text-sm font-semibold">Profile</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Display Name</Label>
              <Input value={displayName} onChange={(e) => setProfile(e.target.value, handle)} />
            </div>
            <div>
              <Label className="text-sm">Handle</Label>
              <Input value={handle} onChange={(e) => setProfile(displayName, e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" asChild>
              <Link href="/">Back to Planner</Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}