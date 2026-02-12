import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/api/client";

export type SiteSettings = {
  maintenance: {
    enabled: boolean;
    message?: string;
  };
  visibility: {
    about: boolean;
    learnMore: boolean;
    translationService: boolean;
    gallery: boolean;
    news: boolean;
    blog: boolean;
    flight: boolean;
    insurance: boolean;
    helpCenter: boolean;
    qAndA: boolean;
    feedback: boolean;
  };
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  maintenance: { enabled: false, message: "" },
  visibility: {
    about: true,
    learnMore: true,
    translationService: true,
    gallery: true,
    news: true,
    blog: true,
    flight: true,
    insurance: true,
    helpCenter: true,
    qAndA: true,
    feedback: true,
  },
};

type SiteSettingsContextValue = {
  settings: SiteSettings;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await api.get("/api/site/settings");
      const next = res.data?.data;
      if (next) setSettings(next);
    } catch {
      // Keep last-known settings (or defaults) if the endpoint fails.
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();

    const intervalId = window.setInterval(() => {
      void refresh();
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      refresh,
    }),
    [settings, isLoading]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
}

