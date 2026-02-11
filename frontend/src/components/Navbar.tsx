import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Menu,
  X,
  Plane,
  LogOut,
  Settings,
  FileText,
  CreditCard,
  Sun,
  Moon,
  MessageSquare,
  Bell,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { UserAvatar } from "./UserAvatar";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import api from "@/api/client";

type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  to: string;
};

const navItemClass =
  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notificationDesktopRef = useRef<HTMLDivElement>(null);
  const notificationMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isNotificationOpen) return;
      const target = event.target as Node;
      const clickedDesktop = notificationDesktopRef.current?.contains(target);
      const clickedMobile = notificationMobileRef.current?.contains(target);
      if (!clickedDesktop && !clickedMobile) setIsNotificationOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }

      try {
        if (user.role === "ADMIN") {
          const [pendingInquiriesRes, openThreadsRes] = await Promise.all([
            api.get("/api/admin/inquiries", { params: { limit: 5, status: "PENDING" } }),
            api.get("/api/chat/threads"),
          ]);

          const pendingInquiries = pendingInquiriesRes.data?.data || [];
          const openThreads = (openThreadsRes.data?.data || []).filter((thread: any) => thread.status === "OPEN");

          const next: NotificationItem[] = [];
          for (const item of pendingInquiries.slice(0, 3)) {
            next.push({
              id: `inq-${item.id}`,
              title: item.name || item.email || "Pending Inquiry",
              subtitle: "Translation/Support request pending",
              to: "/admin/requests",
            });
          }
          for (const item of openThreads.slice(0, 2)) {
            next.push({
              id: `thread-${item.id}`,
              title: item.user?.name || item.user?.email || "Open support thread",
              subtitle: "Needs admin response",
              to: `/contactsupport?threadId=${item.id}`,
            });
          }
          setNotifications(next);
          return;
        }

        const [myInquiriesRes, myThreadsRes] = await Promise.all([
          api.get("/api/user/inquiries/user", { params: { limit: 5 } }),
          api.get("/api/chat/threads"),
        ]);
        const myInquiries = myInquiriesRes.data?.data || [];
        const myThreads = myThreadsRes.data?.data || [];
        const next: NotificationItem[] = [];

        for (const item of myInquiries.slice(0, 3)) {
          next.push({
            id: `my-inq-${item.id}`,
            title: `${item.serviceType || "Request"} • ${item.status || "Pending"}`,
            subtitle: "Check your inbox for updates",
            to: "/profile/inbox",
          });
        }
        for (const item of myThreads.slice(0, 2)) {
          next.push({
            id: `my-thread-${item.id}`,
            title: item.subject || "Support conversation",
            subtitle: item.status === "OPEN" ? "Thread is active" : `Status: ${item.status}`,
            to: `/contactsupport?threadId=${item.id}`,
          });
        }
        setNotifications(next);
      } catch {
        setNotifications([]);
      }
    };

    void loadNotifications();
  }, [user]);

  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <>
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[240px] bg-background border-r border-border flex-col">
        <div className="h-16 px-4 flex items-center border-b border-dashed border-border/70">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <Plane className="w-6 h-6 text-foreground shrink-0" />
            <span className="text-lg font-bold text-foreground tracking-tight truncate">TravelXpressa</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link to="/about" className={navItemClass}>{t("nav.about")}</Link>
          <Link to="/learn-more" className={navItemClass}>{t("nav.learnMore")}</Link>
          <Link to="/translation-service" className={navItemClass}>{t("nav.translationService", { defaultValue: "Translation Service" })}</Link>
          <Link to="/gallery" className={navItemClass}>{t("nav.gallery", { defaultValue: "Gallery" })}</Link>

          {user && (
            <Link to="/contactsupport" className={navItemClass}>
              <MessageSquare className="w-4 h-4" />
              {t("nav.support", { defaultValue: "Support" })}
            </Link>
          )}

          {user && user.role !== "ADMIN" && (
            <Link to="/select-country" className={navItemClass}>
              <FileText className="w-4 h-4" />
              {t("nav.apply")}
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link to="/admin" className={navItemClass}>
              <Settings className="w-4 h-4" />
              {t("nav.admin")}
            </Link>
          )}

          {user && (
            <>
              <div className="my-3 border-t border-dashed border-border/70" />
              <Link to="/profile" className={navItemClass}>
                <User className="w-4 h-4" />
                {t("nav.profile")}
              </Link>
              <Link to="/profile" className={navItemClass}>
                <FileText className="w-4 h-4" />
                {t("nav.applications")}
              </Link>
              <Link to="/profile" className={navItemClass}>
                <CreditCard className="w-4 h-4" />
                {t("nav.payments")}
              </Link>
            </>
          )}
        </div>

        <div className="p-3 border-t border-dashed border-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <LanguageSwitcher />

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {user && (
                <div className="relative" ref={notificationDesktopRef}>
                  <button
                    onClick={() => setIsNotificationOpen((prev) => !prev)}
                    className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center">
                        {notifications.length > 9 ? "9+" : notifications.length}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute bottom-11 right-0 w-72 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-card-foreground">
                          {t("nav.notifications", { defaultValue: "Notifications" })}
                        </p>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                            {t("nav.noNotifications", { defaultValue: "No new notifications" })}
                          </p>
                        ) : (
                          notifications.map((item) => (
                            <Link
                              key={item.id}
                              to={item.to}
                              onClick={() => setIsNotificationOpen(false)}
                              className="block px-4 py-3 hover:bg-secondary transition-colors border-b last:border-b-0 border-border"
                            >
                              <p className="text-sm text-card-foreground font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {user ? (
            <>
              <div className="flex items-center gap-3 px-2 py-1">
                <UserAvatar name={user.name} email={user.email} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name || user.email?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => void logout()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-secondary transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link to="/login" className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm">
                {t("nav.signIn")}
              </Link>
              <Link to="/login" className="block px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm text-center hover:opacity-90 transition-opacity">
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </div>
      </aside>

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
            <Plane className="w-5 h-5 text-foreground" />
            <span className="text-base font-semibold text-foreground">TravelXpressa</span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {user && (
            <div className="relative" ref={notificationMobileRef}>
              <button
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  <div className="max-h-80 overflow-y-auto">
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
                            setIsNotificationOpen(false);
                            closeMobileMenu();
                          }}
                          className="block px-4 py-3 hover:bg-secondary transition-colors border-b last:border-b-0 border-border"
                        >
                          <p className="text-sm text-card-foreground font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <LanguageSwitcher />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={closeMobileMenu} />
      )}

      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-[240px] bg-background border-r border-border transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-dashed border-border/70">
          <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <Plane className="w-5 h-5 text-foreground" />
            <span className="text-base font-semibold text-foreground">TravelXpressa</span>
          </Link>
          <button className="p-2 rounded-lg text-foreground hover:bg-secondary" onClick={closeMobileMenu} aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link to="/about" className={navItemClass} onClick={closeMobileMenu}>{t("nav.about")}</Link>
          <Link to="/learn-more" className={navItemClass} onClick={closeMobileMenu}>{t("nav.learnMore")}</Link>
          <Link to="/translation-service" className={navItemClass} onClick={closeMobileMenu}>{t("nav.translationService", { defaultValue: "Translation Service" })}</Link>
          <Link to="/gallery" className={navItemClass} onClick={closeMobileMenu}>{t("nav.gallery", { defaultValue: "Gallery" })}</Link>

          {user && (
            <Link to="/contactsupport" className={navItemClass} onClick={closeMobileMenu}>
              <MessageSquare className="w-4 h-4" />
              {t("nav.support", { defaultValue: "Support" })}
            </Link>
          )}

          {user && user.role !== "ADMIN" && (
            <Link to="/select-country" className={navItemClass} onClick={closeMobileMenu}>
              <FileText className="w-4 h-4" />
              {t("nav.apply")}
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link to="/admin" className={navItemClass} onClick={closeMobileMenu}>
              <Settings className="w-4 h-4" />
              {t("nav.admin")}
            </Link>
          )}

          {user && (
            <>
              <div className="my-3 border-t border-dashed border-border/70" />
              <Link to="/profile" className={navItemClass} onClick={closeMobileMenu}>
                <User className="w-4 h-4" />
                {t("nav.profile")}
              </Link>
              <Link to="/profile" className={navItemClass} onClick={closeMobileMenu}>
                <FileText className="w-4 h-4" />
                {t("nav.applications")}
              </Link>
              <Link to="/profile" className={navItemClass} onClick={closeMobileMenu}>
                <CreditCard className="w-4 h-4" />
                {t("nav.payments")}
              </Link>
            </>
          )}
        </div>

        <div className="p-3 border-t border-dashed border-border/70 space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-2 py-1">
                <UserAvatar name={user.name} email={user.email} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name || user.email?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  void logout();
                  closeMobileMenu();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-secondary transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link to="/login" className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm" onClick={closeMobileMenu}>
                {t("nav.signIn")}
              </Link>
              <Link to="/login" className="block px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm text-center hover:opacity-90 transition-opacity" onClick={closeMobileMenu}>
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
