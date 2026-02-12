import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  CreditCard,
  Activity,
  FolderOpen,
  TrendingDown,
  MessageSquare,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  LabelList,
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
import api from "@/api/client";
import ApplicationDetailModal from "@/components/admin/ApplicationDetailModal";
import VisaTypeChart from "@/components/admin/VisaTypeChart";
import ImageUpload from "@/components/ImageUpload";
import PaymentDashboard from "@/components/admin/PaymentDashboard";
import PaymentAnalytics from "@/components/admin/PaymentAnalytics";
import GalleryManager from "@/components/admin/GalleryManager";
import ApplicationTracker from "@/components/admin/ApplicationTracker";
import TranslationRequestsPanel from "@/components/admin/TranslationRequestsPanel";

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
  submittedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  personalInfo?: string;
  contactInfo?: string;
  passportInfo?: string;
  travelInfo?: string;
  familyInfo?: string;
  workEducation?: string;
  securityInfo?: string;
  documents?: string;
  adminNotes?: string;
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

// Chart configurations are defined inside the component so labels can be localized.

type AdminTab =
  | "overview"
  | "users"
  | "applications"
  | "requests"
  | "tracking"
  | "payments"
  | "analytics"
  | "gallery"
  | "cms";

const getAdminTabFromSection = (section?: string): AdminTab => {
  switch (section) {
    case "overview":
    case "users":
    case "applications":
    case "requests":
    case "tracking":
    case "payments":
    case "analytics":
    case "gallery":
    case "cms":
      return section;
    case "application":
      return "applications";
    default:
      return "overview";
  }
};

type OfficialReferenceLink = {
  label: string;
  url: string;
};

