import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Inbox,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
} from "lucide-react";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface UserApplication {
  id: string;
  visaType: string;
  status: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

interface UserInquiry {
  id: string;
  serviceType: string;
  status: string;
  message: string;
  createdAt: string;
}

type InboxItem = {
  id: string;
  source: "application" | "inquiry";
  status: string;
  title: string;
  subtitle: string;
  createdAt: string;
  updatedAt: string;
  currentStep?: number;
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
    case "APPROVED":
      return "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30";
    case "REJECTED":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
    case "UNDER_REVIEW":
    case "SUBMITTED":
      return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    case "IN_PROGRESS":
    case "DRAFT":
      return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
};

const UserInbox = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "application" | "inquiry">("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, inquiriesRes] = await Promise.allSettled([
        api.get("/api/applications"),
        api.get("/api/inquiries/user"),
      ]);

      if (appsRes.status === "fulfilled") {
        const appData = appsRes.value.data?.data || [];
        setApplications(Array.isArray(appData) ? appData : []);
      } else {
        setApplications([]);
      }

      if (inquiriesRes.status === "fulfilled") {
        const inquiryData = inquiriesRes.value.data?.data || inquiriesRes.value.data || [];
        setInquiries(Array.isArray(inquiryData) ? inquiryData : []);
      } else {
        setInquiries([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const items = useMemo<InboxItem[]>(() => {
    const appItems: InboxItem[] = applications.map((app) => ({
      id: app.id,
      source: "application",
      status: app.status,
      title: `${app.visaType} ${t("userInbox.labels.application", "Application")}`,
      subtitle: `${t("userInbox.labels.step", "Step")} ${app.currentStep || 0}/9`,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt || app.createdAt,
      currentStep: app.currentStep,
    }));

    const inquiryItems: InboxItem[] = inquiries.map((inq) => ({
      id: inq.id,
      source: "inquiry",
      status: inq.status,
      title: `${inq.serviceType} ${t("userInbox.labels.request", "Request")}`,
      subtitle: inq.message || t("userInbox.labels.noMessage", "No message"),
      createdAt: inq.createdAt,
      updatedAt: inq.createdAt,
    }));

    return [...appItems, ...inquiryItems].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [applications, inquiries, t]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter = filter === "all" || item.source === filter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [items, filter, search]);

  const pendingCount = applications.filter((a) =>
    ["DRAFT", "IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW"].includes(a.status),
  ).length;
  const completedCount = applications.filter((a) => a.status === "COMPLETED").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">{t("userInbox.loading", "Loading inbox...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Link to="/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("userInbox.backToProfile", "Back to Profile")}
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-3">
              <Inbox className="w-7 h-7 text-primary" />
              {t("userInbox.title", "Application Inbox")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t(
                "userInbox.subtitle",
                "Track DS-160 progress, appointment updates, and service messages in one place.",
              )}
            </p>
          </div>
          <Button variant="outline" onClick={() => void fetchData()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("userInbox.stats.totalItems", "Total items")}</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("userInbox.stats.pendingApps", "Pending applications")}</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("userInbox.stats.completedApps", "Completed applications")}</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("userInbox.feedTitle", "Status Feed")}</CardTitle>
            <CardDescription>{t("userInbox.feedDesc", "Latest updates from your applications and requests")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  placeholder={t("userInbox.searchPlaceholder", "Search by status, visa type, or message")}
                />
              </div>
              <div className="flex gap-2">
                <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
                  <Filter className="w-4 h-4 mr-2" />
                  {t("common.all", "All")}
                </Button>
                <Button
                  variant={filter === "application" ? "default" : "outline"}
                  onClick={() => setFilter("application")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t("userInbox.filters.applications", "Applications")}
                </Button>
                <Button variant={filter === "inquiry" ? "default" : "outline"} onClick={() => setFilter("inquiry")}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t("userInbox.filters.requests", "Requests")}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredItems.length === 0 && (
                <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
                  {t("userInbox.empty", "No matching updates found.")}
                </div>
              )}

              {filteredItems.map((item) => (
                <div key={`${item.source}-${item.id}`} className="rounded-lg border border-border p-4 bg-card/70">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusVariant(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge variant="secondary">
                          {item.source === "application"
                            ? t("userInbox.source.application", "Application")
                            : t("userInbox.source.request", "Request")}
                        </Badge>
                      </div>
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.source === "application" && typeof item.currentStep === "number" && (
                        <div className="w-40">
                          <div className="h-2 rounded bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${Math.round((item.currentStep / 9) * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("userInbox.labels.step", "Step")} {item.currentStep}/9
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(item.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-2">
              <Button asChild>
                <Link to="/application">
                  <Clock className="w-4 h-4 mr-2" />
                  {t("userInbox.actions.continue", "Continue Application")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/form">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t("userInbox.actions.contactSupport", "Contact Support")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserInbox;
