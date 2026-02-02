import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, TrendingUp, FileText, User, HelpCircle, ChevronRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "../api/client";
const EnhancedDashboard = () => {
    const { user, logout } = useAuth();
    const [userInquiries, setUserInquiries] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchUserInquiries();
    }, []);
    const fetchUserInquiries = async () => {
        try {
            const response = await api.get("/api/inquiries/user");
            const data = response.data.data || response.data || [];
            setUserInquiries(data);
            setStats({
                total: data.length,
                pending: data.filter((i) => i.status === "PENDING").length,
                approved: data.filter((i) => i.status === "APPROVED").length,
                rejected: data.filter((i) => i.status === "REJECTED").length,
            });
        }
        catch (err) {
            console.error("Failed to fetch user inquiries:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case "APPROVED":
                return _jsx(Badge, { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800", children: "Approved" });
            case "REJECTED":
                return _jsx(Badge, { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800", children: "Rejected" });
            default:
                return _jsx(Badge, { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800", children: "Pending" });
        }
    };
    const getServiceIcon = (serviceType) => {
        switch (serviceType) {
            case "visa":
                return "🛂";
            case "tourism":
                return "✈️";
            case "consultation":
                return "💼";
            default:
                return "📋";
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-12 h-12 text-primary animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading your dashboard..." })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-background pt-20", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl", children: getInitials(user?.name || "User") }), _jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-foreground", children: ["Welcome back, ", user?.name, "!"] }), _jsx("p", { className: "text-muted-foreground", children: "Manage your travel applications" })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: user?.email }), _jsx(Button, { onClick: logout, variant: "destructive", children: "Logout" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Total Applications" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold", children: stats.total }), _jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-1", children: [_jsx(TrendingUp, { className: "w-3 h-3" }), "All submissions"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Pending Review" }), _jsx(FileText, { className: "h-4 w-4 text-yellow-500" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold", children: stats.pending }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Awaiting response" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Approved" }), _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold", children: stats.approved }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Successfully processed" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Success Rate" }), _jsx(TrendingUp, { className: "h-4 w-4 text-primary" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: [stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Approval rate" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Recent Applications" }), _jsx(CardDescription, { children: "Your submitted applications" })] }), userInquiries.length > 0 && (_jsx(Button, { asChild: true, variant: "outline", children: _jsx(Link, { to: "/form", children: "+ New Application" }) }))] }), _jsx(CardContent, { children: userInquiries.length === 0 ? (_jsxs("div", { className: "text-center py-16", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDCCB" }), _jsx("h3", { className: "text-xl font-semibold text-foreground mb-2", children: "No applications yet" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Start by submitting your first travel application" }), _jsx(Button, { asChild: true, children: _jsx(Link, { to: "/form", children: "Submit Application" }) })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border", children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase", children: "Service" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase", children: "Date" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase", children: "Message" })] }) }), _jsx("tbody", { className: "divide-y divide-border", children: userInquiries.map((inquiry) => (_jsxs("tr", { className: "hover:bg-muted/50 transition-colors", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-2xl", children: getServiceIcon(inquiry.serviceType) }), _jsx("span", { className: "capitalize", children: inquiry.serviceType })] }) }), _jsx("td", { className: "px-4 py-3", children: getStatusBadge(inquiry.status) }), _jsx("td", { className: "px-4 py-3 text-muted-foreground", children: new Date(inquiry.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-4 py-3 text-muted-foreground", children: _jsx("div", { className: "max-w-xs truncate", title: inquiry.message, children: inquiry.message }) })] }, inquiry.id))) })] }) })) })] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Actions" }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsx(Button, { asChild: true, variant: "outline", className: "w-full justify-start", children: _jsxs(Link, { to: "/form", className: "flex items-center gap-3", children: [_jsx(FileText, { className: "w-5 h-5" }), "New Application", _jsx(ChevronRight, { className: "w-4 h-4 ml-auto" })] }) }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(User, { className: "w-5 h-5 mr-3" }), "Profile Settings", _jsx(ChevronRight, { className: "w-4 h-4 ml-auto" })] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(FileText, { className: "w-5 h-5 mr-3" }), "Documents", _jsx(ChevronRight, { className: "w-4 h-4 ml-auto" })] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(HelpCircle, { className: "w-5 h-5 mr-3" }), "Support", _jsx(ChevronRight, { className: "w-4 h-4 ml-auto" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Pro Tips" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-foreground font-medium", children: "Complete your profile" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "For faster processing" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-foreground font-medium", children: "Upload all required documents" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Upfront submission" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-foreground font-medium", children: "Check your email updates" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Status notifications" })] })] })] })] })] })] })] }) }));
};
export default EnhancedDashboard;
