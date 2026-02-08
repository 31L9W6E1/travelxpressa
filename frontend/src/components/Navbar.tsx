import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Menu, X, Plane, User, LogOut, Settings, FileText, CreditCard, ChevronDown, Sun, Moon, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { UserAvatar } from "./UserAvatar";
import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLangDropdownOpen(false);
  };

  // Handle language codes like 'en-US' by extracting base code 'en'
  const normalizedLang = i18n.language?.split('-')[0] || 'en';
  const currentLanguage = languages.find(l => l.code === normalizedLang) || languages[0];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Close language dropdown if clicking outside any language button/dropdown
      if (isLangDropdownOpen) {
        const isLangElement = target.closest('[data-lang-dropdown]');
        if (!isLangElement) {
          setIsLangDropdownOpen(false);
        }
      }

      // Close user dropdown if clicking outside
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLangDropdownOpen, isDropdownOpen]);

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
              {user && user.role !== "ADMIN" && (
                <Link
                  to="/application"
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
            {/* Language Selector */}
            <div className="relative" data-lang-dropdown>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                aria-label="Select language"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">{currentLanguage.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-secondary transition-colors ${
                        normalizedLang === lang.code ? 'bg-secondary text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <UserAvatar name={user.name} email={user.email} size="sm" />
                  <span className="text-sm font-medium">{user.name || user.email?.split('@')[0]}</span>
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
            {/* Mobile Language Selector */}
            <div className="relative" data-lang-dropdown>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="p-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                aria-label="Select language"
              >
                <span className="text-lg">{currentLanguage.flag}</span>
              </button>
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-secondary transition-colors ${
                        normalizedLang === lang.code ? 'bg-secondary text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                      to="/application"
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
