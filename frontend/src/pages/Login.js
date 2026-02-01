import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plane, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
// Login form schema
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});
// Register form schema - must match backend requirements
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});
// Google icon SVG component
const GoogleIcon = () => (_jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }));
// Facebook icon SVG component
const FacebookIcon = () => (_jsx("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "#1877F2", children: _jsx("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" }) }));
const Login = () => {
    // Rename to avoid conflict with react-hook-form's register
    const { login: authLogin, register: authRegister } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState(null);
    const [error, setError] = useState("");
    // Login form
    const loginForm = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    // Register form
    const registerForm = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });
    const handleLoginSubmit = async (values) => {
        setIsLoading(true);
        setError("");
        try {
            const loggedInUser = await authLogin(values.email, values.password);
            toast.success("Welcome back!", {
                description: "You have been signed in successfully.",
            });
            // Admin users go directly to admin dashboard
            if (loggedInUser?.role === 'ADMIN') {
                navigate("/admin");
                return;
            }
            // Regular users check if they have already selected a country
            const selectedCountry = localStorage.getItem('selectedCountry');
            navigate(selectedCountry ? "/ready" : "/select-country");
        }
        catch (err) {
            setError(err.message);
            toast.error("Sign in failed", {
                description: err.message,
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRegisterSubmit = async (values) => {
        setIsLoading(true);
        setError("");
        try {
            await authRegister(values.email, values.password, values.name);
            toast.success("Account created!", {
                description: "Welcome to TravelXpressa.",
            });
            // New users always go to country selection
            navigate("/select-country");
        }
        catch (err) {
            setError(err.message);
            toast.error("Registration failed", {
                description: err.message,
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleGoogleLogin = async () => {
        setIsSocialLoading("google");
        setError("");
        try {
            // In production, this would redirect to your backend OAuth endpoint
            // For now, we'll show a message that this feature is coming soon
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            window.location.href = `${backendUrl}/api/auth/google`;
        }
        catch (err) {
            setError("Google login is not available yet");
            toast.error("Google login unavailable", {
                description: "This feature is coming soon.",
            });
            setIsSocialLoading(null);
        }
    };
    const handleFacebookLogin = async () => {
        setIsSocialLoading("facebook");
        setError("");
        try {
            // In production, this would redirect to your backend OAuth endpoint
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            window.location.href = `${backendUrl}/api/auth/facebook`;
        }
        catch (err) {
            setError("Facebook login is not available yet");
            toast.error("Facebook login unavailable", {
                description: "This feature is coming soon.",
            });
            setIsSocialLoading(null);
        }
    };
    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError("");
        loginForm.reset();
        registerForm.reset();
    };
    return (_jsx("main", { className: "min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12 theme-transition", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center space-x-2 mb-6", children: [_jsx(Plane, { className: "w-10 h-10 text-foreground" }), _jsx("span", { className: "text-2xl font-bold text-foreground", children: "TravelXpressa" })] }), _jsx("h2", { className: "text-3xl font-bold text-foreground", children: isLogin ? "Welcome back" : "Create your account" }), _jsx("p", { className: "mt-2 text-muted-foreground", children: isLogin
                                ? "Sign in to continue your visa application"
                                : "Start your visa application journey today" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "sr-only", children: [_jsx(CardTitle, { children: isLogin ? "Sign In" : "Sign Up" }), _jsx(CardDescription, { children: isLogin ? "Enter your credentials to sign in" : "Create a new account" })] }), _jsxs(CardContent, { className: "pt-6", children: [error && (_jsx(Alert, { variant: "destructive", className: "mb-6", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { type: "button", variant: "outline", className: "w-full", onClick: handleGoogleLogin, disabled: isSocialLoading !== null, children: [isSocialLoading === "google" ? (_jsx(Loader2, { className: "w-5 h-5 animate-spin mr-2" })) : (_jsx(GoogleIcon, {})), _jsx("span", { className: "ml-2", children: "Continue with Google" })] }), _jsxs(Button, { type: "button", variant: "outline", className: "w-full", onClick: handleFacebookLogin, disabled: isSocialLoading !== null, children: [isSocialLoading === "facebook" ? (_jsx(Loader2, { className: "w-5 h-5 animate-spin mr-2" })) : (_jsx(FacebookIcon, {})), _jsx("span", { className: "ml-2", children: "Continue with Facebook" })] })] }), _jsxs("div", { className: "relative my-6", children: [_jsx(Separator, {}), _jsx("span", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground", children: "or continue with email" })] }), isLogin ? (_jsx(Form, { ...loginForm, children: _jsxs("form", { onSubmit: loginForm.handleSubmit(handleLoginSubmit), className: "space-y-5", children: [_jsx(FormField, { control: loginForm.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email address" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { type: "email", placeholder: "Enter your email", className: "pl-10", autoComplete: "email", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: loginForm.control, name: "password", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Password" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { type: "password", placeholder: "Enter your password", className: "pl-10", autoComplete: "current-password", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin mr-2" }), "Signing in..."] })) : (_jsxs(_Fragment, { children: ["Sign in", _jsx(ArrowRight, { className: "w-5 h-5 ml-2" })] })) })] }) })) : (_jsx(Form, { ...registerForm, children: _jsxs("form", { onSubmit: registerForm.handleSubmit(handleRegisterSubmit), className: "space-y-5", children: [_jsx(FormField, { control: registerForm.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Full Name" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { type: "text", placeholder: "Enter your name", className: "pl-10", autoComplete: "name", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: registerForm.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email address" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { type: "email", placeholder: "Enter your email", className: "pl-10", autoComplete: "email", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: registerForm.control, name: "password", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Password" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { type: "password", placeholder: "Min 8 chars, uppercase, lowercase, number, special", className: "pl-10", autoComplete: "new-password", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin mr-2" }), "Creating account..."] })) : (_jsxs(_Fragment, { children: ["Create account", _jsx(ArrowRight, { className: "w-5 h-5 ml-2" })] })) })] }) })), _jsx("div", { className: "mt-6 text-center", children: _jsx(Button, { variant: "link", type: "button", onClick: toggleForm, className: "text-muted-foreground hover:text-foreground", children: isLogin
                                            ? "Don't have an account? Sign up"
                                            : "Already have an account? Sign in" }) })] })] }), _jsxs("p", { className: "text-center text-muted-foreground text-sm", children: ["By signing in, you agree to our", " ", _jsx(Link, { to: "/terms", className: "hover:text-foreground transition-colors underline underline-offset-4", children: "Terms of Service" }), " ", "and", " ", _jsx(Link, { to: "/privacy", className: "hover:text-foreground transition-colors underline underline-offset-4", children: "Privacy Policy" })] })] }) }));
};
export default Login;
