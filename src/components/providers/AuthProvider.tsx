"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPWAPrompt = e;
      window.dispatchEvent(new Event("pwaInstallable"));
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
