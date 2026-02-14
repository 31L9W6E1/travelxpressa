import { useAuth } from "../contexts/AuthContext";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getApiBaseUrl } from "@/api/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type LoginFormValues = {
  email: string;
  password: string;
};

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

// Google icon SVG component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Facebook icon SVG component
const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const Login = () => {
  const { t, i18n } = useTranslation();
  // Rename to avoid conflict with react-hook-form's register
  const { login: authLogin, register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Build schemas inside the component so validation messages follow the selected language.
  const loginSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .email(
            t("auth.validation.emailInvalid", {
              defaultValue: "Please enter a valid email address",
            }),
          ),
        password: z
          .string()
          .min(
            1,
            t("auth.validation.passwordRequired", {
              defaultValue: "Password is required",
            }),
          ),
      }),
    [i18n.language, t],
  );

  // Register form schema must match backend requirements.
  const registerSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(
            2,
            t("auth.validation.nameMin", {
              defaultValue: "Name must be at least 2 characters",
              min: 2,
            }),
          ),
        email: z
          .string()
          .email(
            t("auth.validation.emailInvalid", {
              defaultValue: "Please enter a valid email address",
            }),
          ),
        password: z
          .string()
          .min(
            8,
            t("auth.validation.passwordMin", {
              defaultValue: "Password must be at least 8 characters",
              min: 8,
            }),
          )
          .regex(
            /[A-Z]/,
            t("auth.validation.passwordUppercase", {
              defaultValue:
                "Password must contain at least one uppercase letter",
            }),
          )
          .regex(
            /[a-z]/,
            t("auth.validation.passwordLowercase", {
              defaultValue:
                "Password must contain at least one lowercase letter",
            }),
          )
          .regex(
            /[0-9]/,
            t("auth.validation.passwordNumber", {
              defaultValue: "Password must contain at least one number",
            }),
          )
          .regex(
            /[^A-Za-z0-9]/,
            t("auth.validation.passwordSpecial", {
              defaultValue:
                "Password must contain at least one special character",
            }),
          ),
      }),
    [i18n.language, t],
  );

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      const loggedInUser = await authLogin(values.email, values.password);

      toast.success(
        t("auth.toasts.signInSuccess.title", {
          defaultValue: "Welcome back!",
        }),
        {
          description: t("auth.toasts.signInSuccess.description", {
            defaultValue: "You have been signed in successfully.",
          }),
        },
      );

      // Admin users go directly to admin dashboard
      if (loggedInUser?.role === 'ADMIN') {
        navigate("/admin");
        return;
      }

      // Regular users check if they have already selected a country
      const selectedCountry = localStorage.getItem('selectedCountry');
      navigate(selectedCountry ? "/ready" : "/select-country");
    } catch (err: any) {
      setError(err.message);
      toast.error(
        t("auth.toasts.signInFailed.title", {
          defaultValue: "Sign in failed",
        }),
        {
          description:
            err?.message ||
            t("auth.toasts.signInFailed.description", {
              defaultValue: "Please check your details and try again.",
            }),
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      await authRegister(values.email, values.password, values.name);
      toast.success(
        t("auth.toasts.registerSuccess.title", {
          defaultValue: "Account created!",
        }),
        {
          description: t("auth.toasts.registerSuccess.description", {
            defaultValue: "Welcome to visamn.",
          }),
        },
      );
      // New users always go to country selection
      navigate("/select-country");
    } catch (err: any) {
      setError(err.message);
      toast.error(
        t("auth.toasts.registerFailed.title", {
          defaultValue: "Registration failed",
        }),
        {
          description:
            err?.message ||
            t("auth.toasts.registerFailed.description", {
              defaultValue: "Please try again.",
            }),
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSocialLoading("google");
    setError("");

    try {
      const backendUrl = getApiBaseUrl();
      window.location.href = `${backendUrl}/api/auth/google`;
    } catch (err: any) {
      setError(
        t("auth.errors.googleUnavailable", {
          defaultValue: "Google login is not available yet",
        }),
      );
      toast.error(
        t("auth.toasts.googleUnavailable.title", {
          defaultValue: "Google login unavailable",
        }),
        {
          description: t("auth.toasts.googleUnavailable.description", {
            defaultValue: "This feature is coming soon.",
          }),
        },
      );
      setIsSocialLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setIsSocialLoading("facebook");
    setError("");

    try {
      const backendUrl = getApiBaseUrl();
      window.location.href = `${backendUrl}/api/auth/facebook`;
    } catch (err: any) {
      setError(
        t("auth.errors.facebookUnavailable", {
          defaultValue: "Facebook login is not available yet",
        }),
      );
      toast.error(
        t("auth.toasts.facebookUnavailable.title", {
          defaultValue: "Facebook login unavailable",
        }),
        {
          description: t("auth.toasts.facebookUnavailable.description", {
            defaultValue: "This feature is coming soon.",
          }),
        },
      );
      setIsSocialLoading(null);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10 md:py-12 theme-transition">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center mb-6">
            <img
              src="/branding/logo-visamn-com.png"
              alt="visamn.com"
              className="h-10 w-auto object-contain"
              loading="eager"
            />
          </Link>
          <h2 className="text-3xl font-bold text-foreground">
            {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isLogin
              ? t('auth.signInContinue')
              : t('auth.startJourney')}
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader className="sr-only">
            <CardTitle>{isLogin ? t("auth.signIn") : t("auth.signUp")}</CardTitle>
            <CardDescription>
              {isLogin
                ? t("auth.sr.signInDescription", {
                    defaultValue: "Enter your credentials to sign in",
                  })
                : t("auth.sr.signUpDescription", {
                    defaultValue: "Create a new account",
                  })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isSocialLoading !== null}
              >
                {isSocialLoading === "google" ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <GoogleIcon />
                )}
                <span className="ml-2">{t('auth.continueWithGoogle')}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleFacebookLogin}
                disabled={isSocialLoading !== null}
              >
                {isSocialLoading === "facebook" ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <FacebookIcon />
                )}
                <span className="ml-2">{t('auth.continueWithFacebook')}</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                {t('auth.orContinueWithEmail')}
              </span>
            </div>

            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-5">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.emailAddress')}</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t('auth.enterEmail')}
                              className="pl-10"
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <Link
                            to="/forgot-password"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {t("auth.forgotPassword.link", {
                              defaultValue: "Forgot password?",
                            })}
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t('auth.enterPassword')}
                              className="pl-10"
                              autoComplete="current-password"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {t('auth.signingIn')}
                      </>
                    ) : (
                      <>
                        {t('auth.signIn')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-5">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.fullName')}</FormLabel>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                          <FormControl>
                            <Input
                              type="text"
                              placeholder={t('auth.enterName')}
                              className="pl-10"
                              autoComplete="name"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.emailAddress')}</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t('auth.enterEmail')}
                              className="pl-10"
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.password')}</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t('auth.passwordRequirements')}
                              className="pl-10"
                              autoComplete="new-password"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {t('auth.creatingAccount')}
                      </>
                    ) : (
                      <>
                        {t('auth.createAccountBtn')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="link"
                type="button"
                onClick={toggleForm}
                className="text-muted-foreground hover:text-foreground"
              >
                {isLogin
                  ? t('auth.noAccount')
                  : t('auth.haveAccount')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm">
          {t('auth.agreementPrefix')}{" "}
          <Link to="/terms" className="hover:text-foreground transition-colors underline underline-offset-4">
            {t('auth.termsOfService')}
          </Link>{" "}
          {t('auth.and')}{" "}
          <Link to="/privacy" className="hover:text-foreground transition-colors underline underline-offset-4">
            {t('auth.privacyPolicy')}
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
