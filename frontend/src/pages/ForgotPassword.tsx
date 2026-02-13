import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error(
        t("auth.validation.emailRequired", {
          defaultValue: "Email is required",
        }),
      );
      return;
    }

    setSubmitting(true);
    try {
      await authApi.forgotPassword(normalizedEmail);
      setSubmitted(true);
      toast.success(
        t("auth.toasts.passwordResetRequested", {
          defaultValue: "If the account exists, a reset link has been sent.",
        }),
      );
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("auth.toasts.passwordResetRequestFailed", {
            defaultValue: "Failed to request password reset",
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
              {t("auth.forgotPassword.title", {
                defaultValue: "Reset your password",
              })}
            </CardTitle>
            <CardDescription>
              {submitted
                ? t("auth.forgotPassword.sentDescription", {
                    defaultValue:
                      "If an account exists, check your email for the reset link.",
                  })
                : t("auth.forgotPassword.description", {
                    defaultValue:
                      "Enter your email and we will send you a password reset link.",
                  })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!submitted && (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("auth.emailAddress", { defaultValue: "Email Address" })}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="pl-10"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t("auth.enterEmail", {
                        defaultValue: "Enter your email",
                      })}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("common.sending", { defaultValue: "Sending" })}
                    </>
                  ) : (
                    t("auth.forgotPassword.submit", { defaultValue: "Send reset link" })
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

export default ForgotPassword;
