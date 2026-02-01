import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
export function LoginForm({ className, ...props }) {
    return (_jsx("div", { className: cn("flex flex-col gap-6", className), ...props, children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Login to your account" }), _jsx(CardDescription, { children: "Enter your email below to login to your account" })] }), _jsx(CardContent, { children: _jsx("form", { children: _jsxs(FieldGroup, { children: [_jsxs(Field, { children: [_jsx(FieldLabel, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "m@example.com", required: true })] }), _jsxs(Field, { children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FieldLabel, { htmlFor: "password", children: "Password" }), _jsx("a", { href: "#", className: "ml-auto inline-block text-sm underline-offset-4 hover:underline", children: "Forgot your password?" })] }), _jsx(Input, { id: "password", type: "password", required: true })] }), _jsxs(Field, { children: [_jsx(Button, { type: "submit", children: "Login" }), _jsx(Button, { variant: "outline", type: "button", children: "Login with Google" }), _jsxs(FieldDescription, { className: "text-center", children: ["Don't have an account? ", _jsx("a", { href: "#", children: "Sign up" })] })] })] }) }) })] }) }));
}
