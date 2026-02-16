import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SiteSettingsProvider, useSiteSettings } from "./contexts/SiteSettingsContext";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import { useTranslation } from "react-i18next";
import PageViewTracker from "./components/PageViewTracker";
import RouteSeo from "./components/seo/RouteSeo";

const Home = lazy(() => import("./pages/Home"));
const Test = lazy(() => import("./pages/Test"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const News = lazy(() => import("./pages/News"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const EnhancedForm = lazy(() => import("./pages/EnhancedForm"));
const Gallery = lazy(() => import("./pages/Gallery"));
const EnhancedDashboard = lazy(() => import("./pages/EnhancedDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const Application = lazy(() => import("./pages/Application"));
const UserDetail = lazy(() => import("./pages/UserDetail"));
const ReadyToBegin = lazy(() => import("./pages/ReadyToBegin"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const UserInbox = lazy(() => import("./pages/UserInbox"));
const UserSecuritySettings = lazy(() => import("./pages/UserSecuritySettings"));
const ContactSupport = lazy(() => import("./pages/ContactSupport"));
const LearnMore = lazy(() => import("./pages/LearnMore"));
const TranslationService = lazy(() => import("./pages/TranslationService"));
const CountrySelect = lazy(() => import("./pages/CountrySelect"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const Feedback = lazy(() => import("./pages/Feedback"));
const QAndA = lazy(() => import("./pages/QAndA"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const GuidedStart = lazy(() => import("./pages/GuidedStart"));
const Flight = lazy(() => import("./pages/Flight"));
const Insurance = lazy(() => import("./pages/Insurance"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const DataDeletion = lazy(() => import("./pages/legal/DataDeletion"));

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
  const { t } = useTranslation();
  const { user } = useAuth();
  const { settings } = useSiteSettings();

  const shouldShowMaintenance =
    settings.maintenance.enabled &&
    !isMaintenanceAllowedPath(location.pathname) &&
    user?.role !== "ADMIN";
  const mainTopPaddingClass = settings.visibility.news ? "pt-[6.5rem]" : "pt-16";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageViewTracker />
      <RouteSeo />

      <main className={`${mainTopPaddingClass} md:pl-[var(--sidebar-width,240px)] transition-[padding] duration-300`}>
        <Suspense
          fallback={
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-muted-foreground">
              {t("common.loading", { defaultValue: "Loading..." })}
            </div>
          }
        >
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
            <Route path="/guide" element={<GuidedStart />} />
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
        </Suspense>
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
          <HelmetProvider>
            <BrowserRouter>
              <Toaster position="top-right" richColors closeButton />
              <AppRoutes />
            </BrowserRouter>
          </HelmetProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Export App so main.tsx can render it
export default App;
