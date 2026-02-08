import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, TrendingUp, FileText, User, HelpCircle, ChevronRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "../api/client";
import { useTranslation } from 'react-i18next';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  serviceType: string;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const EnhancedDashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [userInquiries, setUserInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<Stats>({
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
        pending: data.filter((i: Inquiry) => i.status === "PENDING").length,
        approved: data.filter((i: Inquiry) => i.status === "APPROVED").length,
        rejected: data.filter((i: Inquiry) => i.status === "REJECTED").length,
      });
    } catch (err) {
      console.error("Failed to fetch user inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">{t('dashboard.status.approved')}</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">{t('dashboard.status.rejected')}</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">{t('dashboard.status.pending')}</Badge>;
    }
  };

  const getServiceIcon = (serviceType: string) => {
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('dashboard.loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
              {getInitials(user?.name || "User")}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('dashboard.welcomeBack')}, {user?.name}!</h1>
              <p className="text-muted-foreground">{t('dashboard.manageApplications')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button
              onClick={logout}
              variant="destructive"
            >
              {t('nav.logout')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.totalApplications')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                {t('dashboard.allSubmissions')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.pendingReview')}</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('dashboard.awaitingResponse')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.status.approved')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('dashboard.successfullyProcessed')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.successRate')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('dashboard.approvalRate')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('dashboard.recentApplications')}</CardTitle>
                  <CardDescription>{t('dashboard.submittedApplications')}</CardDescription>
                </div>
                {userInquiries.length > 0 && (
                  <Button asChild variant="outline">
                    <Link to="/form">
                      + {t('dashboard.newApplication')}
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {userInquiries.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{t('dashboard.noApplications')}</h3>
                    <p className="text-muted-foreground mb-6">{t('dashboard.startFirst')}</p>
                    <Button asChild>
                      <Link to="/form">
                        {t('dashboard.submitApplication')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('dashboard.service')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('dashboard.status.title')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('dashboard.date')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('dashboard.message')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {userInquiries.map((inquiry) => (
                          <tr key={inquiry.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{getServiceIcon(inquiry.serviceType)}</span>
                                <span className="capitalize">{inquiry.serviceType}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(inquiry.status)}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(inquiry.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              <div className="max-w-xs truncate" title={inquiry.message}>
                                {inquiry.message}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/form" className="flex items-center gap-3">
                    <FileText className="w-5 h-5" />
                    {t('dashboard.newApplication')}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <User className="w-5 h-5 mr-3" />
                  {t('dashboard.profileSettings')}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-5 h-5 mr-3" />
                  {t('dashboard.documents')}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="w-5 h-5 mr-3" />
                  {t('dashboard.support')}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tips */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.proTips.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">{t('dashboard.proTips.completeProfile')}</p>
                    <p className="text-muted-foreground text-sm">{t('dashboard.proTips.fasterProcessing')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">{t('dashboard.proTips.uploadDocuments')}</p>
                    <p className="text-muted-foreground text-sm">{t('dashboard.proTips.upfrontSubmission')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">{t('dashboard.proTips.checkEmail')}</p>
                    <p className="text-muted-foreground text-sm">{t('dashboard.proTips.statusNotifications')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
