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
  homePage: {
    sectionOrder: Array<"hero" | "features" | "blog" | "news">;
    sectionVisibility: {
      hero: boolean;
      features: boolean;
      blog: boolean;
      news: boolean;
    };
    hero: {
      titleLine1?: string;
      titleLine2?: string;
      titleLine3?: string;
      subtitle?: string;
      primaryCta?: string;
      secondaryCta?: string;
      guideCta?: string;
      installPitch?: string;
    };
    featuredArticles: {
      title?: string;
      subtitle?: string;
    };
    latestNews: {
      title?: string;
      subtitle?: string;
    };
    labels: {
      installButton?: string;
      viewAllButton?: string;
      appointmentEyebrow?: string;
      appointmentTitle?: string;
      appointmentStartLabel?: string;
      appointmentEndLabel?: string;
      appointmentDescription?: string;
      blogEmptyState?: string;
      newsEmptyState?: string;
    };
    featureItems: Array<{
      id: "secure" | "fast" | "errorPrevention" | "support";
      icon?: "shield" | "zap" | "checkCircle" | "users";
      title?: string;
      description?: string;
      enabled?: boolean;
    }>;
  };
  galleryHeroImageUrl?: string;
  galleryDemoItems: Array<{
    id: number;
    src: string;
    alt: string;
    title?: string;
    category: string;
    tags?: string[];
    description?: string;
    published?: boolean;
  }>;
  qAndAItems: Array<{
    q: string;
    a: string;
  }>;
};

