"use client";
import { useEffect, useState } from "react";

export default function NetworkWatcher() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setOnline(navigator.onLine);

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // initial check
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!online) {
    return (
      <div className="fixed top-0 w-full bg-red-600 text-white text-center p-2 z-50 font-semibold">
        No Internet Connection, Please check your network.
      </div>
    );
  }

  return null;
}
