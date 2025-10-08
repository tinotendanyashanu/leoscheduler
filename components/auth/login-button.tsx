"use client";
import { startAuth, setSession } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  async function login() {
    try {
      const { authUrl } = await startAuth();
      // open in same tab; X will redirect back to /auth/callback
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to start auth:', error);
    }
  }
  
  return (
    <Button onClick={login} variant="default" size="sm">
      Connect X Account
    </Button>
  );
}