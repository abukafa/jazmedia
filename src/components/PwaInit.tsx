"use client";

import { useEffect } from "react";

export default function PwaInit() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered:", registration.scope);
          })
          .catch((err) => {
            console.log("SW registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
