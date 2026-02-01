import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";
export const Hero = () => {
    return (_jsxs("section", { className: "max-w-6xl mx-auto px-6 py-20 text-center space-y-6", children: [_jsx("div", { className: "flex justify-center", children: _jsx(Plane, { className: "h-10 w-10 text-primary" }) }), _jsx("h1", { className: "text-4xl md:text-5xl font-bold", children: "United States Tourist Visa" }), _jsx("p", { className: "text-lg text-gray-600 max-w-2xl mx-auto", children: "Professional U.S. visa consultation and full application support by Travel Xpressa." }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx(Button, { size: "lg", asChild: true, children: _jsx(Link, { to: "/form", children: "Apply for Visa" }) }), _jsx(Button, { size: "lg", variant: "outline", children: "Free Consultation" })] })] }));
};
