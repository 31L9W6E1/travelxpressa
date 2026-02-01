import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShieldCheck, Globe, ThumbsUp } from "lucide-react";
export const WhyChooseUs = () => {
    return (_jsx("section", { className: "bg-gray-50 py-20", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6 space-y-10", children: [_jsx("h2", { className: "text-3xl font-bold text-center", children: "Why Choose Travel Xpressa" }), _jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [_jsx(Feature, { icon: ShieldCheck, title: "Trusted Agency" }), _jsx(Feature, { icon: Globe, title: "Global Experience" }), _jsx(Feature, { icon: ThumbsUp, title: "High Approval Guidance" })] })] }) }));
};
const Feature = ({ icon: Icon, title }) => (_jsxs("div", { className: "bg-white border rounded-lg p-6 text-center", children: [_jsx(Icon, { className: "mx-auto h-8 w-8 text-primary mb-3" }), _jsx("h4", { className: "font-semibold", children: title })] }));
