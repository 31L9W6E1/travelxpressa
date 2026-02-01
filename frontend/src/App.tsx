import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";

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
import ManageUsers from "./pages/ManageUsers";
import Application from "./pages/Application";
import UserDetail from "./pages/UserDetail";
import ReadyToBegin from "./pages/ReadyToBegin";
import UserProfile from "./pages/UserProfile";
import LearnMore from "./pages/LearnMore";
import CountrySelect from "./pages/CountrySelect";
import OAuthCallback from "./pages/OAuthCallback";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
        <>
          {/* Navbar is placed here so it appears on ALL pages */}
          <Navbar />

          {/* 
            Routes is a container for Route components ONLY
            It decides which page to show based on URL
          */}
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
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsArticle />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/test" element={<Test />} />
            <Route path="/learn-more" element={<LearnMore />} />
            
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
                  <AdminDashboard />
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
        </>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Export App so main.tsx can render it
export default App;