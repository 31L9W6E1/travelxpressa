import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Menu, X, Plane, User, LogOut, Settings, FileText, CreditCard, ChevronDown, Sun, Moon, MessageSquare, Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { UserAvatar } from "./UserAvatar";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./LanguageSwitcher";
import api from "@/api/client";

type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  to: string;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationDesktopRef = useRef<HTMLDivElement>(null);
  const notificationMobileRef = useRef<HTMLDivElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (isNotificationOpen) {
        const target = event.target as Node;
        const clickedDesktop = notificationDesktopRef.current?.contains(target);
        const clickedMobile = notificationMobileRef.current?.contains(target);
        if (!clickedDesktop && !clickedMobile) setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isNotificationOpen]);

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
              subtitle: `Translation/Support request pending`,
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Plane className="w-7 h-7 text-foreground" />
              <span className="text-xl font-bold text-foreground tracking-tight">
                TravelXpressa
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/about"
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/learn-more"
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('nav.learnMore')}
              </Link>
              <Link
                to="/translation-service"
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('nav.translationService', { defaultValue: 'Translation Service' })}
              </Link>
              <Link
                to="/gallery"
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('nav.gallery', { defaultValue: 'Gallery' })}
              </Link>
              {user && (
                <Link
                  to="/contactsupport"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('nav.support', { defaultValue: 'Support' })}
                </Link>
              )}
              {user && user.role !== "ADMIN" && (
                <Link
                  to="/select-country"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {t('nav.apply')}
                </Link>
              )}
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {t('nav.admin')}
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Auth & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector - uses Radix UI DropdownMenu */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {user && (
              <div className="relative" ref={notificationDesktopRef}>
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
                  <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
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

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <UserAvatar name={user.name} email={user.email} size="sm" />
                  <span className="text-sm font-medium max-w-32 truncate">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                  {user.role === "ADMIN" && (
                    <span className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded">
                      {t('nav.admin')}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm text-card-foreground font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <User className="w-4 h-4" />
                        {t('nav.profile')}
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        {t('nav.applications')}
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        {t('nav.payments')}
                      </Link>
                      <Link
                        to="/contactsupport"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {t('nav.support', { defaultValue: 'Support' })}
                      </Link>
                    </div>
                    <div className="border-t border-border py-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-destructive hover:bg-secondary transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  {t('nav.getStarted')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Language + Theme Toggle + Menu button */}
          <div className="md:hidden flex items-center space-x-1">
            {user && (
              <div className="relative" ref={notificationMobileRef}>
                <button
                  onClick={() => setIsNotificationOpen((prev) => !prev)}
                  className="p-2 text-foreground hover:bg-secondary rounded-lg transition-colors relative"
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
                              setIsMenuOpen(false);
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
            {/* Mobile Language Switcher */}
            <LanguageSwitcher />

            <button
              onClick={toggleTheme}
              className="p-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              className="p-2 text-foreground hover:bg-secondary rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-background border-t border-border">
            <div className="flex flex-col space-y-1">
              <Link
                to="/about"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/learn-more"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.learnMore')}
              </Link>
              <Link
                to="/translation-service"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.translationService', { defaultValue: 'Translation Service' })}
              </Link>
              <Link
                to="/gallery"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.gallery', { defaultValue: 'Gallery' })}
              </Link>
              {user && (
                <Link
                  to="/contactsupport"
                  className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.support', { defaultValue: 'Support' })}
                </Link>
              )}
              {user && (
                <>
                  <Link
                    to="/profile"
                    className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  {user.role !== "ADMIN" && (
                    <Link
                      to="/select-country"
                      className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('nav.apply')}
                    </Link>
                  )}
                </>
              )}
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.admin')}
                </Link>
              )}
              <div className="border-t border-border pt-4 mt-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 text-muted-foreground text-sm">
                      {t('nav.signedInAs')} {user.name}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-destructive hover:bg-secondary transition-colors text-left"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-4">
                    <Link
                      to="/login"
                      className="block py-3 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('nav.signIn')}
                    </Link>
                    <Link
                      to="/login"
                      className="block py-3 bg-primary text-primary-foreground rounded-lg font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('nav.getStarted')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
