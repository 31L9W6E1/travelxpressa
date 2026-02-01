import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
const languages = [
    { value: 'en', label: 'English' },
    { value: 'mn', label: 'Монгол' },
    { value: 'ru', label: 'Русский' },
    { value: 'zh', label: '中文' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
];
export function Layout() {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx("header", { className: "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: _jsxs("div", { className: "container mx-auto flex h-14 items-center px-4", children: [_jsx(Link, { to: "/", className: "mr-6 flex items-center space-x-2", children: _jsx("span", { className: "font-bold text-xl", children: t('app.title') }) }), _jsxs("nav", { className: "flex items-center space-x-4 flex-1", children: [_jsx(Link, { to: "/", className: "text-sm font-medium hover:text-primary transition-colors", children: t('nav.home') }), isAuthenticated && (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/applications", className: "text-sm font-medium hover:text-primary transition-colors", children: t('nav.applications') }), _jsx(Link, { to: "/profile", className: "text-sm font-medium hover:text-primary transition-colors", children: t('nav.profile') }), user?.role === 'ADMIN' && (_jsx(Link, { to: "/admin", className: "text-sm font-medium hover:text-primary transition-colors", children: t('nav.admin') }))] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Select, { value: language, onChange: (e) => setLanguage(e.target.value), className: "w-28 h-8 text-xs", children: languages.map((lang) => (_jsx("option", { value: lang.value, children: lang.label }, lang.value))) }), _jsxs(Select, { value: theme, onChange: (e) => setTheme(e.target.value), className: "w-24 h-8 text-xs", children: [_jsx("option", { value: "light", children: t('theme.light') }), _jsx("option", { value: "dark", children: t('theme.dark') }), _jsx("option", { value: "system", children: t('theme.system') })] }), isAuthenticated ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: user?.name || user?.email }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleLogout, children: t('nav.logout') })] })) : (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Link, { to: "/login", children: _jsx(Button, { variant: "ghost", size: "sm", children: t('nav.login') }) }), _jsx(Link, { to: "/register", children: _jsx(Button, { size: "sm", children: t('nav.register') }) })] }))] })] }) }), _jsx("main", { className: "container mx-auto px-4 py-8", children: _jsx(Outlet, {}) }), _jsx("footer", { className: "border-t bg-background", children: _jsxs("div", { className: "container mx-auto px-4 py-6 text-center text-sm text-muted-foreground", children: ["\u00A9 ", new Date().getFullYear(), " TravelXpressa. All rights reserved."] }) })] }));
}
