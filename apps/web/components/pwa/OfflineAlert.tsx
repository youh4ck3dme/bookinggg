"use client";

import { useEffect, useState } from "react";

export default function OfflineAlert() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-amber-500 text-white text-sm text-center py-2">
      Ste offline. Niektoré údaje nemusia byť aktuálne.
    </div>
  );
}
