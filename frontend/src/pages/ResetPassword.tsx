import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle2, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const hasValidPasswordFormat = (password: string): boolean =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast.error(
        t("auth.resetPassword.invalidToken", {
          defaultValue: "Reset token is missing or invalid",
        }),
      );
      return;
    }

    if (!hasValidPasswordFormat(newPassword)) {
      toast.error(
        t("auth.validation.passwordRequirements", {
          defaultValue:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        }),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        t("auth.validation.passwordMatch", {
          defaultValue: "Passwords do not match",
        }),
      );
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setCompleted(true);
      toast.success(
        t("auth.resetPassword.success", {
          defaultValue: "Password reset successful. Please sign in.",
        }),
      );
      setTimeout(() => navigate("/login"), 900);
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("auth.resetPassword.failed", {
            defaultValue: "Failed to reset password",
          }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10 md:py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>
              {t("auth.resetPassword.title", { defaultValue: "Set a new password" })}
            </CardTitle>
            <CardDescription>
              {completed
                ? t("auth.resetPassword.doneDescription", {
                    defaultValue: "Your password has been updated.",
                  })
                : t("auth.resetPassword.description", {
                    defaultValue: "Enter your new password below.",
                  })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completed ? (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400 inline-flex items-center gap-2 w-full">
                <CheckCircle2 className="w-4 h-4" />
                {t("auth.resetPassword.redirecting", {
                  defaultValue: "Redirecting to login...",
                })}
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    {t("auth.newPassword", { defaultValue: "New Password" })}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      className="pl-10"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("auth.confirmPassword", {
                      defaultValue: "Confirm Password",
                    })}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting || !token}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("common.saving", { defaultValue: "Saving" })}
                    </>
                  ) : (
                    t("auth.resetPassword.submit", { defaultValue: "Update password" })
                  )}
                </Button>
              </form>
            )}

            <Button variant="ghost" className="w-full" asChild>
              <Link to="/login" className="inline-flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t("auth.backToLogin", { defaultValue: "Back to login" })}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ResetPassword;
