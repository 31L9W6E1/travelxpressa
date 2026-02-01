import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
// Protected route component
const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return _jsx("div", { className: "min-h-screen flex items-center justify-center", children: "Loading..." });
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login" });
    }
    return _jsx(_Fragment, { children: children });
};
// Admin route component
const AdminRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return _jsx("div", { className: "min-h-screen flex items-center justify-center", children: "Loading..." });
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login" });
    }
    if (user.role !== "ADMIN") {
        return _jsx(Navigate, { to: "/profile" });
    }
    return _jsx(_Fragment, { children: children });
};
// Main App component
function App() {
    return (
    // ThemeProvider and AuthProvider wrap the entire app
    _jsx(ThemeProvider, { children: _jsx(AuthProvider, { children: _jsxs(BrowserRouter, { children: [_jsx(Toaster, { position: "top-right", richColors: true, closeButton: true }), _jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/about", element: _jsx(About, {}) }), _jsx(Route, { path: "/blog", element: _jsx(Blog, {}) }), _jsx(Route, { path: "/blog/:slug", element: _jsx(BlogPost, {}) }), _jsx(Route, { path: "/news", element: _jsx(News, {}) }), _jsx(Route, { path: "/news/:slug", element: _jsx(NewsArticle, {}) }), _jsx(Route, { path: "/gallery", element: _jsx(Gallery, {}) }), _jsx(Route, { path: "/test", element: _jsx(Test, {}) }), _jsx(Route, { path: "/learn-more", element: _jsx(LearnMore, {}) }), _jsx(Route, { path: "/select-country", element: _jsx(ProtectedRoute, { children: _jsx(CountrySelect, {}) }) }), _jsx(Route, { path: "/ready", element: _jsx(ProtectedRoute, { children: _jsx(ReadyToBegin, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(UserProfile, {}) }) }), _jsx(Route, { path: "/application", element: _jsx(ProtectedRoute, { children: _jsx(Application, {}) }) }), _jsx(Route, { path: "/form", element: _jsx(ProtectedRoute, { children: _jsx(EnhancedForm, {}) }) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(EnhancedDashboard, {}) }) }), _jsx(Route, { path: "/admin", element: _jsx(AdminRoute, { children: _jsx(AdminDashboard, {}) }) }), _jsx(Route, { path: "/manage-users", element: _jsx(AdminRoute, { children: _jsx(ManageUsers, {}) }) }), _jsx(Route, { path: "/admin/users/:id", element: _jsx(AdminRoute, { children: _jsx(UserDetail, {}) }) })] })] })] }) }) }));
}
// Export App so main.tsx can render it
export default App;