const HOME_SECTION_IDS = ["hero", "features", "blog", "news"] as const;
const DEFAULT_HOME_FEATURE_ITEMS: SiteSettings["homePage"]["featureItems"] = [
  { id: "secure", icon: "shield", title: "", description: "", enabled: true },
  { id: "fast", icon: "zap", title: "", description: "", enabled: true },
  { id: "errorPrevention", icon: "checkCircle", title: "", description: "", enabled: true },
  { id: "support", icon: "users", title: "", description: "", enabled: true },
];

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
    title: "Шуурхай тусламж",
    description: "Дэмжлэг болон үйлчилгээний мэдээлэл авах бол бидэнтэй холбогдоорой.",
    facebookUrl: "",
    phone: "0000000",
    email: "support@visamn.com",
    branch1Title: "Салбар 1",
    branch1Hours: "Даваа-Баасан: 09:00-18:00\nБямба, Ням: 10:00-19:00",
    headOfficeTitle: "Төв оффис",
    headOfficeHours: "Даваа-Баасан: 08:00-18:00\nБямба, Ням: Амарна",
    onlineHours: "Онлайнаар амралтын өдрүүдэд 10:00-19:00 ажиллана",
  },
  homePage: {
    sectionOrder: [...HOME_SECTION_IDS],
    sectionVisibility: {
      hero: true,
      features: true,
      blog: true,
      news: true,
    },
    hero: {
      titleLine1: "",
      titleLine2: "",
      titleLine3: "",
      subtitle: "",
      primaryCta: "",
      secondaryCta: "",
      guideCta: "",
      installPitch: "",
    },
    featuredArticles: {
      title: "",
      subtitle: "",
    },
    latestNews: {
      title: "",
      subtitle: "",
    },
    labels: {
      installButton: "",
      viewAllButton: "",
      appointmentEyebrow: "",
      appointmentTitle: "",
      appointmentStartLabel: "",
      appointmentEndLabel: "",
      appointmentDescription: "",
      blogEmptyState: "",
      newsEmptyState: "",
    },
    featureItems: DEFAULT_HOME_FEATURE_ITEMS,
  },
  galleryHeroImageUrl:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1800&auto=format&fit=crop&q=80",
  galleryDemoItems: [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80",
      alt: "Airplane wing over clouds",
      title: "Airplane wing over clouds",
      category: "travel",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop&q=80",
      alt: "US Capitol Building",
      title: "US Capitol Building",
      category: "destinations",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&auto=format&fit=crop&q=80",
      alt: "New York City skyline",
      title: "New York City skyline",
      category: "destinations",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop&q=80",
      alt: "Golden Gate Bridge",
      title: "Golden Gate Bridge",
      category: "destinations",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop&q=80",
      alt: "Grand Canyon",
      title: "Grand Canyon",
      category: "nature",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop&q=80",
      alt: "Statue of Liberty",
      title: "Statue of Liberty",
      category: "landmarks",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
      alt: "Los Angeles downtown",
      title: "Los Angeles downtown",
      category: "destinations",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=80",
      alt: "City at night",
      title: "City at night",
      category: "destinations",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 9,
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80",
      alt: "Mountain landscape",
      title: "Mountain landscape",
      category: "nature",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 10,
      src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop&q=80",
      alt: "City street view",
      title: "City street view",
      category: "destinations",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 11,
      src: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800&auto=format&fit=crop&q=80",
      alt: "Las Vegas strip",
      title: "Las Vegas strip",
      category: "destinations",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 12,
      src: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80",
      alt: "Travel adventure",
      title: "Travel adventure",
      category: "travel",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 13,
      src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80",
      alt: "Lake and mountains",
      title: "Lake and mountains",
      category: "nature",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 14,
      src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
      alt: "Scenic cityscape",
      title: "Scenic cityscape",
      category: "destinations",
      tags: [],
      description: "",
      published: true,
    },
    {
      id: 15,
      src: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&auto=format&fit=crop&q=80",
      alt: "Travel passport and map",
      title: "Travel passport and map",
      category: "travel",
      tags: [],
      description: "",
      published: true,
    },
  ],
  qAndAItems: [
    {
      q: "Визийн зөвлөгөө авахын тулд заавал оффис дээр очих уу?",
      a: "Үгүй. Та онлайнаар мэдээллээ өгч, мэргэжлийн зөвлөгөөг бүрэн авах боломжтой. Шаардлагатай тохиолдолд биечлэн уулзалт хийнэ.",
    },
    {
      q: "Баримт бичиг дутуу бол яах вэ?",
      a: "Манай баг таны баримтыг нягталж, дутуу жагсаалтыг үе шат бүрээр гаргаж өгнө. Бүрдүүлэлт дуусах хүртэл хяналттай ажиллана.",
    },
    {
      q: "Үйлчилгээний хугацаа хэд хоног вэ?",
      a: "Кейсийн төрөл болон улсын шаардлагаас хамаарч ялгаатай. Ихэнх тохиолдолд 1–2 хоногт өргөдөл бэлэн болгох боломжтой.",
    },
    {
      q: "Express үйлчилгээ гэж юу вэ?",
      a: "Яаралтай тохиолдолд баримтын шалгалт, зөвлөгөө, бүрдүүлэлтийг түргэвчилж гүйцэтгэнэ. Express үйлчилгээний нэмэгдэл төлбөр үйлчилнэ.",
    },
    {
      q: "Мэдүүлгээ хаанаас хянах вэ?",
      a: "Нэвтэрсэн хэрэглэгч өөрийн профайл дахь Inbox/Tracking хэсгээс явцаа бодит цагт хянана.",
    },
    {
      q: "АНУ-ын визийн үйлчилгээ ямар алхмаар явах вэ?",
      a: "Кейс үнэлгээ → баримт шалгалт → анкет/маягт бэлтгэл → цаг захиалга → ярилцлагын чиглүүлэг гэсэн дарааллаар явна.",
    },
    {
      q: "Шенген, Их Британи, Канад зэрэг бусад улсад тусалдаг уу?",
      a: "Тийм. Улс тус бүрийн шаардлагад нийцсэн бүрдүүлэлт, баримтын бүтэц, зөвлөмжийг тусад нь өгдөг.",
    },
    {
      q: "Орчуулгын үйлчилгээ яаж ажилладаг вэ?",
      a: "Файлаа Translation Service дээр илгээж хүсэлт үүсгэнэ. Хуудасны тоо, төрлөөс хамаарч үнэ ба хугацааг баталгаажуулж ажил эхлүүлнэ.",
    },
    {
      q: "Нислэг, буудал, itinerary бэлтгэж өгдөг үү?",
      a: "Тийм. Визийн материалд шаардлагатай нислэгийн төлөвлөгөө, буудлын мэдээлэл, аяллын хөтөлбөрийг кейсийн дагуу бэлтгэнэ.",
    },
    {
      q: "Даатгалын баримт дээр юуг хамгийн их анхаарах вэ?",
      a: "Аяллын бүх хугацааг хамарсан эсэх, нөхөн төлбөрийн дүн хүрэлцээтэй эсэх, нэр/паспортын мэдээлэл зөв эсэхийг нягтална.",
    },
    {
      q: "Төлбөр төлөхийн өмнө гэрээ баталгаажуулах уу?",
      a: "Тийм. Үйлчилгээний нөхцөл, хариуцлагын заалттай онлайн гэрээг зөвшөөрсний дараа төлбөрийн процесс үргэлжилнэ.",
    },
    {
      q: "Чат дэмжлэгээр админтай шууд харилцаж болох уу?",
      a: "Болно. Contact Support хэсгээр шууд чат эхлүүлж, явцын шинэчлэл болон шаардлагатай тайлбарыг цаг тухайд нь авна.",
    },
  ],
};

