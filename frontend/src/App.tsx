import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SiteSettingsProvider, useSiteSettings } from "./contexts/SiteSettingsContext";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import { useTranslation } from "react-i18next";
import NewsTicker from "./components/NewsTicker";
import PageViewTracker from "./components/PageViewTracker";

// Import all page components
import Home from "./pages/Home";
import Test from "./pages/Test";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import EnhancedForm from "./pages/EnhancedForm";
import Gallery from "./pages/Gallery";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ManageUsers from "./pages/ManageUsers";
import Application from "./pages/Application";
import UserDetail from "./pages/UserDetail";
import ReadyToBegin from "./pages/ReadyToBegin";
import UserProfile from "./pages/UserProfile";
import UserInbox from "./pages/UserInbox";
import UserSecuritySettings from "./pages/UserSecuritySettings";
import ContactSupport from "./pages/ContactSupport";
import LearnMore from "./pages/LearnMore";
import TranslationService from "./pages/TranslationService";
import CountrySelect from "./pages/CountrySelect";
import OAuthCallback from "./pages/OAuthCallback";
import Feedback from "./pages/Feedback";
import QAndA from "./pages/QAndA";
import HelpCenter from "./pages/HelpCenter";
import Flight from "./pages/Flight";
import Insurance from "./pages/Insurance";
import Maintenance from "./pages/Maintenance";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import DataDeletion from "./pages/legal/DataDeletion";

const isMaintenanceAllowedPath = (pathname: string): boolean => {
  const allowPrefixes = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/oauth/callback",
    "/admin",
    "/contactsupport",
  ];

  return allowPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("common.loading", { defaultValue: "Loading..." })}
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("common.loading", { defaultValue: "Loading..." })}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/profile" />;
  }

  return <>{children}</>;
};

const VisibilityRoute = ({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (enabled || user?.role === "ADMIN") return <>{children}</>;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground flex items-center justify-center">
      <div className="max-w-xl w-full px-6">
        <div className="rounded-2xl border border-dashed border-border/70 bg-card p-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("errors.pageUnavailable.title", { defaultValue: "Page unavailable" })}
          </h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            {t("errors.pageUnavailable.message", {
              defaultValue: "This page is currently hidden by the site administrator.",
            })}
          </p>
          <div className="mt-6">
            <Link to="/" className="text-primary hover:underline font-medium">
              {t("common.backToHome", { defaultValue: "Back to home" })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function AppRoutes() {
  const location = useLocation();
  const { user } = useAuth();
  const { settings } = useSiteSettings();

  const shouldShowMaintenance =
    settings.maintenance.enabled &&
    !isMaintenanceAllowedPath(location.pathname) &&
    user?.role !== "ADMIN";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageViewTracker />

      <main className="pt-16 md:pt-16 md:pl-[var(--sidebar-width,240px)] transition-[padding] duration-300">
        {settings.visibility.news && <NewsTicker />}
        {shouldShowMaintenance ? (
          <Maintenance />
        ) : (
          <Routes>
            {/* 
              "/" is the FIRST page that loads
              When user opens the site, Home is shown
            */}
            <Route path="/" element={<Home />} />

            {/* 
              Each Route maps a URL to a page component
              No page reload happens
            */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/about" element={<VisibilityRoute enabled={settings.visibility.about}><About /></VisibilityRoute>} />
            <Route path="/blog" element={<VisibilityRoute enabled={settings.visibility.blog}><Blog /></VisibilityRoute>} />
            <Route path="/blog/:slug" element={<VisibilityRoute enabled={settings.visibility.blog}><BlogPost /></VisibilityRoute>} />
            <Route path="/news" element={<VisibilityRoute enabled={settings.visibility.news}><News /></VisibilityRoute>} />
            <Route path="/news/:slug" element={<VisibilityRoute enabled={settings.visibility.news}><NewsArticle /></VisibilityRoute>} />
            <Route path="/gallery" element={<VisibilityRoute enabled={settings.visibility.gallery}><Gallery /></VisibilityRoute>} />
            <Route path="/test" element={<Test />} />
            <Route path="/learn-more" element={<VisibilityRoute enabled={settings.visibility.learnMore}><LearnMore /></VisibilityRoute>} />
            <Route path="/translation-service" element={<VisibilityRoute enabled={settings.visibility.translationService}><TranslationService /></VisibilityRoute>} />
            <Route path="/feedback" element={<VisibilityRoute enabled={settings.visibility.feedback}><Feedback /></VisibilityRoute>} />
            <Route path="/q-and-a" element={<VisibilityRoute enabled={settings.visibility.qAndA}><QAndA /></VisibilityRoute>} />
            <Route path="/faq" element={<VisibilityRoute enabled={settings.visibility.qAndA}><QAndA /></VisibilityRoute>} />
            <Route path="/help-center" element={<VisibilityRoute enabled={settings.visibility.helpCenter}><HelpCenter /></VisibilityRoute>} />
            <Route path="/helpcenter" element={<VisibilityRoute enabled={settings.visibility.helpCenter}><HelpCenter /></VisibilityRoute>} />
            <Route path="/flight" element={<VisibilityRoute enabled={settings.visibility.flight}><Flight /></VisibilityRoute>} />
            <Route path="/insurance" element={<VisibilityRoute enabled={settings.visibility.insurance}><Insurance /></VisibilityRoute>} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/data-deletion" element={<DataDeletion />} />
            
            {/* Protected routes - require authentication */}
            <Route
              path="/select-country"
              element={
                <ProtectedRoute>
                  <CountrySelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ready"
              element={
                <ProtectedRoute>
                  <ReadyToBegin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/inbox"
              element={
                <ProtectedRoute>
                  <UserInbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/security"
              element={
                <ProtectedRoute>
                  <UserSecuritySettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contactsupport"
              element={
                <ProtectedRoute>
                  <ContactSupport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/application"
              element={
                <ProtectedRoute>
                  <Application />
                </ProtectedRoute>
              }
            />
            <Route
              path="/form"
              element={
                <ProtectedRoute>
                  <EnhancedForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <EnhancedDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes - require admin role */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Navigate to="/admin/overview" replace />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/applications/:applicationId"
              element={
                <AdminRoute>
                  <ErrorBoundary>
                    <AdminDashboard />
                  </ErrorBoundary>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/:section"
              element={
                <AdminRoute>
                  <ErrorBoundary>
                    <AdminDashboard />
                  </ErrorBoundary>
                </AdminRoute>
              }
            />
            <Route
              path="/manage-users"
              element={
                <AdminRoute>
                  <ManageUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users/:id"
              element={
                <AdminRoute>
                  <UserDetail />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

// Main App component
function App() {
  return (
    // ThemeProvider and AuthProvider wrap the entire app
    <ThemeProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <BrowserRouter>
            <Toaster position="top-right" richColors closeButton />
            <AppRoutes />
          </BrowserRouter>
        </SiteSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Export App so main.tsx can render it
export default App;
