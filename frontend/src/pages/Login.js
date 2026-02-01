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
const Login = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
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
            const loggedInUser = await login(values.email, values.password);
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
            await register(values.email, values.password, values.name);
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
    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError("");
        loginForm.reset();
        registerForm.reset();
    };
    return (_jsx("main", { className: "min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12 theme-transition", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center space-x-2 mb-6", children: [_jsx(Plane, { className: "w-10 h-10 text-foreground" }), _jsx("span", { className: "text-2xl font-bold text-foreground", children: "TravelXpressa" })] }), _jsx("h2", { className: "text-3xl font-bold text-foreground", children: isLogin ? "Welcome back" : "Create your account" }), _jsx("p", { className: "mt-2 text-muted-foreground", children: isLogin
                                ? "Sign in to continue your visa application"
                                : "Start your visa application journey today" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "sr-only", children: [_jsx(CardTitle, { children: isLogin ? "Sign In" : "Sign Up" }), _jsx(CardDescription, { children: isLogin ? "Enter your credentials to sign in" : "Create a new account" })] }), _jsxs(CardContent, { className: "pt-6", children: [error && (_jsx(Alert, { variant: "destructive", className: "mb-6", children: _jsx(AlertDescription, { children: error }) })), isLogin ? (_jsx(Form, { ...loginForm, children: _jsxs("form", { onSubmit: loginForm.handleSubmit(handleLoginSubmit), className: "space-y-5", children: [_jsx(FormField, { control: loginForm.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email address" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { type: "email", placeholder: "Enter your email", className: "pl-10", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: loginForm.control, name: "password", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Password" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { type: "password", placeholder: "Enter your password", className: "pl-10", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin mr-2" }), "Signing in..."] })) : (_jsxs(_Fragment, { children: ["Sign in", _jsx(ArrowRight, { className: "w-5 h-5 ml-2" })] })) })] }) })) : (_jsx(Form, { ...registerForm, children: _jsxs("form", { onSubmit: registerForm.handleSubmit(handleRegisterSubmit), className: "space-y-5", children: [_jsx(FormField, { control: registerForm.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Full Name" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { type: "text", placeholder: "Enter your name", className: "pl-10", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: registerForm.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email address" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { type: "email", placeholder: "Enter your email", className: "pl-10", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: registerForm.control, name: "password", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Password" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { type: "password", placeholder: "Min 8 chars, uppercase, lowercase, number, special", className: "pl-10", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin mr-2" }), "Creating account..."] })) : (_jsxs(_Fragment, { children: ["Create account", _jsx(ArrowRight, { className: "w-5 h-5 ml-2" })] })) })] }) })), _jsx("div", { className: "mt-6 text-center", children: _jsx(Button, { variant: "link", type: "button", onClick: toggleForm, className: "text-muted-foreground hover:text-foreground", children: isLogin
                                            ? "Don't have an account? Sign up"
                                            : "Already have an account? Sign in" }) })] })] }), _jsxs("p", { className: "text-center text-muted-foreground text-sm", children: ["By signing in, you agree to our", " ", _jsx(Link, { to: "/terms", className: "hover:text-foreground transition-colors underline underline-offset-4", children: "Terms of Service" }), " ", "and", " ", _jsx(Link, { to: "/privacy", className: "hover:text-foreground transition-colors underline underline-offset-4", children: "Privacy Policy" })] })] }) }));
};
export default Login;
