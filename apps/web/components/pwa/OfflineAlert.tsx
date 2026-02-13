"use client";

import { useEffect, useState } from "react";

export function OfflineAlert() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-amber-100 text-amber-900 p-3 text-sm">
      You are offline. Some actions may be unavailable.
    </div>
  );
}
