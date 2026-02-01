import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
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
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
      } else {
        setError("Failed to fetch user details");
      }
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
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center pt-20">
        <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Error</h2>
          <p className="text-gray-400">{error || "User not found"}</p>
          <Link
            to="/admin"
            className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-8">
        {/* Back button */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* User Header */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl font-semibold">
                {userData.name?.[0]?.toUpperCase() || userData.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white mb-1">
                  {userData.name || "No name"}
                </h1>
                <p className="text-gray-400">{userData.email}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${
                      userData.role === "ADMIN"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                    }`}
                  >
                    {userData.role}
                  </span>
                  {userData.emailVerified ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      Unverified
                    </span>
                  )}
                  {userData.lockedUntil && new Date(userData.lockedUntil) > new Date() && (
                    <span className="flex items-center gap-1 text-red-400 text-sm">
                      <Lock className="w-4 h-4" />
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                <Unlock className="w-4 h-4" />
                Reset Password
              </button>
              <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Personal Info */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Full Name</p>
                <p className="text-white">{userData.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {userData.email}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {userData.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Country</p>
                <p className="text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  {userData.country || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Account Security
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Two-Factor Auth</p>
                <p className={userData.twoFactorEnabled ? "text-green-400" : "text-gray-400"}>
                  {userData.twoFactorEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Failed Login Attempts</p>
                <p className={userData.failedLogins > 0 ? "text-amber-400" : "text-white"}>
                  {userData.failedLogins}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Account Status</p>
                <p className={userData.lockedUntil && new Date(userData.lockedUntil) > new Date() ? "text-red-400" : "text-green-400"}>
                  {userData.lockedUntil && new Date(userData.lockedUntil) > new Date() ? "Locked" : "Active"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Active Sessions</p>
                <p className="text-white">{userData._count.refreshTokens}</p>
              </div>
            </div>
          </div>

          {/* Activity Info */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Activity
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Member Since</p>
                <p className="text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {new Date(userData.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Last Login</p>
                <p className="text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  {userData.lastLoginAt
                    ? new Date(userData.lastLoginAt).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Last Login IP</p>
                <p className="text-white font-mono text-sm">
                  {userData.lastLoginIp || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Applications</p>
                <p className="text-white">{userData._count.applications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              DS-160 Applications ({userData.applications.length})
            </h3>
          </div>
          {userData.applications.length > 0 ? (
            <div className="divide-y divide-white/5">
              {userData.applications.map((app) => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{app.visaType} Visa Application</p>
                      <p className="text-gray-500 text-sm">
                        Step {app.currentStep} · Created {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No applications yet</p>
            </div>
          )}
        </div>

        {/* Inquiries */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-400" />
              Inquiries ({userData.inquiries.length})
            </h3>
          </div>
          {userData.inquiries.length > 0 ? (
            <div className="divide-y divide-white/5">
              {userData.inquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium capitalize">{inquiry.serviceType}</p>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{inquiry.message}</p>
                      <p className="text-gray-500 text-xs mt-2">
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
              <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No inquiries yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
