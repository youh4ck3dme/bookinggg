"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 py-3 text-sm shadow-lg ring-1 ring-black/5 dark:bg-slate-900/95">
      <div>
        <p className="font-semibold">Nainštalujte UBM Dashboard</p>
        <p className="text-slate-500 dark:text-slate-300">Prístup aj offline a rýchle spúšťanie.</p>
      </div>
      <button
        className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600"
        onClick={async () => {
          await deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          setVisible(false);
        }}
      >
        Inštalovať
      </button>
    </div>
  );
}