const OFFICIAL_REFERENCE_LINKS: OfficialReferenceLink[] = [
  {
    label: "United Kingdom (Standard Visitor)",
    url: "https://www.gov.uk/standard-visitor/apply-standard-visitor-visa",
  },
  {
    label: "Canada (Visitor Visa)",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/apply-visitor-visa.htm",
  },
  {
    label: "Australia (Visitor 600)",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600",
  },
  {
    label: "Japan VFS (Mongolia)",
    url: "https://visa.vfsglobal.com/mng/en/jpn",
  },
  {
    label: "Ireland VFS (Mongolia)",
    url: "https://visa.vfsglobal.com/mng/en/irl/",
  },
  {
    label: "Germany VFS (Ulaanbaatar)",
    url: "https://visa.vfsglobal.com/mng/en/deu/attend-centre/ulaanbaatar",
  },
];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { section, applicationId } =
    useParams<{ section?: string; applicationId?: string }>();
  const tabFromUrl = applicationId ? "applications" : getAdminTabFromSection(section);

  const applicationChartConfig = {
    submitted: {
      label: t("dashboard.status.Submitted", "Submitted"),
      // Our Tailwind theme uses OKLCH values (e.g. `--chart-1: oklch(...)`), so don't wrap in `hsl(...)`.
      color: "var(--chart-1)",
    },
    approved: {
      label: t("dashboard.status.Approved", "Approved"),
      color: "var(--chart-2)",
    },
    pending: {
      label: t("dashboard.status.pending", "Pending"),
      color: "var(--chart-3)",
    },
    rejected: {
      label: t("dashboard.status.Rejected", "Rejected"),
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  const userGrowthConfig = {
    users: {
      label: t("dashboard.tabs.users", "Users"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const applicationsUsersChartConfig = {
    applications: {
      label: t("dashboard.stats.applications", "Applications"),
      color: "var(--chart-1)",
    },
    users: {
      label: t("dashboard.tabs.users", "Users"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const dailyUserChartConfig = {
    users: {
      label: t("dashboard.tabs.users", "Users"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const dailyApplicationChartConfig = {
    applications: {
      label: t("dashboard.stats.applications", "Applications"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const applicationStatusRingsConfig = {
    count: {
      label: t("dashboard.stats.applications", "Applications"),
    },
    draft: {
      label: t("dashboard.status.Draft", "Draft"),
      color: "#94a3b8",
    },
    inProgress: {
      label: t("dashboard.status.InProgress", "In Progress"),
      color: "#38bdf8",
    },
    submitted: {
      label: t("dashboard.status.Submitted", "Submitted"),
      color: "#818cf8",
    },
    underReview: {
      label: t("dashboard.status.UnderReview", "Under Review"),
      color: "#a78bfa",
    },
    completed: {
      label: t("dashboard.status.Completed", "Completed"),
      color: "#34d399",
    },
    rejected: {
      label: t("dashboard.status.Rejected", "Rejected"),
      color: "#f87171",
    },
  } satisfies ChartConfig;

  const [activeTab, setActiveTab] = useState<AdminTab>(tabFromUrl);
  const [users, setUsers] = useState<UserData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [visaTypeFilter, setVisaTypeFilter] = useState<string>("");

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

  const applicationsUsersChartData = monthlyApplicationData.map((item: any) => {
    const totalFromApi = Number.isFinite(item?.total) ? Number(item.total) : null;
    const total =
      totalFromApi ??
      Number(item?.pending || 0) +
        Number(item?.submitted || 0) +
        Number(item?.approved || 0) +
        Number(item?.rejected || 0);
    const usersForMonth =
      userGrowthData.find((u: any) => u.month === item.month)?.users ?? 0;
    return {
      month: item.month,
      applications: total,
      users: Number(usersForMonth) || 0,
    };
  });

  const pendingApplicationsCount =
    (stats?.applications?.draft || 0) +
    (stats?.applications?.inProgress || 0) +
    (stats?.applications?.submitted || 0) +
    (stats?.applications?.underReview || 0);

  const statusRingsDataRaw = [
    { key: "draft", count: stats?.applications?.draft || 0, fill: "var(--color-draft)" },
    {
      key: "inProgress",
      count: stats?.applications?.inProgress || 0,
      fill: "var(--color-inProgress)",
    },
    {
      key: "submitted",
      count: stats?.applications?.submitted || 0,
      fill: "var(--color-submitted)",
    },
    {
      key: "underReview",
      count: stats?.applications?.underReview || 0,
      fill: "var(--color-underReview)",
    },
    {
      key: "completed",
      count: stats?.applications?.completed || 0,
      fill: "var(--color-completed)",
    },
    {
      key: "rejected",
      count: stats?.applications?.rejected || 0,
      fill: "var(--color-rejected)",
    },
  ];
  const statusRingsData = statusRingsDataRaw.filter((d) => d.count > 0);
  const sortedStatusRingsData = [...statusRingsData].sort(
    (a, b) => a.count - b.count,
  );
  const statusRingsTotal = sortedStatusRingsData.reduce(
    (sum, d) => sum + d.count,
    0,
  );

  const dailyActivityData = useMemo(() => {
    const days = 14;
    const daily = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const usersCount = users.filter((u) => {
        const date = new Date(u.createdAt);
        return date >= dayStart && date < dayEnd;
      }).length;

      const applicationsCount = applications.filter((app) => {
        const date = new Date(app.createdAt);
        return date >= dayStart && date < dayEnd;
      }).length;

      daily.push({
        date: dayStart.toISOString().slice(0, 10),
        day: dayStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        users: usersCount,
        applications: applicationsCount,
      });
    }

    return daily;
  }, [applications, users]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchDashboardData();
      fetchPosts();
    }
  }, [user]);

  useEffect(() => {
    if (applicationId) {
      setActiveTab("applications");
      return;
    }

    const nextTab = getAdminTabFromSection(section);
    setActiveTab(nextTab);

    // Canonicalize URL so each section has a stable /admin/<tab> path.
    if (!section || section !== nextTab) {
      navigate(`/admin/${nextTab}`, { replace: true });
    }
  }, [section, applicationId, navigate]);

  // Deep-link support: /admin/applications/:applicationId
  useEffect(() => {
    if (!applicationId || user?.role !== "ADMIN") return;

    // If we already have it selected, just ensure the modal is open.
    if (selectedApplication?.id === applicationId) {
      setDetailModalOpen(true);
      return;
    }

    const fromList = applications.find((a) => a.id === applicationId);
    if (fromList) {
      setSelectedApplication(fromList);
      setDetailModalOpen(true);
      return;
    }

    // Fallback: fetch the application directly.
    (async () => {
      try {
        const res = await api.get(`/api/admin/applications/${applicationId}`);
        const payload = res.data;
        const app =
          payload?.data ||
          payload?.application ||
          payload?.data?.application ||
          payload;
        if (app?.id) {
          setSelectedApplication(app);
          setDetailModalOpen(true);
        } else {
          toast.error("Failed to load application details");
        }
      } catch (err) {
        console.error("Failed to fetch application for deep link:", err);
        toast.error("Failed to load application details");
      }
    })();
  }, [applicationId, user, applications, selectedApplication]);

  const handleTabChange = (nextTab: AdminTab) => {
    setActiveTab(nextTab);
    navigate(`/admin/${nextTab}`);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResult, usersResult, appsResult] = await Promise.allSettled([
        api.get("/api/admin/stats"),
        api.get("/api/admin/users"),
        api.get("/api/admin/applications"),
      ]);

      if (statsResult.status === "fulfilled") {
        const statsPayload = statsResult.value.data;
        setStats(statsPayload?.data || statsPayload || null);
      } else {
        console.error("Failed to fetch admin stats:", statsResult.reason);
      }

      if (usersResult.status === "fulfilled") {
        const usersPayload = usersResult.value.data;
        setUsers(
          usersPayload?.data ||
            usersPayload?.users ||
            usersPayload?.data?.users ||
            [],
        );
      } else {
        console.error("Failed to fetch admin users:", usersResult.reason);
        setUsers([]);
      }

      if (appsResult.status === "fulfilled") {
        const appsPayload = appsResult.value.data;
        setApplications(
          appsPayload?.data ||
            appsPayload?.applications ||
            appsPayload?.data?.applications ||
            [],
        );
      } else {
        console.error(
          "Failed to fetch admin applications:",
          appsResult.reason,
        );
        setApplications([]);
      }

      if (
        statsResult.status === "rejected" &&
        usersResult.status === "rejected" &&
        appsResult.status === "rejected"
      ) {
        toast.error("Failed to load admin dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load admin dashboard data");
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
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save post";
      toast.error(message);
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

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.visaType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesVisaType = !visaTypeFilter || app.visaType === visaTypeFilter;
    return matchesSearch && matchesStatus && matchesVisaType;
  });

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

  const parseFormData = (jsonString?: string | Record<string, unknown>) => {
    if (!jsonString) return null;
    if (typeof jsonString !== "string") return jsonString;
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
          <p className="text-muted-foreground">{t('dashboard.loading', 'Loading dashboard...')}</p>
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
            {t('dashboard.accessDenied', 'Access Denied')}
          </h2>
          <p className="text-muted-foreground">
            {t('dashboard.noPermission', "You don't have permission to access this page.")}
          </p>
          <Link
            to="/"
            className="mt-6 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            {t('dashboard.goHome', 'Go Home')}
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
              {t('dashboard.title', 'Admin Dashboard')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('dashboard.welcomeBack', 'Welcome back')}, {user?.name}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 text-sm">{t('dashboard.systemOnline', 'System Online')}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => handleTabChange(v as AdminTab)}
          className="space-y-6"
        >
          <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              {t('dashboard.tabs.overview', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              {t('dashboard.tabs.users', 'Users')}
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2">
              <FileText className="w-4 h-4" />
              {t('dashboard.tabs.applications', 'Applications')}
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              {t("dashboard.tabs.requests", "Requests")}
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2">
              <Activity className="w-4 h-4" />
              {t('dashboard.tabs.tracking', 'Tracking')}
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              {t('dashboard.tabs.payments', 'Payments')}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('dashboard.tabs.analytics', 'Analytics')}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              {t('dashboard.tabs.gallery', 'Gallery')}
            </TabsTrigger>
            <TabsTrigger value="cms" className="gap-2">
              <Newspaper className="w-4 h-4" />
              {t('dashboard.tabs.cms', 'CMS')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('dashboard.stats.totalUsers', 'Total Users')}
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
                    </span> {t('dashboard.stats.fromLastMonth', 'from last month')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('dashboard.stats.applications', 'Applications')}
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
                    </span> {t('dashboard.stats.fromLastMonth', 'from last month')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('dashboard.stats.completed', 'Completed')}
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.applications?.completed || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.applications?.approvalRate || 0}% {t('dashboard.stats.approvalRate', 'approval rate')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('dashboard.stats.pending', 'Pending')}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pendingApplicationsCount}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    {stats?.applications?.draft || 0} {t('dashboard.status.draft', 'draft')},{" "}
                    {stats?.applications?.inProgress || 0} {t('dashboard.status.inProgress', 'in progress')},{" "}
                    {stats?.applications?.submitted || 0} {t('dashboard.status.submitted', 'submitted')},{" "}
                    {stats?.applications?.underReview || 0} {t('dashboard.status.underReview', 'under review')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.charts.dailyUsers", "Daily User Count")}</CardTitle>
                  <CardDescription>
                    {t("dashboard.charts.dailyUsersDesc", "New user registrations (last 14 days)")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={dailyUserChartConfig} className="h-[260px]">
                    <LineChart data={dailyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="var(--color-users)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "var(--color-users)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.charts.dailyApplications", "Daily Application Submissions")}</CardTitle>
                  <CardDescription>
                    {t("dashboard.charts.dailyApplicationsDesc", "Applications created per day (last 14 days)")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={dailyApplicationChartConfig} className="h-[260px]">
                    <LineChart data={dailyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="applications"
                        stroke="var(--color-applications)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "var(--color-applications)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.charts.applicationsOverview', 'Applications Overview')}</CardTitle>
                  <CardDescription>{t('dashboard.charts.applicationsOverviewDesc', 'Total applications vs new users (last 6 months)')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={applicationsUsersChartConfig}
                    className="h-[300px]"
                  >
                    <AreaChart accessibilityLayer data={applicationsUsersChartData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <defs>
                        <linearGradient
                          id="gradient-admin-chart-applications"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-applications)"
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-applications)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradient-admin-chart-users"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-users)"
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-users)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="users"
                        type="natural"
                        fill="url(#gradient-admin-chart-users)"
                        fillOpacity={0.4}
                        stroke="var(--color-users)"
                        strokeWidth={0.9}
                        strokeDasharray={"3 3"}
                      />
                      <Area
                        dataKey="applications"
                        type="natural"
                        fill="url(#gradient-admin-chart-applications)"
                        fillOpacity={0.35}
                        stroke="var(--color-applications)"
                        strokeWidth={0.9}
                        strokeDasharray={"3 3"}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.charts.userGrowth', 'User Growth')}</CardTitle>
                  <CardDescription>
                    {t('dashboard.charts.userGrowthDesc', 'New user registrations over time')}
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
                  <CardTitle>{t('dashboard.charts.statusDistribution', 'Status Distribution')}</CardTitle>
                  <CardDescription>
                    {t('dashboard.charts.statusDistributionDesc', 'Current application status breakdown')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statusRingsTotal === 0 ? (
                    <div className="h-[250px] flex flex-col items-center justify-center text-center">
                      <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.charts.noData', 'No application data yet')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ChartContainer
                        config={applicationStatusRingsConfig}
                        className="mx-auto aspect-square max-h-[250px]"
                      >
                        <PieChart>
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                nameKey="key"
                                hideLabel
                              />
                            }
                          />
                          {sortedStatusRingsData.map((entry, index) => (
                            <Pie
                              key={`status-ring-${entry.key}`}
                              data={[entry]}
                              innerRadius={30}
                              outerRadius={50 + index * 10}
                              dataKey="count"
                              cornerRadius={4}
                              startAngle={
                                (sortedStatusRingsData
                                  .slice(0, index)
                                  .reduce((sum, d) => sum + d.count, 0) /
                                  statusRingsTotal) *
                                360
                              }
                              endAngle={
                                (sortedStatusRingsData
                                  .slice(0, index + 1)
                                  .reduce((sum, d) => sum + d.count, 0) /
                                  statusRingsTotal) *
                                360
                              }
                            >
                              <Cell fill={entry.fill} />
                              <LabelList
                                dataKey="count"
                                stroke="none"
                                fontSize={12}
                                fontWeight={500}
                                fill="currentColor"
                                formatter={(value: number) => value.toString()}
                              />
                            </Pie>
                          ))}
                        </PieChart>
                      </ChartContainer>

                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                        {sortedStatusRingsData.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.fill }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {
                                applicationStatusRingsConfig[
                                  item.key as keyof typeof applicationStatusRingsConfig
                                ]?.label as any
                              }
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <Badge
                          variant="outline"
                          className={`border-none ${
                            (stats?.applications?.growth || 0) < 0
                              ? "text-red-500 bg-red-500/10"
                              : "text-green-500 bg-green-500/10"
                          }`}
                        >
                          {(stats?.applications?.growth || 0) < 0 ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : (
                            <TrendingUp className="h-4 w-4" />
                          )}
                          <span className="ml-1">
                            {(stats?.applications?.growth || 0) >= 0 ? "+" : ""}
                            {stats?.applications?.growth || 0}%
                          </span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t('dashboard.stats.fromLastMonth', 'from last month')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('dashboard.recentUsers.title', 'Recent Users')}</CardTitle>
                    <CardDescription>{t('dashboard.recentUsers.description', 'Latest registered users')}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("users")}
                  >
                    {t('common.viewAll', 'View All')} <ChevronRight className="w-4 h-4 ml-1" />
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
                              {u.name || t('common.noName', 'No name')}
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

            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.additional.title", "Additional")}</CardTitle>
                <CardDescription>
                  {t(
                    "dashboard.additional.officialReferences",
                    "Official reference links for visa requirements, fees, and process updates."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {OFFICIAL_REFERENCE_LINKS.map((item) => (
                    <a
                      key={item.url}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border/70 bg-card px-4 py-3 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">{item.label}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('dashboard.users.title', 'User Management')}</CardTitle>
                    <CardDescription>
                      {t('dashboard.users.description', 'Manage all registered users')}
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={t('dashboard.users.searchPlaceholder', 'Search users...')}
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
                          {t('dashboard.users.table.user', 'User')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          {t('dashboard.users.table.role', 'Role')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          {t('dashboard.users.table.status', 'Status')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          {t('dashboard.users.table.apps', 'Apps')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          {t('dashboard.users.table.lastActive', 'Last Active')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          {t('dashboard.users.table.actions', 'Actions')}
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
                                  {u.name || t('common.noName', 'No name')}
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
                                <span className="text-sm">{t('dashboard.users.verified', 'Verified')}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {t('dashboard.users.unverified', 'Unverified')}
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
                              : t('common.never', 'Never')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/admin/users/${u.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/contactsupport?userId=${u.id}`}>
                                  <MessageSquare className="w-4 h-4" />
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
            <div className="space-y-6">
              {/* Visa Type Charts */}
              <VisaTypeChart applications={applications} />

              {/* Applications List */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>{t('dashboard.applications.title', 'All Applications')}</CardTitle>
                      <CardDescription>
                        {t('dashboard.applications.description', 'Review and manage visa applications')} ({filteredApplications.length} {t('common.of', 'of')} {applications.length})
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Search */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder={t('common.search', 'Search...')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-48"
                        />
                      </div>
                      {/* Status Filter */}
                      <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder={t('dashboard.applications.allStatus', 'All Status')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('dashboard.applications.allStatus', 'All Status')}</SelectItem>
                          <SelectItem value="DRAFT">{t('dashboard.status.Draft', 'Draft')}</SelectItem>
                          <SelectItem value="IN_PROGRESS">{t('dashboard.status.InProgress', 'In Progress')}</SelectItem>
                          <SelectItem value="SUBMITTED">{t('dashboard.status.Submitted', 'Submitted')}</SelectItem>
                          <SelectItem value="UNDER_REVIEW">{t('dashboard.status.UnderReview', 'Under Review')}</SelectItem>
                          <SelectItem value="COMPLETED">{t('dashboard.status.Completed', 'Completed')}</SelectItem>
                          <SelectItem value="REJECTED">{t('dashboard.status.Rejected', 'Rejected')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Visa Type Filter */}
                      <Select value={visaTypeFilter || "all"} onValueChange={(v) => setVisaTypeFilter(v === "all" ? "" : v)}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder={t('dashboard.applications.allTypes', 'All Types')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('dashboard.applications.allTypes', 'All Types')}</SelectItem>
                          <SelectItem value="B1_B2">B1/B2</SelectItem>
                          <SelectItem value="F1">F1</SelectItem>
                          <SelectItem value="J1">J1</SelectItem>
                          <SelectItem value="H1B">H1B</SelectItem>
                          <SelectItem value="L1">L1</SelectItem>
                          <SelectItem value="O1">O1</SelectItem>
                          <SelectItem value="K1">K1</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            {t('dashboard.applications.table.applicant', 'Applicant')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            {t('dashboard.applications.table.visaType', 'Visa Type')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            {t('dashboard.applications.table.status', 'Status')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            {t('dashboard.applications.table.progress', 'Progress')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            {t('dashboard.applications.table.created', 'Created')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            {t('dashboard.applications.table.actions', 'Actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredApplications.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-12 text-center">
                              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">
                                {t('dashboard.applications.noApplications', 'No applications found')}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredApplications.map((app) => {
                            const personalInfo = parseFormData(app.personalInfo);
                            const status =
                              typeof app.status === "string" && app.status
                                ? app.status
                                : "DRAFT";
                            const currentStep =
                              Number.isFinite(app.currentStep) && app.currentStep > 0
                                ? app.currentStep
                                : 0;
                            return (
                              <tr
                                key={app.id}
                                className="hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setDetailModalOpen(true);
                                }}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <UserAvatar name={app.user?.name} email={app.user?.email} size="md" />
                                    <div>
                                      <p className="font-medium">
                                        {personalInfo?.givenNames || app.user?.name || t('common.unknown', 'Unknown')}
                                        {personalInfo?.surnames ? ` ${personalInfo.surnames}` : ""}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {app.user?.email}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant="outline" className="font-mono">
                                    {app.visaType}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge className={getStatusBadge(app.status)}>
                                    {status.replace(/_/g, " ")}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${Math.round((currentStep / 9) * 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {currentStep}/9
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedApplication(app);
                                      setDetailModalOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    {t('common.view', 'View')}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <TranslationRequestsPanel />
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking">
            <ApplicationTracker />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentDashboard />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <PaymentAnalytics />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>

          {/* CMS Tab */}
          <TabsContent value="cms">
            <div className="space-y-6">
              {/* CMS Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{t('dashboard.cms.title', 'Content Management')}</h2>
                  <p className="text-muted-foreground">
                    {t('dashboard.cms.description', 'Manage blog posts and news articles')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenNewPost("news")}
                  >
                    <Newspaper className="w-4 h-4 mr-2" />
                    {t('dashboard.cms.newNews', 'New News')}
                  </Button>
                  <Button onClick={() => handleOpenNewPost("blog")}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('dashboard.cms.newBlogPost', 'New Blog Post')}
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
                          {t('dashboard.cms.blogPosts', 'Blog Posts')}
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
                          {t('dashboard.cms.newsArticles', 'News Articles')}
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
                          {t('dashboard.cms.published', 'Published')}
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
                        <p className="text-sm text-muted-foreground">{t('dashboard.cms.drafts', 'Drafts')}</p>
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
                        <CardTitle>{t('dashboard.cms.blogPosts', 'Blog Posts')}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenNewPost("blog")}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription>{t('dashboard.cms.manageBlog', 'Manage your blog articles')}</CardDescription>
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
                          {t('dashboard.cms.noBlogPosts', 'No blog posts yet')}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenNewPost("blog")}
                        >
                          {t('dashboard.cms.createFirstPost', 'Create your first post')}
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
                        <CardTitle>{t('dashboard.cms.newsArticles', 'News Articles')}</CardTitle>
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
                      {t('dashboard.cms.manageNews', 'Manage news and announcements')}
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
                          {t('dashboard.cms.noNewsArticles', 'No news articles yet')}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenNewPost("news")}
                        >
                          {t('dashboard.cms.createFirstArticle', 'Create your first article')}
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
                {editingPost ? t('common.edit', 'Edit') : t('common.create', 'Create')}{" "}
                {newPost.category === "blog" ? t('dashboard.cms.blogPost', 'Blog Post') : t('dashboard.cms.newsArticle', 'News Article')}
              </DialogTitle>
              <DialogDescription>
                {editingPost
                  ? t('dashboard.cms.editDescription', 'Make changes to your content below.')
                  : t('dashboard.cms.createDescription', 'Create a new {{type}} for your website.', { type: newPost.category === "blog" ? t('dashboard.cms.blogPost', 'blog post') : t('dashboard.cms.newsArticle', 'news article') })}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">{t('dashboard.cms.form.title', 'Title')} *</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={t('dashboard.cms.form.titlePlaceholder', 'Enter a compelling title...')}
                />
              </div>

              {/* Category Toggle */}
              <div className="grid gap-2">
                <Label>{t('dashboard.cms.form.category', 'Category')}</Label>
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
                    {t('dashboard.cms.blogPost', 'Blog Post')}
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
                    {t('dashboard.cms.newsArticle', 'News Article')}
                  </Button>
                </div>
              </div>

              {/* Excerpt */}
              <div className="grid gap-2">
                <Label htmlFor="excerpt">{t('dashboard.cms.form.shortDescription', 'Short Description')}</Label>
                <Textarea
                  id="excerpt"
                  value={newPost.excerpt}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder={t('dashboard.cms.form.excerptPlaceholder', 'A brief summary that appears in previews...')}
                  rows={2}
                />
              </div>

              {/* Content */}
              <div className="grid gap-2">
                <Label htmlFor="content">{t('dashboard.cms.form.content', 'Content')} *</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder={t('dashboard.cms.form.contentPlaceholder', 'Write your full article content here...')}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              {/* Featured Image */}
              <ImageUpload
                value={newPost.imageUrl || ""}
                onChange={(url) =>
                  setNewPost((prev) => ({ ...prev, imageUrl: url }))
                }
                label={t('dashboard.cms.form.featuredImage', 'Featured Image')}
                disabled={saving}
              />

              {/* Tags */}
              <div className="grid gap-2">
                <Label htmlFor="tags">{t('dashboard.cms.form.tags', 'Tags')}</Label>
                <Input
                  id="tags"
                  value={newPost.tags}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder={t('dashboard.cms.form.tagsPlaceholder', 'visa, travel, guide (comma-separated)')}
                />
              </div>

              <Separator />

              {/* Publish Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('dashboard.cms.form.publishImmediately', 'Publish immediately')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.cms.form.publishDescription', 'Make this content visible on the website')}
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
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleSavePost} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingPost ? t('common.saveChanges', 'Save Changes') : t('dashboard.cms.createPost', 'Create Post')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dashboard.cms.deletePost', 'Delete Post')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('dashboard.cms.deleteConfirmation', 'Are you sure you want to delete "{{title}}"? This action cannot be undone.', { title: postToDelete?.title })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('common.delete', 'Delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Application Detail Modal */}
        <ApplicationDetailModal
          application={selectedApplication}
          open={detailModalOpen}
          onOpenChange={(open) => {
            setDetailModalOpen(open);
            if (!open && applicationId) {
              navigate("/admin/applications", { replace: true });
            }
          }}
          onStatusUpdate={(updatedApp) => {
            setApplications((prev) =>
              prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
            );
            setSelectedApplication(updatedApp);
            fetchDashboardData(); // Refresh stats
          }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
