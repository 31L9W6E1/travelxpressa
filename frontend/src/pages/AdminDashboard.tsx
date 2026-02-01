import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  FileText,
  TrendingUp,
  Search,
  ChevronRight,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  UserCog,
  BarChart3,
  Plane,
  Plus,
  Edit,
  Newspaper,
  BookOpen,
  Globe,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import {
  type Post,
  type CreatePostInput,
  getAdminPosts,
  createPost,
  updatePost,
  deletePost,
  togglePostPublish,
  formatPostDate,
} from "@/api/posts";
import { UserAvatar } from "@/components/UserAvatar";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  _count: {
    applications: number;
    inquiries: number;
  };
}

interface ApplicationData {
  id: string;
  visaType: string;
  status: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  personalInfo?: string;
  contactInfo?: string;
  passportInfo?: string;
  travelInfo?: string;
}

interface Stats {
  overview: {
    totalUsers: number;
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
    rejectedApplications: number;
  };
  users: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  applications: {
    total: number;
    draft: number;
    inProgress: number;
    submitted: number;
    underReview: number;
    completed: number;
    rejected: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    approvalRate: number;
  };
  inquiries: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  recent: {
    inquiries: any[];
    applications: any[];
    users: any[];
  };
  charts: {
    monthlyApplications: any[];
    monthlyUsers: any[];
  };
}

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
} satisfies ChartConfig;

const userGrowthConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "applications" | "cms"
  >("overview");
  const [users, setUsers] = useState<UserData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationData | null>(null);

  // CMS State
  const [posts, setPosts] = useState<Post[]>([]);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [newPost, setNewPost] = useState<CreatePostInput>({
    title: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    category: "blog",
    tags: "",
    status: "draft",
  });

  // Chart data - use real data from stats or fallback to sample data
  const monthlyApplicationData = stats?.charts?.monthlyApplications?.length
    ? stats.charts.monthlyApplications
    : [
      { month: "Jan", submitted: 0, approved: 0, pending: 0, rejected: 0 },
      { month: "Feb", submitted: 0, approved: 0, pending: 0, rejected: 0 },
      { month: "Mar", submitted: 0, approved: 0, pending: 0, rejected: 0 },
      { month: "Apr", submitted: 0, approved: 0, pending: 0, rejected: 0 },
      { month: "May", submitted: 0, approved: 0, pending: 0, rejected: 0 },
      { month: "Jun", submitted: 0, approved: 0, pending: 0, rejected: 0 },
    ];

  const userGrowthData = stats?.charts?.monthlyUsers?.length
    ? stats.charts.monthlyUsers
    : [
      { month: "Jan", users: 0 },
      { month: "Feb", users: 0 },
      { month: "Mar", users: 0 },
      { month: "Apr", users: 0 },
      { month: "May", users: 0 },
      { month: "Jun", users: 0 },
    ];

  const statusDistributionData = [
    {
      name: "Approved",
      value: stats?.applications?.completed || 0,
      fill: "#22c55e",
    },
    {
      name: "Pending",
      value: (stats?.applications?.submitted || 0) + (stats?.applications?.underReview || 0) + (stats?.applications?.inProgress || 0),
      fill: "#eab308"
    },
    {
      name: "Rejected",
      value: stats?.applications?.rejected || 0,
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
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setCmsLoading(true);
    try {
      const response = await getAdminPosts();
      setPosts(response.data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setCmsLoading(false);
    }
  };

  const handleOpenNewPost = (category: "blog" | "news") => {
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

  const handleEditPost = (post: Post) => {
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
      } else {
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await deletePost(postToDelete.id);
      toast.success("Post deleted successfully");
      await fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      const response = await togglePostPublish(post.id);
      toast.success(response.message);
      await fetchPosts();
    } catch (error) {
      toast.error("Failed to update publish status");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredApplications = applications.filter(
    (app) =>
      app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.visaType?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const blogPosts = posts.filter((p) => p.category === "blog");
  const newsPosts = posts.filter((p) => p.category === "news");

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
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

  const parseFormData = (jsonString?: string) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <div className="text-center bg-card border border-border rounded-2xl p-12">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 text-sm">System Online</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-6"
        >
          <TabsList className="bg-secondary">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2">
              <FileText className="w-4 h-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="cms" className="gap-2">
              <Newspaper className="w-4 h-4" />
              CMS
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.users?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className={`w-3 h-3 ${(stats?.users?.growth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={(stats?.users?.growth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {(stats?.users?.growth || 0) >= 0 ? '+' : ''}{stats?.users?.growth || 0}%
                    </span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Applications
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.applications?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className={`w-3 h-3 ${(stats?.applications?.growth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={(stats?.applications?.growth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {(stats?.applications?.growth || 0) >= 0 ? '+' : ''}{stats?.applications?.growth || 0}%
                    </span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.applications?.completed || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.applications?.approvalRate || 0}% approval rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats?.applications?.submitted || 0) + (stats?.applications?.underReview || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    {stats?.applications?.submitted || 0} submitted, {stats?.applications?.underReview || 0} under review
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Applications Overview</CardTitle>
                  <CardDescription>Monthly application trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={applicationChartConfig}
                    className="h-[300px]"
                  >
                    <AreaChart data={monthlyApplicationData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="submitted"
                        stackId="1"
                        stroke="var(--color-submitted)"
                        fill="var(--color-submitted)"
                        fillOpacity={0.4}
                      />
                      <Area
                        type="monotone"
                        dataKey="approved"
                        stackId="2"
                        stroke="var(--color-approved)"
                        fill="var(--color-approved)"
                        fillOpacity={0.4}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>
                    New user registrations over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={userGrowthConfig}
                    className="h-[300px]"
                  >
                    <LineChart data={userGrowthData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="var(--color-users)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-users)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Status Distribution & Recent Users */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>
                    Current application status breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {statusDistributionData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>Latest registered users</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("users")}
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(0, 5).map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar name={u.name} email={u.email} size="md" />
                          <div>
                            <p className="text-sm font-medium">
                              {u.name || "No name"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={u.role === "ADMIN" ? "default" : "secondary"}
                        >
                          {u.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage all registered users
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Apps
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Last Active
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={u.name} email={u.email} size="md" />
                              <div>
                                <p className="font-medium">
                                  {u.name || "No name"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                u.role === "ADMIN" ? "default" : "secondary"
                              }
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {u.emailVerified ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Unverified
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {u._count.applications}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {u.lastLoginAt
                              ? new Date(u.lastLoginAt).toLocaleDateString()
                              : "Never"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/admin/users/${u.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <UserCog className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Applications</CardTitle>
                      <CardDescription>
                        Review and manage visa applications
                      </CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredApplications.length === 0 ? (
                      <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No applications found
                        </p>
                      </div>
                    ) : (
                      filteredApplications.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApplication(app)}
                          className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedApplication?.id === app.id
                              ? "bg-muted border-primary"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Plane className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {app.user?.name || "Unknown User"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {app.user?.email}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusBadge(app.status)}>
                                {app.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedApplication ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                          Applicant
                        </h3>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={selectedApplication.user?.name} email={selectedApplication.user?.email} size="lg" />
                          <div>
                            <p className="font-medium">
                              {selectedApplication.user?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedApplication.user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                          Status
                        </h3>
                        <Badge
                          className={getStatusBadge(selectedApplication.status)}
                        >
                          {selectedApplication.status}
                        </Badge>
                      </div>

                      {selectedApplication.personalInfo && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">
                            Personal Information
                          </h3>
                          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            {(() => {
                              const data = parseFormData(
                                selectedApplication.personalInfo,
                              );
                              if (!data)
                                return (
                                  <p className="text-sm text-muted-foreground">
                                    No data
                                  </p>
                                );
                              return Object.entries(data)
                                .slice(0, 5)
                                .map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-muted-foreground capitalize">
                                      {key.replace(/([A-Z])/g, " $1")}
                                    </span>
                                    <span className="font-medium">
                                      {String(value) || "-"}
                                    </span>
                                  </div>
                                ));
                            })()}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1">Approve</Button>
                        <Button variant="outline" className="flex-1">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select an application to view details
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CMS Tab */}
          <TabsContent value="cms">
            <div className="space-y-6">
              {/* CMS Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Content Management</h2>
                  <p className="text-muted-foreground">
                    Manage blog posts and news articles
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenNewPost("news")}
                  >
                    <Newspaper className="w-4 h-4 mr-2" />
                    New News
                  </Button>
                  <Button onClick={() => handleOpenNewPost("blog")}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Blog Post
                  </Button>
                </div>
              </div>

              {/* CMS Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{blogPosts.length}</p>
                        <p className="text-sm text-muted-foreground">
                          Blog Posts
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Newspaper className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{newsPosts.length}</p>
                        <p className="text-sm text-muted-foreground">
                          News Articles
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <Globe className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {posts.filter((p) => p.status === "published").length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Published
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-500/10 rounded-lg">
                        <Edit className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {posts.filter((p) => p.status === "draft").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Drafts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Posts Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Blog Posts */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        <CardTitle>Blog Posts</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenNewPost("blog")}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription>Manage your blog articles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cmsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 border rounded-lg">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : blogPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          No blog posts yet
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenNewPost("blog")}
                        >
                          Create your first post
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {blogPosts.map((post) => (
                          <div
                            key={post.id}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {post.title}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {post.excerpt ||
                                    post.content.substring(0, 100)}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge
                                    variant={
                                      post.status === "published"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {post.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatPostDate(
                                      post.publishedAt || post.createdAt,
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditPost(post)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleTogglePublish(post)}
                                >
                                  {post.status === "published" ? (
                                    <XCircle className="w-4 h-4" />
                                  ) : (
                                    <Globe className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setPostToDelete(post);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* News Posts */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5" />
                        <CardTitle>News Articles</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenNewPost("news")}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      Manage news and announcements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cmsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 border rounded-lg">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : newsPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          No news articles yet
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenNewPost("news")}
                        >
                          Create your first article
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {newsPosts.map((post) => (
                          <div
                            key={post.id}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {post.title}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {post.excerpt ||
                                    post.content.substring(0, 100)}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge
                                    variant={
                                      post.status === "published"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {post.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatPostDate(
                                      post.publishedAt || post.createdAt,
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditPost(post)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleTogglePublish(post)}
                                >
                                  {post.status === "published" ? (
                                    <XCircle className="w-4 h-4" />
                                  ) : (
                                    <Globe className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setPostToDelete(post);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Post Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Edit" : "Create"}{" "}
                {newPost.category === "blog" ? "Blog Post" : "News Article"}
              </DialogTitle>
              <DialogDescription>
                {editingPost
                  ? "Make changes to your content below."
                  : `Create a new ${newPost.category === "blog" ? "blog post" : "news article"} for your website.`}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter a compelling title..."
                />
              </div>

              {/* Category Toggle */}
              <div className="grid gap-2">
                <Label>Category</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={
                      newPost.category === "blog" ? "default" : "outline"
                    }
                    onClick={() =>
                      setNewPost((prev) => ({ ...prev, category: "blog" }))
                    }
                    className="flex-1"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Blog Post
                  </Button>
                  <Button
                    type="button"
                    variant={
                      newPost.category === "news" ? "default" : "outline"
                    }
                    onClick={() =>
                      setNewPost((prev) => ({ ...prev, category: "news" }))
                    }
                    className="flex-1"
                  >
                    <Newspaper className="w-4 h-4 mr-2" />
                    News Article
                  </Button>
                </div>
              </div>

              {/* Excerpt */}
              <div className="grid gap-2">
                <Label htmlFor="excerpt">Short Description</Label>
                <Textarea
                  id="excerpt"
                  value={newPost.excerpt}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="A brief summary that appears in previews..."
                  rows={2}
                />
              </div>

              {/* Content */}
              <div className="grid gap-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Write your full article content here..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              {/* Image URL */}
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Featured Image URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="imageUrl"
                      value={newPost.imageUrl}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/image.jpg"
                      className="pl-10"
                    />
                  </div>
                </div>
                {newPost.imageUrl && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={newPost.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={newPost.tags}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="visa, travel, guide (comma-separated)"
                />
              </div>

              <Separator />

              {/* Publish Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Publish immediately</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this {newPost.category === "blog" ? "post" : "article"}{" "}
                    visible on the website
                  </p>
                </div>
                <Switch
                  checked={newPost.status === "published"}
                  onCheckedChange={(checked) =>
                    setNewPost((prev) => ({
                      ...prev,
                      status: checked ? "published" : "draft",
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePost} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingPost ? "Save Changes" : "Create Post"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{postToDelete?.title}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
