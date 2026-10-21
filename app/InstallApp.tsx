"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (standalone) {
      setInstalled(true);
      return;
    }

    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    }

    function onInstalled() {
      setInstalled(true);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  if (!promptEvent && !isIos) return null;

  async function handleInstall() {
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice;
      setPromptEvent(null);
    } else {
      setShowIosHelp((value) => !value);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleInstall}
        className="w-full rounded-xl border border-slate-600 bg-slate-800 p-4 font-semibold"
      >
        Install App
      </button>

      {showIosHelp && (
        <p className="mt-2 rounded-xl bg-slate-950 p-3 text-sm text-slate-300">
          On iPhone/iPad: tap the Share button in Safari, then choose
          &quot;Add to Home Screen&quot;.
        </p>
      )}
    </div>
  );
}
