import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Shield, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserSecuritySettings = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t("userSecurity.errors.required", "All password fields are required"));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("userSecurity.errors.minLength", "New password must be at least 8 characters"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("userSecurity.errors.mismatch", "New passwords do not match"));
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success(t("userSecurity.success.changed", "Password changed successfully. Please sign in again."));
      await logout();
      navigate("/login");
    } catch (error: any) {
      toast.error(error?.message || t("userSecurity.errors.failed", "Failed to change password"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <Link to="/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("userSecurity.backToProfile", "Back to Profile")}
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t("userSecurity.title", "Security Settings")}
            </CardTitle>
            <CardDescription>
              {t(
                "userSecurity.subtitle",
                "Update your account password. For security, you will be signed out after changing it.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <p className="text-sm text-muted-foreground">
                {t("userSecurity.account", "Signed in as")}: <span className="text-foreground font-medium">{user?.email}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("userSecurity.currentPassword", "Current Password")}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("userSecurity.newPassword", "New Password")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("userSecurity.confirmPassword", "Confirm New Password")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <Button onClick={handleChangePassword} disabled={submitting} className="w-full">
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4 mr-2" />
              )}
              {t("userSecurity.changePassword", "Change Password")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserSecuritySettings;
