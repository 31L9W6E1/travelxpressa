import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/client";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Shield,
  Clock,
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  Trash2
} from "lucide-react";

interface UserDetailData {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  country: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  failedLogins: number;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string;
  applications: Array<{
    id: string;
    visaType: string;
    status: string;
    currentStep: number;
    createdAt: string;
    updatedAt: string;
  }>;
  inquiries: Array<{
    id: string;
    serviceType: string;
    status: string;
    message: string;
    createdAt: string;
  }>;
  _count: {
    applications: number;
    inquiries: number;
    refreshTokens: number;
  };
}

const UserDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "ADMIN" && id) {
      fetchUserDetail();
    }
  }, [user, id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/admin/users/${id}`);
      setUserData(response.data.data);
    } catch (err) {
      setError("Error loading user details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
      case "SUBMITTED":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "REJECTED":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "PENDING":
      case "DRAFT":
      case "IN_PROGRESS":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t("userDetail.loading", "Loading user details...")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <div className="text-center bg-card border border-border rounded-2xl p-12">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {t("common.error", "Error")}
          </h2>
          <p className="text-muted-foreground">
            {error || t("userDetail.notFound", "User not found")}
          </p>
          <Link
            to="/admin/users"
            className="mt-6 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            {t("userDetail.backToDashboard", "Back to Dashboard")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back button */}
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("userDetail.backToDashboard", "Back to Dashboard")}
        </Link>

        {/* User Header */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-3xl font-semibold">
                {userData.name?.[0]?.toUpperCase() || userData.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-1">
                  {userData.name || "No name"}
                </h1>
                <p className="text-muted-foreground">{userData.email}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${
                      userData.role === "ADMIN"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-secondary text-secondary-foreground border-border"
                    }`}
                  >
                    {userData.role}
                  </span>
                  {userData.emailVerified ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      {t('userDetail.verified', 'Verified')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      {t('userDetail.unverified', 'Unverified')}
                    </span>
                  )}
                  {userData.lockedUntil && new Date(userData.lockedUntil) > new Date() && (
                    <span className="flex items-center gap-1 text-destructive text-sm">
                      <Lock className="w-4 h-4" />
                      {t('userDetail.locked', 'Locked')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-secondary border border-border text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2">
                <Unlock className="w-4 h-4" />
                {t('userDetail.resetPassword', 'Reset Password')}
              </button>
              <button className="px-4 py-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg hover:bg-destructive/20 transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                {t('common.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Personal Info */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              {t('userDetail.personalInfo', 'Personal Information')}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.fullName', 'Full Name')}</p>
                <p className="text-foreground">{userData.name || t('userDetail.notProvided', 'Not provided')}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.email', 'Email')}</p>
                <p className="text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {userData.email}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.phone', 'Phone')}</p>
                <p className="text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {userData.phone || t('userDetail.notProvided', 'Not provided')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.country', 'Country')}</p>
                <p className="text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  {userData.country || t('userDetail.notProvided', 'Not provided')}
                </p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              {t('userDetail.accountSecurity', 'Account Security')}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.twoFactorAuth', 'Two-Factor Auth')}</p>
                <p className={userData.twoFactorEnabled ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                  {userData.twoFactorEnabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.failedLoginAttempts', 'Failed Login Attempts')}</p>
                <p className={userData.failedLogins > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}>
                  {userData.failedLogins}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.accountStatus', 'Account Status')}</p>
                <p className={userData.lockedUntil && new Date(userData.lockedUntil) > new Date() ? "text-destructive" : "text-green-600 dark:text-green-400"}>
                  {userData.lockedUntil && new Date(userData.lockedUntil) > new Date() ? t('userDetail.locked', 'Locked') : t('userDetail.active', 'Active')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.activeSessions', 'Active Sessions')}</p>
                <p className="text-foreground">{userData._count.refreshTokens}</p>
              </div>
            </div>
          </div>

          {/* Activity Info */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              {t('userDetail.activity', 'Activity')}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.memberSince', 'Member Since')}</p>
                <p className="text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {new Date(userData.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.lastLogin', 'Last Login')}</p>
                <p className="text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {userData.lastLoginAt
                    ? new Date(userData.lastLoginAt).toLocaleString()
                    : t('userDetail.never', 'Never')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.lastLoginIp', 'Last Login IP')}</p>
                <p className="text-foreground font-mono text-sm">
                  {userData.lastLoginIp || t('userDetail.unknown', 'Unknown')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{t('userDetail.totalApplications', 'Total Applications')}</p>
                <p className="text-foreground">{userData._count.applications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              {t('userDetail.ds160Applications', 'DS-160 Applications')} ({userData.applications.length})
            </h3>
          </div>
          {userData.applications.length > 0 ? (
            <div className="divide-y divide-border">
              {userData.applications.map((app) => (
                <Link
                  key={app.id}
                  to={`/admin/applications/${app.id}`}
                  className="p-4 flex items-center justify-between hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary rounded-lg">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">
                        {app.visaType} {t('userDetail.visaApplication', 'Visa Application')}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {t('userDetail.step', 'Step')} {app.currentStep} · {t('userDetail.created', 'Created')} {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t('userDetail.noApplications', 'No applications yet')}</p>
            </div>
          )}
        </div>

        {/* Inquiries */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-muted-foreground" />
              {t('userDetail.inquiries', 'Inquiries')} ({userData.inquiries.length})
            </h3>
          </div>
          {userData.inquiries.length > 0 ? (
            <div className="divide-y divide-border">
              {userData.inquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-4 hover:bg-secondary transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-foreground font-medium capitalize">{inquiry.serviceType}</p>
                      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{inquiry.message}</p>
                      <p className="text-muted-foreground text-xs mt-2">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t('userDetail.noInquiries', 'No inquiries yet')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
