import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import { useTranslation } from "react-i18next";

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

// Main App component
function App() {
  return (
    // ThemeProvider and AuthProvider wrap the entire app
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
        {/* 
          React Fragment <> </> 
          Used so we can return multiple elements
          without adding extra divs to the DOM 
        */}
        <div className="min-h-screen bg-background">
          <Navbar />

          <main className="pt-16 md:pt-16 md:pl-[var(--sidebar-width,240px)] transition-[padding] duration-300">
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
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsArticle />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/test" element={<Test />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/translation-service" element={<TranslationService />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/q-and-a" element={<QAndA />} />
            <Route path="/faq" element={<QAndA />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/helpcenter" element={<HelpCenter />} />
            <Route path="/flight" element={<Flight />} />
            <Route path="/insurance" element={<Insurance />} />
            
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
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Export App so main.tsx can render it
export default App;