const normalizeSectionOrder = (
  sectionOrder?: Array<"hero" | "features" | "blog" | "news">
): SiteSettings["homePage"]["sectionOrder"] => {
  const unique = Array.from(new Set(sectionOrder || []));
  const filtered = unique.filter((id): id is (typeof HOME_SECTION_IDS)[number] =>
    HOME_SECTION_IDS.includes(id as (typeof HOME_SECTION_IDS)[number])
  );
  for (const sectionId of HOME_SECTION_IDS) {
    if (!filtered.includes(sectionId)) filtered.push(sectionId);
  }
  return filtered;
};

const normalizeFeatureItems = (
  items?: SiteSettings["homePage"]["featureItems"]
): SiteSettings["homePage"]["featureItems"] => {
  const byId = new Map(items?.map((item) => [item.id, item]) || []);
  return DEFAULT_HOME_FEATURE_ITEMS.map((base) => {
    const override = byId.get(base.id);
    return {
      ...base,
      ...(override || {}),
      id: base.id,
      enabled: override?.enabled ?? base.enabled,
      icon: override?.icon || base.icon,
    };
  });
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
  homePage: {
    ...DEFAULT_SITE_SETTINGS.homePage,
    ...(raw?.homePage || {}),
    sectionOrder: normalizeSectionOrder(raw?.homePage?.sectionOrder),
    sectionVisibility: {
      ...DEFAULT_SITE_SETTINGS.homePage.sectionVisibility,
      ...(raw?.homePage?.sectionVisibility || {}),
    },
    hero: {
      ...DEFAULT_SITE_SETTINGS.homePage.hero,
      ...(raw?.homePage?.hero || {}),
    },
    featuredArticles: {
      ...DEFAULT_SITE_SETTINGS.homePage.featuredArticles,
      ...(raw?.homePage?.featuredArticles || {}),
    },
    latestNews: {
      ...DEFAULT_SITE_SETTINGS.homePage.latestNews,
      ...(raw?.homePage?.latestNews || {}),
    },
    labels: {
      ...DEFAULT_SITE_SETTINGS.homePage.labels,
      ...(raw?.homePage?.labels || {}),
    },
    featureItems: normalizeFeatureItems(raw?.homePage?.featureItems),
  },
  galleryHeroImageUrl:
    typeof raw?.galleryHeroImageUrl === "string" && raw.galleryHeroImageUrl.trim().length > 0
      ? raw.galleryHeroImageUrl.trim()
      : DEFAULT_SITE_SETTINGS.galleryHeroImageUrl,
  galleryDemoItems:
    Array.isArray(raw?.galleryDemoItems) && raw?.galleryDemoItems.length > 0
      ? raw.galleryDemoItems
      : DEFAULT_SITE_SETTINGS.galleryDemoItems,
  qAndAItems: Array.isArray(raw?.qAndAItems) && raw?.qAndAItems.length > 0
    ? raw.qAndAItems
    : DEFAULT_SITE_SETTINGS.qAndAItems,
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
