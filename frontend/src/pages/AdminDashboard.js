import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Users, FileText, TrendingUp, Search, ChevronRight, Shield, Clock, AlertCircle, CheckCircle, XCircle, Eye, Trash2, UserCog, BarChart3, Plane, Plus, Edit, Newspaper, BookOpen, Globe, Image as ImageIcon, Loader2, } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Area, AreaChart, Line, LineChart, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, } from "recharts";
import { getAdminPosts, createPost, updatePost, deletePost, togglePostPublish, formatPostDate, } from "@/api/posts";
// Chart configurations
const applicationChartConfig = {
    submitted: {
        label: "Submitted",
        color: "hsl(var(--chart-1))",
    },
    approved: {
        label: "Approved",
        color: "hsl(var(--chart-2))",
    },
    pending: {
        label: "Pending",
        color: "hsl(var(--chart-3))",
    },
    rejected: {
        label: "Rejected",
        color: "hsl(var(--chart-4))",
    },
};
const userGrowthConfig = {
    users: {
        label: "Users",
        color: "hsl(var(--chart-1))",
    },
};
const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [users, setUsers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApplication, setSelectedApplication] = useState(null);
    // CMS State
    const [posts, setPosts] = useState([]);
    const [cmsLoading, setCmsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [saving, setSaving] = useState(false);
    const [newPost, setNewPost] = useState({
        title: "",
        excerpt: "",
        content: "",
        imageUrl: "",
        category: "blog",
        tags: "",
        status: "draft",
    });
    // Sample chart data
    const monthlyApplicationData = [
        { month: "Jan", submitted: 45, approved: 38, pending: 5, rejected: 2 },
        { month: "Feb", submitted: 52, approved: 42, pending: 7, rejected: 3 },
        { month: "Mar", submitted: 61, approved: 48, pending: 10, rejected: 3 },
        { month: "Apr", submitted: 58, approved: 45, pending: 9, rejected: 4 },
        { month: "May", submitted: 72, approved: 58, pending: 11, rejected: 3 },
        { month: "Jun", submitted: 85, approved: 70, pending: 12, rejected: 3 },
    ];
    const userGrowthData = [
        { month: "Jan", users: 120 },
        { month: "Feb", users: 156 },
        { month: "Mar", users: 189 },
        { month: "Apr", users: 234 },
        { month: "May", users: 287 },
        { month: "Jun", users: 345 },
    ];
    const statusDistributionData = [
        {
            name: "Approved",
            value: stats?.inquiries.approved || 0,
            fill: "#22c55e",
        },
        { name: "Pending", value: stats?.inquiries.pending || 0, fill: "#eab308" },
        {
            name: "Rejected",
            value: stats?.inquiries.rejected || 0,
            fill: "#ef4444",
        },
    ];
    useEffect(() => {
        if (user?.role === "ADMIN") {
            fetchDashboardData();
            fetchPosts();
        }
    }, [user]);
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const [statsRes, usersRes, appsRes] = await Promise.all([
                fetch("http://localhost:3000/api/admin/stats", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("http://localhost:3000/api/admin/users", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("http://localhost:3000/api/admin/applications", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.data);
            }
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData.data || []);
            }
            if (appsRes.ok) {
                const appsData = await appsRes.json();
                setApplications(appsData.data || []);
            }
        }
        catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchPosts = async () => {
        setCmsLoading(true);
        try {
            const response = await getAdminPosts();
            setPosts(response.data || []);
        }
        catch (error) {
            console.error("Error fetching posts:", error);
            toast.error("Failed to load posts");
        }
        finally {
            setCmsLoading(false);
        }
    };
    const handleOpenNewPost = (category) => {
        setEditingPost(null);
        setNewPost({
            title: "",
            excerpt: "",
            content: "",
            imageUrl: "",
            category,
            tags: "",
            status: "draft",
        });
        setIsDialogOpen(true);
    };
    const handleEditPost = (post) => {
        setEditingPost(post);
        setNewPost({
            title: post.title,
            excerpt: post.excerpt || "",
            content: post.content,
            imageUrl: post.imageUrl || "",
            category: post.category,
            tags: post.tags || "",
            status: post.status,
        });
        setIsDialogOpen(true);
    };
    const handleSavePost = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) {
            toast.error("Title and content are required");
            return;
        }
        setSaving(true);
        try {
            if (editingPost) {
                const response = await updatePost(editingPost.id, newPost);
                toast.success(response.message);
            }
            else {
                const response = await createPost(newPost);
                toast.success(response.message);
            }
            await fetchPosts();
            setIsDialogOpen(false);
            setEditingPost(null);
            setNewPost({
                title: "",
                excerpt: "",
                content: "",
                imageUrl: "",
                category: "blog",
                tags: "",
                status: "draft",
            });
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to save post");
        }
        finally {
            setSaving(false);
        }
    };
    const handleDeletePost = async () => {
        if (!postToDelete)
            return;
        try {
            await deletePost(postToDelete.id);
            toast.success("Post deleted successfully");
            await fetchPosts();
        }
        catch (error) {
            toast.error("Failed to delete post");
        }
        finally {
            setDeleteDialogOpen(false);
            setPostToDelete(null);
        }
    };
    const handleTogglePublish = async (post) => {
        try {
            const response = await togglePostPublish(post.id);
            toast.success(response.message);
            await fetchPosts();
        }
        catch (error) {
            toast.error("Failed to update publish status");
        }
    };
    const filteredUsers = users.filter((u) => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredApplications = applications.filter((app) => app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.visaType?.toLowerCase().includes(searchTerm.toLowerCase()));
    const blogPosts = posts.filter((p) => p.category === "blog");
    const newsPosts = posts.filter((p) => p.category === "news");
    const getStatusBadge = (status) => {
        const styles = {
            DRAFT: "bg-gray-500/20 text-gray-300 border-gray-500/30",
            IN_PROGRESS: "bg-white/10 text-white border-white/20",
            SUBMITTED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            PAYMENT_PENDING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
            UNDER_REVIEW: "bg-purple-500/20 text-purple-300 border-purple-500/30",
            APPROVED: "bg-green-500/20 text-green-300 border-green-500/30",
            REJECTED: "bg-red-500/20 text-red-300 border-red-500/30",
        };
        return styles[status] || styles.DRAFT;
    };
    const parseFormData = (jsonString) => {
        if (!jsonString)
            return null;
        try {
            return JSON.parse(jsonString);
        }
        catch {
            return null;
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-12 h-12 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading dashboard..." })] }) }));
    }
    if (user?.role !== "ADMIN") {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center pt-20", children: _jsxs("div", { className: "text-center bg-card border border-border rounded-2xl p-12", children: [_jsx(Shield, { className: "w-16 h-16 text-destructive mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-semibold text-foreground mb-2", children: "Access Denied" }), _jsx("p", { className: "text-muted-foreground", children: "You don't have permission to access this page." }), _jsx(Link, { to: "/", className: "mt-6 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors", children: "Go Home" })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-background pt-20", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-foreground", children: "Admin Dashboard" }), _jsxs("p", { className: "text-muted-foreground mt-1", children: ["Welcome back, ", user?.name] })] }), _jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-green-500 text-sm", children: "System Online" })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: (v) => setActiveTab(v), className: "space-y-6", children: [_jsxs(TabsList, { className: "bg-secondary", children: [_jsxs(TabsTrigger, { value: "overview", className: "gap-2", children: [_jsx(BarChart3, { className: "w-4 h-4" }), "Overview"] }), _jsxs(TabsTrigger, { value: "users", className: "gap-2", children: [_jsx(Users, { className: "w-4 h-4" }), "Users"] }), _jsxs(TabsTrigger, { value: "applications", className: "gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), "Applications"] }), _jsxs(TabsTrigger, { value: "cms", className: "gap-2", children: [_jsx(Newspaper, { className: "w-4 h-4" }), "CMS"] })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Total Users" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats?.users.total || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-1", children: [_jsx(TrendingUp, { className: "w-3 h-3 text-green-500" }), _jsx("span", { className: "text-green-500", children: "+12%" }), " from last month"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Applications" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats?.applications.total || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-1", children: [_jsx(TrendingUp, { className: "w-3 h-3 text-green-500" }), _jsx("span", { className: "text-green-500", children: "+18%" }), " from last month"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Approved" }), _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats?.inquiries.approved || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [stats?.inquiries.total
                                                                    ? Math.round((stats.inquiries.approved / stats.inquiries.total) *
                                                                        100)
                                                                    : 0, "% approval rate"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Pending" }), _jsx(Clock, { className: "h-4 w-4 text-yellow-500" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats?.inquiries.pending || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-1", children: [_jsx(AlertCircle, { className: "w-3 h-3 text-yellow-500" }), "Needs attention"] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Applications Overview" }), _jsx(CardDescription, { children: "Monthly application trends" })] }), _jsx(CardContent, { children: _jsx(ChartContainer, { config: applicationChartConfig, className: "h-[300px]", children: _jsxs(AreaChart, { data: monthlyApplicationData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }), _jsx(XAxis, { dataKey: "month", className: "text-xs" }), _jsx(YAxis, { className: "text-xs" }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, {}) }), _jsx(Area, { type: "monotone", dataKey: "submitted", stackId: "1", stroke: "var(--color-submitted)", fill: "var(--color-submitted)", fillOpacity: 0.4 }), _jsx(Area, { type: "monotone", dataKey: "approved", stackId: "2", stroke: "var(--color-approved)", fill: "var(--color-approved)", fillOpacity: 0.4 })] }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "User Growth" }), _jsx(CardDescription, { children: "New user registrations over time" })] }), _jsx(CardContent, { children: _jsx(ChartContainer, { config: userGrowthConfig, className: "h-[300px]", children: _jsxs(LineChart, { data: userGrowthData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }), _jsx(XAxis, { dataKey: "month", className: "text-xs" }), _jsx(YAxis, { className: "text-xs" }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, {}) }), _jsx(Line, { type: "monotone", dataKey: "users", stroke: "var(--color-users)", strokeWidth: 2, dot: { fill: "var(--color-users)" } })] }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Status Distribution" }), _jsx(CardDescription, { children: "Current application status breakdown" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "h-[200px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: statusDistributionData, cx: "50%", cy: "50%", innerRadius: 40, outerRadius: 80, paddingAngle: 5, dataKey: "value", children: statusDistributionData.map((entry, index) => (_jsx(Cell, { fill: entry.fill }, `cell-${index}`))) }), _jsx(ChartTooltip, {})] }) }) }), _jsx("div", { className: "flex justify-center gap-4 mt-4", children: statusDistributionData.map((item) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: item.fill } }), _jsx("span", { className: "text-xs text-muted-foreground", children: item.name })] }, item.name))) })] })] }), _jsxs(Card, { className: "lg:col-span-2", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Recent Users" }), _jsx(CardDescription, { children: "Latest registered users" })] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setActiveTab("users"), children: ["View All ", _jsx(ChevronRight, { className: "w-4 h-4 ml-1" })] })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: users.slice(0, 5).map((u) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold", children: u.name?.[0]?.toUpperCase() ||
                                                                                u.email[0].toUpperCase() }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: u.name || "No name" }), _jsx("p", { className: "text-xs text-muted-foreground", children: u.email })] })] }), _jsx(Badge, { variant: u.role === "ADMIN" ? "default" : "secondary", children: u.role })] }, u.id))) }) })] })] })] }), _jsx(TabsContent, { value: "users", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "User Management" }), _jsx(CardDescription, { children: "Manage all registered users" })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Search users...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 w-64" })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase", children: "User" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase", children: "Role" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase", children: "Apps" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase", children: "Last Active" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y", children: filteredUsers.map((u) => (_jsxs("tr", { className: "hover:bg-muted/50 transition-colors", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold", children: u.name?.[0]?.toUpperCase() ||
                                                                                    u.email[0].toUpperCase() }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: u.name || "No name" }), _jsx("p", { className: "text-sm text-muted-foreground", children: u.email })] })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsx(Badge, { variant: u.role === "ADMIN" ? "default" : "secondary", children: u.role }) }), _jsx("td", { className: "px-4 py-3", children: u.emailVerified ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }), _jsx("span", { className: "text-sm", children: "Verified" })] })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(XCircle, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "Unverified" })] })) }), _jsx("td", { className: "px-4 py-3 text-muted-foreground", children: u._count.applications }), _jsx("td", { className: "px-4 py-3 text-sm text-muted-foreground", children: u.lastLoginAt
                                                                        ? new Date(u.lastLoginAt).toLocaleDateString()
                                                                        : "Never" }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon", asChild: true, children: _jsx(Link, { to: `/admin/users/${u.id}`, children: _jsx(Eye, { className: "w-4 h-4" }) }) }), _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(UserCog, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive hover:text-destructive", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, u.id))) })] }) }) })] }) }), _jsx(TabsContent, { value: "applications", children: _jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "lg:col-span-2", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "All Applications" }), _jsx(CardDescription, { children: "Review and manage visa applications" })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Search applications...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 w-64" })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2 max-h-[600px] overflow-y-auto", children: filteredApplications.length === 0 ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx(FileText, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No applications found" })] })) : (filteredApplications.map((app) => (_jsx("div", { onClick: () => setSelectedApplication(app), className: `p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${selectedApplication?.id === app.id
                                                            ? "bg-muted border-primary"
                                                            : ""}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-2 bg-primary/10 rounded-lg", children: _jsx(Plane, { className: "w-5 h-5 text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: app.user?.name || "Unknown User" }), _jsx("p", { className: "text-sm text-muted-foreground", children: app.user?.email })] })] }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { className: getStatusBadge(app.status), children: app.status }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: new Date(app.createdAt).toLocaleDateString() })] })] }) }, app.id)))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Application Details" }) }), _jsx(CardContent, { children: selectedApplication ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-3", children: "Applicant" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold", children: selectedApplication.user?.name?.[0]?.toUpperCase() ||
                                                                                "?" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: selectedApplication.user?.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: selectedApplication.user?.email })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-3", children: "Status" }), _jsx(Badge, { className: getStatusBadge(selectedApplication.status), children: selectedApplication.status })] }), selectedApplication.personalInfo && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-3", children: "Personal Information" }), _jsx("div", { className: "bg-muted/50 rounded-lg p-4 space-y-2", children: (() => {
                                                                        const data = parseFormData(selectedApplication.personalInfo);
                                                                        if (!data)
                                                                            return (_jsx("p", { className: "text-sm text-muted-foreground", children: "No data" }));
                                                                        return Object.entries(data)
                                                                            .slice(0, 5)
                                                                            .map(([key, value]) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground capitalize", children: key.replace(/([A-Z])/g, " $1") }), _jsx("span", { className: "font-medium", children: String(value) || "-" })] }, key)));
                                                                    })() })] })), _jsxs("div", { className: "flex gap-3 pt-4 border-t", children: [_jsx(Button, { className: "flex-1", children: "Approve" }), _jsx(Button, { variant: "outline", className: "flex-1", children: "Reject" })] })] })) : (_jsxs("div", { className: "p-12 text-center", children: [_jsx(FileText, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Select an application to view details" })] })) })] })] }) }), _jsx(TabsContent, { value: "cms", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Content Management" }), _jsx("p", { className: "text-muted-foreground", children: "Manage blog posts and news articles" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => handleOpenNewPost("news"), children: [_jsx(Newspaper, { className: "w-4 h-4 mr-2" }), "New News"] }), _jsxs(Button, { onClick: () => handleOpenNewPost("blog"), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Blog Post"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-primary/10 rounded-lg", children: _jsx(BookOpen, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold", children: blogPosts.length }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Blog Posts" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-blue-500/10 rounded-lg", children: _jsx(Newspaper, { className: "w-6 h-6 text-blue-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold", children: newsPosts.length }), _jsx("p", { className: "text-sm text-muted-foreground", children: "News Articles" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-green-500/10 rounded-lg", children: _jsx(Globe, { className: "w-6 h-6 text-green-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold", children: posts.filter((p) => p.status === "published").length }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Published" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-yellow-500/10 rounded-lg", children: _jsx(Edit, { className: "w-6 h-6 text-yellow-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold", children: posts.filter((p) => p.status === "draft").length }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Drafts" })] })] }) }) })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-5 h-5" }), _jsx(CardTitle, { children: "Blog Posts" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleOpenNewPost("blog"), children: _jsx(Plus, { className: "w-4 h-4" }) })] }), _jsx(CardDescription, { children: "Manage your blog articles" })] }), _jsx(CardContent, { children: cmsLoading ? (_jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx(Skeleton, { className: "h-5 w-3/4 mb-2" }), _jsx(Skeleton, { className: "h-4 w-full mb-2" }), _jsx(Skeleton, { className: "h-4 w-1/2" })] }, i))) })) : blogPosts.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(BookOpen, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "No blog posts yet" }), _jsx(Button, { variant: "outline", onClick: () => handleOpenNewPost("blog"), children: "Create your first post" })] })) : (_jsx("div", { className: "space-y-3 max-h-[400px] overflow-y-auto", children: blogPosts.map((post) => (_jsx("div", { className: "p-4 border rounded-lg hover:bg-muted/50 transition-colors", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-medium truncate", children: post.title }), _jsx("p", { className: "text-sm text-muted-foreground line-clamp-2 mt-1", children: post.excerpt ||
                                                                                        post.content.substring(0, 100) }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx(Badge, { variant: post.status === "published"
                                                                                                ? "default"
                                                                                                : "secondary", children: post.status }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatPostDate(post.publishedAt || post.createdAt) })] })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleEditPost(post), children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleTogglePublish(post), children: post.status === "published" ? (_jsx(XCircle, { className: "w-4 h-4" })) : (_jsx(Globe, { className: "w-4 h-4" })) }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive hover:text-destructive", onClick: () => {
                                                                                        setPostToDelete(post);
                                                                                        setDeleteDialogOpen(true);
                                                                                    }, children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }) }, post.id))) })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Newspaper, { className: "w-5 h-5" }), _jsx(CardTitle, { children: "News Articles" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleOpenNewPost("news"), children: _jsx(Plus, { className: "w-4 h-4" }) })] }), _jsx(CardDescription, { children: "Manage news and announcements" })] }), _jsx(CardContent, { children: cmsLoading ? (_jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx(Skeleton, { className: "h-5 w-3/4 mb-2" }), _jsx(Skeleton, { className: "h-4 w-full mb-2" }), _jsx(Skeleton, { className: "h-4 w-1/2" })] }, i))) })) : newsPosts.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Newspaper, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "No news articles yet" }), _jsx(Button, { variant: "outline", onClick: () => handleOpenNewPost("news"), children: "Create your first article" })] })) : (_jsx("div", { className: "space-y-3 max-h-[400px] overflow-y-auto", children: newsPosts.map((post) => (_jsx("div", { className: "p-4 border rounded-lg hover:bg-muted/50 transition-colors", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-medium truncate", children: post.title }), _jsx("p", { className: "text-sm text-muted-foreground line-clamp-2 mt-1", children: post.excerpt ||
                                                                                        post.content.substring(0, 100) }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx(Badge, { variant: post.status === "published"
                                                                                                ? "default"
                                                                                                : "secondary", children: post.status }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatPostDate(post.publishedAt || post.createdAt) })] })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleEditPost(post), children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleTogglePublish(post), children: post.status === "published" ? (_jsx(XCircle, { className: "w-4 h-4" })) : (_jsx(Globe, { className: "w-4 h-4" })) }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive hover:text-destructive", onClick: () => {
                                                                                        setPostToDelete(post);
                                                                                        setDeleteDialogOpen(true);
                                                                                    }, children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }) }, post.id))) })) })] })] })] }) })] }), _jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-[700px] max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: [editingPost ? "Edit" : "Create", " ", newPost.category === "blog" ? "Blog Post" : "News Article"] }), _jsx(DialogDescription, { children: editingPost
                                            ? "Make changes to your content below."
                                            : `Create a new ${newPost.category === "blog" ? "blog post" : "news article"} for your website.` })] }), _jsxs("div", { className: "grid gap-6 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "title", children: "Title *" }), _jsx(Input, { id: "title", value: newPost.title, onChange: (e) => setNewPost((prev) => ({ ...prev, title: e.target.value })), placeholder: "Enter a compelling title..." })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Category" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { type: "button", variant: newPost.category === "blog" ? "default" : "outline", onClick: () => setNewPost((prev) => ({ ...prev, category: "blog" })), className: "flex-1", children: [_jsx(BookOpen, { className: "w-4 h-4 mr-2" }), "Blog Post"] }), _jsxs(Button, { type: "button", variant: newPost.category === "news" ? "default" : "outline", onClick: () => setNewPost((prev) => ({ ...prev, category: "news" })), className: "flex-1", children: [_jsx(Newspaper, { className: "w-4 h-4 mr-2" }), "News Article"] })] })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "excerpt", children: "Short Description" }), _jsx(Textarea, { id: "excerpt", value: newPost.excerpt, onChange: (e) => setNewPost((prev) => ({ ...prev, excerpt: e.target.value })), placeholder: "A brief summary that appears in previews...", rows: 2 })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "content", children: "Content *" }), _jsx(Textarea, { id: "content", value: newPost.content, onChange: (e) => setNewPost((prev) => ({ ...prev, content: e.target.value })), placeholder: "Write your full article content here...", rows: 10, className: "font-mono text-sm" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "imageUrl", children: "Featured Image URL" }), _jsx("div", { className: "flex gap-2", children: _jsxs("div", { className: "relative flex-1", children: [_jsx(ImageIcon, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { id: "imageUrl", value: newPost.imageUrl, onChange: (e) => setNewPost((prev) => ({
                                                                ...prev,
                                                                imageUrl: e.target.value,
                                                            })), placeholder: "https://example.com/image.jpg", className: "pl-10" })] }) }), newPost.imageUrl && (_jsx("div", { className: "relative aspect-video rounded-lg overflow-hidden bg-muted", children: _jsx("img", { src: newPost.imageUrl, alt: "Preview", className: "w-full h-full object-cover", onError: (e) => {
                                                        e.target.style.display = "none";
                                                    } }) }))] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "tags", children: "Tags" }), _jsx(Input, { id: "tags", value: newPost.tags, onChange: (e) => setNewPost((prev) => ({ ...prev, tags: e.target.value })), placeholder: "visa, travel, guide (comma-separated)" })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: "Publish immediately" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Make this ", newPost.category === "blog" ? "post" : "article", " ", "visible on the website"] })] }), _jsx(Switch, { checked: newPost.status === "published", onCheckedChange: (checked) => setNewPost((prev) => ({
                                                    ...prev,
                                                    status: checked ? "published" : "draft",
                                                })) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsDialogOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleSavePost, disabled: saving, children: [saving && _jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), editingPost ? "Save Changes" : "Create Post"] })] })] }) }), _jsx(AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Delete Post" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to delete \"", postToDelete?.title, "\"? This action cannot be undone."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: handleDeletePost, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })] })] }) })] }) }));
};
export default AdminDashboard;
