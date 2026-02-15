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
  agreement: {
    version?: string;
    template: string;
  };
  quickHelp: {
    title?: string;
    description?: string;
    facebookUrl?: string;
    phone?: string;
    email?: string;
    branch1Title?: string;
    branch1Hours?: string;
    headOfficeTitle?: string;
    headOfficeHours?: string;
    onlineHours?: string;
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
  agreement: {
    version: "VISAMN-SERVICE-AGREEMENT-2026.02",
    template: `Огноо: {{DATE}}    Гэрээний №: {{CONTRACT_NUMBER}}    Улаанбаатар хот

Энэхүү гэрээг Монгол Улсын Иргэний хуулийн 343–358, 359–368 дугаар зүйлүүд болон холбогдох бусад хууль тогтоомжийг үндэслэн дараах талууд харилцан тохиролцож байгуулав:

I. ТАЛУУД
Гүйцэтгэгч (“А тал”): VISAMN ХХК
Имэйл: info@visamn.com

Захиалагч (“Б тал”):
Овог, нэр: {{CLIENT_NAME}}
Регистр: {{CLIENT_REGISTRY}}
Хаяг: {{CLIENT_ADDRESS}}
Утас: {{CLIENT_PHONE}}
Имэйл: {{CLIENT_EMAIL}}

II. ГЭРЭЭНИЙ ЗОРИЛГО, ЭРХ ЗҮЙН ШИНЖ
2.1. Энэхүү гэрээ нь мэргэжлийн зөвлөх үйлчилгээ үзүүлэх тухай хөлсөөр ажиллах гэрээ болно.
2.2. “А тал” нь виз мэдүүлэх үйл явцад зөвлөх, бэлтгэх, зохион байгуулах үйлчилгээ үзүүлэх бөгөөд виз олгох шийдвэр гаргах эрх бүхий этгээд биш.
2.3. Виз олгох эсэх шийдвэр нь тухайн улсын Элчин сайдын яам, Консулын газрын бүрэн эрхэд хамаарна.

III. ҮЙЛЧИЛГЭЭНИЙ АГУУЛГА
3.1. Визийн эрсдэлийн урьдчилсан үнэлгээ
3.2. Материал бүрдүүлэлтийн стратеги боловсруулах
3.3. Баримт бичгийн хяналт, зөвлөмж
3.4. Анкет болон холбогдох маягт бөглөх
3.5. Элчин сайдын яамны цаг захиалах
3.6. Ярилцлагын мэргэжлийн бэлтгэл
3.7. Визийн явцын мэдээлэл, зөвлөмж

IV. ҮЙЛЧИЛГЭЭНИЙ ХӨЛС, ТӨЛБӨР
4.1. Үйлчилгээний хөлс: {{SERVICE_FEE_MNT}} төгрөг.
4.2. Төлбөрийг 100% урьдчилан төлнө.
4.3. Гэрээ байгуулж, үйлчилгээ эхэлснээс хойш үйлчилгээний хөлс буцаагдахгүй.`,
  },
  quickHelp: {
    title: "Quick Help",
    description: "Need support or visa updates? Check our latest guides.",
    facebookUrl: "https://www.facebook.com",
    phone: "0000000",
    email: "support@visamn.com",
    branch1Title: "Салбар 1",
    branch1Hours: "Даваа-Баасан: 09:00-18:00\nБямба, Ням: 10:00-19:00",
    headOfficeTitle: "Төв оффис",
    headOfficeHours: "Даваа-Баасан: 08:00-18:00\nБямба, Ням: Амарна",
    onlineHours: "Онлайнаар амралтын өдрүүдэд 10:00-19:00 ажиллана",
  },
};

const normalizeSettings = (raw?: Partial<SiteSettings> | null): SiteSettings => ({
  ...DEFAULT_SITE_SETTINGS,
  ...(raw || {}),
  maintenance: {
    ...DEFAULT_SITE_SETTINGS.maintenance,
    ...(raw?.maintenance || {}),
  },
  visibility: {
    ...DEFAULT_SITE_SETTINGS.visibility,
    ...(raw?.visibility || {}),
  },
  agreement: {
    ...DEFAULT_SITE_SETTINGS.agreement,
    ...(raw?.agreement || {}),
  },
  quickHelp: {
    ...DEFAULT_SITE_SETTINGS.quickHelp,
    ...(raw?.quickHelp || {}),
  },
});

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
      if (next) setSettings(normalizeSettings(next));
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
