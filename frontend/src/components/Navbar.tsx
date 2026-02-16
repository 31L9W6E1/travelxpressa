import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Bell,
  BookOpen,
  Facebook,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  CreditCard,
  FileText,
  House,
  Image,
  Info,
  ListChecks,
  Languages,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Newspaper,
  Plane,
  Sun,
  Shield,
  Settings,
  User,
  X,
} from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import api from "@/api/client";
import { useTheme } from "@/contexts/ThemeContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  to: string;
};

const navItemBaseClass =
  "flex items-center gap-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors";

const BRAND_LOGO_ICON = "/branding/logo-icon.png";
const BRAND_LOGO_TEXT = "/branding/logo-visamn.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);

  const notificationDesktopRef = useRef<HTMLDivElement>(null);
  const notificationMobileRef = useRef<HTMLDivElement>(null);
  const userMenuDesktopRef = useRef<HTMLDivElement>(null);
  const userMenuMobileRef = useRef<HTMLDivElement>(null);

  const notificationStorageKey = user ? `seen_notifications_${user.role}_${user.id}` : null;

  const persistSeenNotifications = (next: string[]) => {
    if (!notificationStorageKey) return;
    try {
      localStorage.setItem(notificationStorageKey, JSON.stringify(next.slice(-300)));
    } catch {
      // Ignore storage errors in private mode / restricted environments.
    }
  };

  const markNotificationsSeen = (ids: string[]) => {
    if (!ids.length) return;
    setSeenNotificationIds((prev) => {
      const merged = Array.from(new Set([...prev, ...ids]));
      persistSeenNotifications(merged);
      return merged;
    });
    setNotifications((prev) => prev.filter((item) => !ids.includes(item.id)));
    setNotificationCount((prev) => Math.max(0, prev - ids.length));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (isNotificationOpen) {
        const clickedNotificationDesktop = notificationDesktopRef.current?.contains(target);
        const clickedNotificationMobile = notificationMobileRef.current?.contains(target);
        if (!clickedNotificationDesktop && !clickedNotificationMobile) {
          setIsNotificationOpen(false);
        }
      }

      if (isUserMenuOpen) {
        const clickedUserDesktop = userMenuDesktopRef.current?.contains(target);
        const clickedUserMobile = userMenuMobileRef.current?.contains(target);
        if (!clickedUserDesktop && !clickedUserMobile) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen, isUserMenuOpen]);

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", isSidebarCollapsed ? "72px" : "240px");
  }, [isSidebarCollapsed]);

  useEffect(() => {
    return () => {
      document.documentElement.style.setProperty("--sidebar-width", "240px");
    };
  }, []);

  useEffect(() => {
    if (!notificationStorageKey) {
      setSeenNotificationIds([]);
      return;
    }

    try {
      const raw = localStorage.getItem(notificationStorageKey);
      if (!raw) {
        setSeenNotificationIds([]);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        setSeenNotificationIds(parsed.map((item) => String(item)));
      } else {
        setSeenNotificationIds([]);
      }
    } catch {
      setSeenNotificationIds([]);
    }
  }, [notificationStorageKey]);

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setNotificationCount(0);
        return;
      }

      try {
        if (user.role === "ADMIN") {
          const [pendingInquiriesRes, openThreadsRes] = await Promise.all([
            api.get("/api/admin/inquiries", { params: { limit: 5, status: "PENDING" } }),
            api.get("/api/chat/threads"),
          ]);

          const pendingInquiries = pendingInquiriesRes.data?.data || [];
          const openThreads = (openThreadsRes.data?.data || [])
            .filter((thread: any) => thread.status === "OPEN")
            .filter((thread: any) => Number(thread?._count?.messages || 0) > 0);

          const next: NotificationItem[] = [];
          for (const item of pendingInquiries.slice(0, 3)) {
            const version = item?.updatedAt || item?.createdAt || "";
            next.push({
              id: `inq-${item.id}-${version}`,
              title: item.name || item.email || "Pending Inquiry",
              subtitle: "Translation/Support request pending",
              to: "/admin/requests",
            });
          }
          for (const item of openThreads.slice(0, 2)) {
            const messageCount = Number(item?._count?.messages || 0);
            next.push({
              id: `thread-${item.id}-${messageCount}`,
              title: item.user?.name || item.user?.email || "Open support thread",
              subtitle: `${messageCount} unread message(s)`,
              to: `/contactsupport?threadId=${item.id}`,
            });
          }
          if (!cancelled) {
            const unseen = next.filter((item) => !seenNotificationIds.includes(item.id));
            setNotifications(unseen);
            setNotificationCount(Math.min(99, unseen.length));
          }
          return;
        }

        const [myInquiriesRes, myThreadsRes] = await Promise.all([
          api.get("/api/inquiries/user", { params: { limit: 5 } }),
          api.get("/api/chat/threads"),
        ]);
        const myInquiries = myInquiriesRes.data?.data || [];
        const myThreads = myThreadsRes.data?.data || [];
        const unreadThreads = myThreads.filter((thread: any) => Number(thread?._count?.messages || 0) > 0);
        const next: NotificationItem[] = [];

        for (const item of myInquiries.slice(0, 3)) {
          const version = item?.updatedAt || item?.createdAt || "";
          next.push({
            id: `my-inq-${item.id}-${version}`,
            title: `${item.serviceType || "Request"} • ${item.status || "Pending"}`,
            subtitle: "Check your inbox for updates",
            to: "/profile/inbox",
          });
        }
        for (const item of unreadThreads.slice(0, 2)) {
          const messageCount = Number(item?._count?.messages || 0);
          next.push({
            id: `my-thread-${item.id}-${messageCount}`,
            title: item.subject || "Support conversation",
            subtitle: `${messageCount} new message(s)`,
            to: `/contactsupport?threadId=${item.id}`,
          });
        }
        if (!cancelled) {
          const unseen = next.filter((item) => !seenNotificationIds.includes(item.id));
          setNotifications(unseen);
          setNotificationCount(Math.min(99, unseen.length));
        }
      } catch {
        if (!cancelled) {
          setNotifications([]);
          setNotificationCount(0);
        }
      }
    };

    void loadNotifications();

    if (!user) return () => {};

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 20_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [seenNotificationIds, t, user]);

  const closeMobileMenu = () => setIsMenuOpen(false);

  const closeAllMenus = () => {
    setIsUserMenuOpen(false);
    setIsNotificationOpen(false);
  };

  const renderNotifications = (isMobile: boolean) => (
    <>
      {notifications.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground text-center">
          {t("nav.noNotifications", { defaultValue: "No new notifications" })}
        </p>
      ) : (
        notifications.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            onClick={() => {
              markNotificationsSeen([item.id]);
              setIsNotificationOpen(false);
              if (isMobile) closeMobileMenu();
            }}
            className="block px-4 py-3 hover:bg-secondary transition-colors border-b last:border-b-0 border-border"
          >
            <p className="text-sm text-card-foreground font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
          </Link>
        ))
      )}
    </>
  );

  const renderUserMenu = (isMobile: boolean) => (
    <div className="py-1">
      {user?.role === "ADMIN" && (
        <Link
          to="/admin"
          onClick={() => {
            closeAllMenus();
            if (isMobile) closeMobileMenu();
          }}
          className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Settings className="w-4 h-4" />
          {t("nav.admin")}
        </Link>
      )}

      {user && (
        <Link
          to="/contactsupport"
          onClick={() => {
            closeAllMenus();
            if (isMobile) closeMobileMenu();
          }}
          className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          {t("nav.support", { defaultValue: "Support" })}
        </Link>
      )}

      {user ? (
        <>
          <Link
            to="/profile"
            onClick={() => {
              closeAllMenus();
              if (isMobile) closeMobileMenu();
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <User className="w-4 h-4" />
            {t("nav.profile")}
          </Link>
          <Link
            to="/profile"
            onClick={() => {
              closeAllMenus();
              if (isMobile) closeMobileMenu();
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <FileText className="w-4 h-4" />
            {t("nav.applications")}
          </Link>
          <Link
            to="/profile"
            onClick={() => {
              closeAllMenus();
              if (isMobile) closeMobileMenu();
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            {t("nav.payments")}
          </Link>
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={() => {
                void logout();
                closeAllMenus();
                if (isMobile) closeMobileMenu();
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-destructive hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("nav.logout")}
            </button>
          </div>
        </>
      ) : (
        <>
          <Link
            to="/login"
            onClick={() => {
              closeAllMenus();
              if (isMobile) closeMobileMenu();
            }}
            className="block px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {t("nav.signIn")}
          </Link>
          <Link
            to="/login"
            onClick={() => {
              closeAllMenus();
              if (isMobile) closeMobileMenu();
            }}
            className="block px-4 py-2.5 text-primary-foreground bg-primary hover:opacity-90 transition-opacity rounded-md mx-2 text-center font-medium"
          >
            {t("nav.getStarted")}
          </Link>
        </>
      )}
    </div>
  );

  const desktopLinkClass = `${navItemBaseClass} px-3`;
  const mobileLinkClass = `${navItemBaseClass} px-3`;
  const quickHelp = settings.quickHelp;
  const quickHelpFacebookUrl = (quickHelp.facebookUrl || "https://www.facebook.com").trim();
  const isMongolian = i18n.resolvedLanguage?.toLowerCase().startsWith("mn") ?? false;
  const quickHelpTitle =
    isMongolian && quickHelp.title?.trim() === "Quick Help"
      ? t("nav.quickHelp", { defaultValue: "Шуурхай тусламж" })
      : quickHelp.title || t("nav.quickHelp", { defaultValue: "Quick Help" });
  const quickHelpDescription =
    isMongolian && quickHelp.description?.trim() === "Need support or visa updates? Check our latest guides."
      ? t("nav.quickHelpText", {
          defaultValue: "Дэмжлэг болон визийн шинэчлэлт хэрэгтэй бол бидэнтэй холбогдоорой.",
        })
      : quickHelp.description ||
        t("nav.quickHelpText", {
          defaultValue: "Need support or visa updates? Check our latest guides.",
        });
  const contactSupportLabel = t("nav.contactSupport", {
    defaultValue: isMongolian ? "Дэмжлэгтэй холбогдох" : "Contact support",
  });
  const renderLines = (value?: string) =>
    String(value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const staticBreadcrumbLabels: Record<string, string> = {
    about: t("nav.about", { defaultValue: "About" }),
    "learn-more": t("nav.learnMore", { defaultValue: "Learn More" }),
    "translation-service": t("nav.translationService", { defaultValue: "Translation Service" }),
    gallery: t("nav.gallery", { defaultValue: "Gallery" }),
    news: t("nav.news", { defaultValue: "News" }),
    blog: t("nav.articles", { defaultValue: "Articles" }),
    feedback: t("nav.feedback", { defaultValue: "Feedback" }),
    "q-and-a": t("nav.qAndA", { defaultValue: "Q&A" }),
    faq: t("nav.qAndA", { defaultValue: "Q&A" }),
    "help-center": t("nav.helpCenter", { defaultValue: "Help Center" }),
    flight: t("nav.flight", { defaultValue: "Flight" }),
    insurance: t("nav.insurance", { defaultValue: "Insurance" }),
    profile: t("nav.profile", { defaultValue: "Profile" }),
    inbox: t("profile.inbox", { defaultValue: "Inbox" }),
    security: t("profile.security", { defaultValue: "Security" }),
    application: t("nav.applications", { defaultValue: "Applications" }),
    admin: t("nav.admin", { defaultValue: "Admin" }),
    overview: t("admin.overview", { defaultValue: "Overview" }),
    users: t("admin.users", { defaultValue: "Users" }),
    applications: t("nav.applications", { defaultValue: "Applications" }),
    requests: t("admin.requests", { defaultValue: "Requests" }),
    tracking: t("admin.tracking", { defaultValue: "Tracking" }),
    payments: t("nav.payments", { defaultValue: "Payments" }),
    analytics: t("admin.analytics", { defaultValue: "Analytics" }),
    cms: "CMS",
    "contactsupport": t("nav.support", { defaultValue: "Support" }),
    "select-country": t("nav.apply", { defaultValue: "Apply" }),
    ready: t("ready.pageTitle", { defaultValue: "Ready" }),
    guide: t("nav.guide", { defaultValue: "Guide" }),
  };
  const toTitleCase = (value: string) =>
    value
      .split(/[-_]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const decoded = decodeURIComponent(segment);
    const normalized = decoded.toLowerCase();
    const previous = pathSegments[index - 1]?.toLowerCase();

    let label = staticBreadcrumbLabels[normalized];
    if (!label && (previous === "news" || previous === "blog")) {
      label = t("common.article", { defaultValue: "Article" });
    }
    if (!label && normalized.length > 30) {
      label = t("common.details", { defaultValue: "Details" });
    }
    if (!label) {
      label = toTitleCase(decoded);
    }

    return { href, label };
  });

  return (
    <>
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 z-40 bg-background border-r border-dashed border-border/70 flex-col transition-[width] duration-300"
        style={{ width: isSidebarCollapsed ? "72px" : "240px" }}
      >
        <div className="h-16 px-3 flex items-center border-b border-dashed border-border/70">
          <Link to="/" className={`flex items-center ${isSidebarCollapsed ? "justify-center w-full" : "gap-2 min-w-0"}`}>
            <img
              src={isSidebarCollapsed ? BRAND_LOGO_ICON : BRAND_LOGO_TEXT}
              alt="Visamn"
              className={isSidebarCollapsed ? "w-11 h-11 object-contain shrink-0" : "h-10 w-auto max-w-[180px] object-contain shrink-0"}
              loading="eager"
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {!isSidebarCollapsed && (
            <div className="px-3 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {t("nav.menu", { defaultValue: "Main Menu" })}
              </p>
            </div>
          )}

          <Link to="/" className={desktopLinkClass} title={t("nav.home", { defaultValue: "Home" })}>
            <House className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>{t("nav.home", { defaultValue: "Home" })}</span>}
          </Link>
          <Link to="/guide" className={desktopLinkClass} title={t("nav.guide", { defaultValue: "Guide" })}>
            <ListChecks className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>{t("nav.guide", { defaultValue: "Guide" })}</span>}
          </Link>

          {settings.visibility.about && (
            <Link to="/about" className={desktopLinkClass} title={t("nav.about")}>
              <Info className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{t("nav.about")}</span>}
            </Link>
          )}
          {settings.visibility.learnMore && (
            <Link to="/learn-more" className={desktopLinkClass} title={t("nav.learnMore")}>
              <BookOpen className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{t("nav.learnMore")}</span>}
            </Link>
          )}
          {settings.visibility.flight && (
            <Link to="/flight" className={desktopLinkClass} title={t("nav.flight", { defaultValue: "Flight" })}>
              <Plane className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{t("nav.flight", { defaultValue: "Flight" })}</span>}
            </Link>
          )}
          {settings.visibility.insurance && (
            <Link
              to="/insurance"
              className={desktopLinkClass}
              title={t("nav.insurance", { defaultValue: "Insurance" })}
            >
              <Shield className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{t("nav.insurance", { defaultValue: "Insurance" })}</span>}
            </Link>
          )}
          {settings.visibility.helpCenter && (
            <Link
              to="/help-center"
              className={desktopLinkClass}
              title={t("nav.helpCenter", { defaultValue: "Help Center" })}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{t("nav.helpCenter", { defaultValue: "Help Center" })}</span>}
            </Link>
          )}
          {settings.visibility.qAndA && (
            <Link to="/q-and-a" className={desktopLinkClass} title={t("nav.qAndA", { defaultValue: "Q&A" })}>
              <BookOpen className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{t("nav.qAndA", { defaultValue: "Q&A" })}</span>}
            </Link>
          )}
          {settings.visibility.feedback && (
            <Link to="/feedback" className={desktopLinkClass} title={t("nav.feedback", { defaultValue: "Feedback" })}>
              <FileText className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{t("nav.feedback", { defaultValue: "Feedback" })}</span>}
            </Link>
          )}
          {settings.visibility.translationService && (
            <Link
              to="/translation-service"
              className={desktopLinkClass}
              title={t("nav.translationService", { defaultValue: "Translation Service" })}
            >
              <Languages className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <span>{t("nav.translationService", { defaultValue: "Translation Service" })}</span>
              )}
            </Link>
          )}
          {settings.visibility.gallery && (
            <Link to="/gallery" className={desktopLinkClass} title={t("nav.gallery", { defaultValue: "Gallery" })}>
              <Image className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{t("nav.gallery", { defaultValue: "Gallery" })}</span>}
            </Link>
          )}
          {settings.visibility.news && (
            <Link to="/news" className={desktopLinkClass} title={t("nav.news", { defaultValue: "News" })}>
              <Newspaper className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{t("nav.news", { defaultValue: "News" })}</span>}
            </Link>
          )}
          {settings.visibility.blog && (
            <Link to="/blog" className={desktopLinkClass} title={t("nav.articles", { defaultValue: "Articles" })}>
              <FileText className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{t("nav.articles", { defaultValue: "Articles" })}</span>}
            </Link>
          )}

          {user && user.role !== "ADMIN" && (
            <>
              <div className="my-2 border-t border-dashed border-border/70" />
              <Link to="/select-country" className={desktopLinkClass} title={t("nav.apply")}>
                <FileText className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>{t("nav.apply")}</span>}
              </Link>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-dashed border-border/70">
          {isSidebarCollapsed ? (
            <Link
              to="/contactsupport"
              className="h-10 w-10 mx-auto rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={t("nav.quickHelp", { defaultValue: "Quick Help" })}
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {quickHelpTitle}
              </p>
              <p className="text-sm text-foreground mt-1">
                {quickHelpDescription}
              </p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {quickHelp.phone ? <p>Утасны дугаар: {quickHelp.phone}</p> : null}
                {quickHelp.email ? <p>И-мэйл: {quickHelp.email}</p> : null}
                {quickHelp.branch1Title ? <p className="pt-1 font-medium text-foreground">{quickHelp.branch1Title}</p> : null}
                {renderLines(quickHelp.branch1Hours).map((line, idx) => (
                  <p key={`b1-${idx}`}>{line}</p>
                ))}
                {quickHelp.headOfficeTitle ? <p className="pt-1 font-medium text-foreground">{quickHelp.headOfficeTitle}</p> : null}
                {renderLines(quickHelp.headOfficeHours).map((line, idx) => (
                  <p key={`ho-${idx}`}>{line}</p>
                ))}
                {renderLines(quickHelp.onlineHours).map((line, idx) => (
                  <p key={`on-${idx}`} className="pt-1">{line}</p>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  to="/contactsupport"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {contactSupportLabel}
                </Link>
                <span className="text-muted-foreground">•</span>
                <a
                  href={quickHelpFacebookUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  Facebook
                </a>
              </div>
            </div>
          )}
        </div>
      </aside>

      <header className="hidden md:flex fixed top-0 left-[var(--sidebar-width,240px)] right-0 z-30 h-16 bg-background/90 backdrop-blur-md border-b border-dashed border-border/70 px-6 items-center justify-between transition-[left] duration-300">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="h-9 w-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          <div className="min-w-0">
            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap gap-2">
                <BreadcrumbItem>
                  {breadcrumbItems.length === 0 ? (
                    <BreadcrumbPage>{t("nav.home", { defaultValue: "Home" })}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to="/">{t("nav.home", { defaultValue: "Home" })}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1;
                  return (
                    <Fragment key={item.href}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem className="min-w-0 max-w-[180px]">
                        {isLast ? (
                          <BreadcrumbPage className="truncate">{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={item.href} className="truncate">
                              {item.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="relative" ref={notificationDesktopRef}>
              <button
                onClick={() => {
                  const nextOpen = !isNotificationOpen;
                  setIsNotificationOpen(nextOpen);
                  setIsUserMenuOpen(false);
                  if (nextOpen) {
                    markNotificationsSeen(notifications.map((item) => item.id));
                  }
                }}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1rem))] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-card-foreground">
                      {t("nav.notifications", { defaultValue: "Notifications" })}
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">{renderNotifications(false)}</div>
                </div>
              )}
            </div>
          )}

          <LanguageSwitcher />

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative" ref={userMenuDesktopRef}>
            {user ? (
              <button
                onClick={() => {
                  setIsUserMenuOpen((prev) => !prev);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
              >
                <UserAvatar seed={user.id} name={user.name} email={user.email} size="sm" />
                <span className="text-sm font-medium max-w-28 truncate">{user.name || user.email?.split("@")[0]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.signIn")}
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  {t("nav.getStarted")}
                </Link>
              </div>
            )}

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-[min(14rem,calc(100vw-1rem))] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                {user && (
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm text-card-foreground font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                )}
                {renderUserMenu(false)}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-md border-b border-dashed border-border/70 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <img
              src={BRAND_LOGO_TEXT}
              alt="Visamn"
              className="h-8 w-auto max-w-[170px] object-contain"
              loading="eager"
            />
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {user && (
            <div className="relative" ref={notificationMobileRef}>
              <button
                onClick={() => {
                  const nextOpen = !isNotificationOpen;
                  setIsNotificationOpen(nextOpen);
                  setIsUserMenuOpen(false);
                  if (nextOpen) {
                    markNotificationsSeen(notifications.map((item) => item.id));
                  }
                }}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1rem))] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-card-foreground">
                      {t("nav.notifications", { defaultValue: "Notifications" })}
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">{renderNotifications(true)}</div>
                </div>
              )}
            </div>
          )}

          <LanguageSwitcher />

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative" ref={userMenuMobileRef}>
            <button
              onClick={() => {
                setIsUserMenuOpen((prev) => !prev);
                setIsNotificationOpen(false);
              }}
              className="flex items-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {user ? <UserAvatar seed={user.id} name={user.name} email={user.email} size="sm" /> : <User className="w-5 h-5" />}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-[min(14rem,calc(100vw-1rem))] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                {user && (
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm text-card-foreground font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                )}
                {renderUserMenu(true)}
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={closeMobileMenu} />}

      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-[240px] bg-background border-r border-dashed border-border/70 transform transition-transform duration-300 flex flex-col h-[100dvh] overflow-hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-dashed border-border/70">
          <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <img
              src={BRAND_LOGO_TEXT}
              alt="Visamn"
              className="h-8 w-auto max-w-[170px] object-contain"
              loading="eager"
            />
          </Link>
          <button
            className="p-2 rounded-lg text-foreground hover:bg-secondary"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-1">
          <div className="px-3 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {t("nav.menu", { defaultValue: "Main Menu" })}
            </p>
          </div>

          <Link to="/" className={mobileLinkClass} onClick={closeMobileMenu}>
            <House className="w-4 h-4 shrink-0" />
            <span>{t("nav.home", { defaultValue: "Home" })}</span>
          </Link>
          <Link to="/guide" className={mobileLinkClass} onClick={closeMobileMenu}>
            <ListChecks className="w-4 h-4 shrink-0" />
            <span>{t("nav.guide", { defaultValue: "Guide" })}</span>
          </Link>

          {settings.visibility.about && (
            <Link to="/about" className={mobileLinkClass} onClick={closeMobileMenu}>
              <Info className="w-4 h-4 shrink-0" />
              <span>{t("nav.about")}</span>
            </Link>
          )}
          {settings.visibility.learnMore && (
            <Link to="/learn-more" className={mobileLinkClass} onClick={closeMobileMenu}>
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{t("nav.learnMore")}</span>
            </Link>
          )}
          {settings.visibility.flight && (
            <Link to="/flight" className={mobileLinkClass} onClick={closeMobileMenu}>
              <Plane className="w-4 h-4 shrink-0" />
              <span>{t("nav.flight", { defaultValue: "Flight" })}</span>
            </Link>
          )}
          {settings.visibility.insurance && (
            <Link to="/insurance" className={mobileLinkClass} onClick={closeMobileMenu}>
              <Shield className="w-4 h-4 shrink-0" />
              <span>{t("nav.insurance", { defaultValue: "Insurance" })}</span>
            </Link>
          )}
          {settings.visibility.helpCenter && (
            <Link to="/help-center" className={mobileLinkClass} onClick={closeMobileMenu}>
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>{t("nav.helpCenter", { defaultValue: "Help Center" })}</span>
            </Link>
          )}
          {settings.visibility.qAndA && (
            <Link to="/q-and-a" className={mobileLinkClass} onClick={closeMobileMenu}>
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{t("nav.qAndA", { defaultValue: "Q&A" })}</span>
            </Link>
          )}
          {settings.visibility.feedback && (
            <Link to="/feedback" className={mobileLinkClass} onClick={closeMobileMenu}>
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t("nav.feedback", { defaultValue: "Feedback" })}</span>
            </Link>
          )}
          {settings.visibility.translationService && (
            <Link to="/translation-service" className={mobileLinkClass} onClick={closeMobileMenu}>
              <Languages className="w-4 h-4 shrink-0" />
              <span>{t("nav.translationService", { defaultValue: "Translation Service" })}</span>
            </Link>
          )}
          {settings.visibility.gallery && (
            <Link to="/gallery" className={mobileLinkClass} onClick={closeMobileMenu}>
              <Image className="w-4 h-4 shrink-0" />
              <span>{t("nav.gallery", { defaultValue: "Gallery" })}</span>
            </Link>
          )}
          {settings.visibility.news && (
            <Link to="/news" className={mobileLinkClass} onClick={closeMobileMenu}>
              <Newspaper className="w-4 h-4 shrink-0" />
              <span>{t("nav.news", { defaultValue: "News" })}</span>
            </Link>
          )}
          {settings.visibility.blog && (
            <Link to="/blog" className={mobileLinkClass} onClick={closeMobileMenu}>
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t("nav.articles", { defaultValue: "Articles" })}</span>
            </Link>
          )}

          {user && user.role !== "ADMIN" && (
            <>
              <div className="my-2 border-t border-dashed border-border/70" />
              <Link to="/select-country" className={mobileLinkClass} onClick={closeMobileMenu}>
                <FileText className="w-4 h-4 shrink-0" />
                <span>{t("nav.apply")}</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-dashed border-border/70">
          <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {quickHelpTitle}
            </p>
            <p className="text-sm text-foreground mt-1">
              {quickHelpDescription}
            </p>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              {quickHelp.phone ? <p>Утасны дугаар: {quickHelp.phone}</p> : null}
              {quickHelp.email ? <p>И-мэйл: {quickHelp.email}</p> : null}
              {quickHelp.branch1Title ? <p className="pt-1 font-medium text-foreground">{quickHelp.branch1Title}</p> : null}
              {renderLines(quickHelp.branch1Hours).map((line, idx) => (
                <p key={`mb1-${idx}`}>{line}</p>
              ))}
              {quickHelp.headOfficeTitle ? <p className="pt-1 font-medium text-foreground">{quickHelp.headOfficeTitle}</p> : null}
              {renderLines(quickHelp.headOfficeHours).map((line, idx) => (
                <p key={`mho-${idx}`}>{line}</p>
              ))}
              {renderLines(quickHelp.onlineHours).map((line, idx) => (
                <p key={`mon-${idx}`} className="pt-1">{line}</p>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Link
                to="/contactsupport"
                onClick={closeMobileMenu}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {contactSupportLabel}
              </Link>
              <span className="text-muted-foreground">•</span>
              <a
                href={quickHelpFacebookUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Facebook className="w-3.5 h-3.5" />
                Facebook
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
