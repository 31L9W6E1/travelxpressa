import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/api/client";

export default function PageViewTracker() {
  const location = useLocation();
  const { i18n } = useTranslation();

  const lastPathRef = useRef<string>("");
  const lastSentAtRef = useRef<number>(0);

  useEffect(() => {
    const path = location.pathname;

    // Avoid logging noisy internal navigations.
    if (!path.startsWith("/")) return;

    // De-dupe strict-mode double effects (dev) and fast re-renders.
    const now = Date.now();
    if (lastPathRef.current === path && now - lastSentAtRef.current < 3000) return;
    lastPathRef.current = path;
    lastSentAtRef.current = now;

    void api
      .post("/api/site/pageview", {
        path,
        title: typeof document !== "undefined" ? document.title : undefined,
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
        locale: i18n.language,
      })
      // Tracking must never break navigation.
      .catch(() => {});
  }, [location.pathname, i18n.language]);

  return null;
}

