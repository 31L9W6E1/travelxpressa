import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DollarSign, FileText, UserCheck } from "lucide-react";
const items = [
    {
        icon: FileText,
        title: "Full Visa Support",
        text: "DS-160 form, interview booking, and document preparation.",
    },
    {
        icon: DollarSign,
        title: "Transparent Pricing",
        text: "Service fee 500,000 MNT (VAT included).",
    },
    {
        icon: UserCheck,
        title: "Interview Preparation",
        text: "Personal guidance for U.S. Embassy interview.",
    },
];
export const ServiceHighlights = () => {
    return (_jsx("section", { className: "max-w-6xl mx-auto px-6 py-16 grid gap-8 md:grid-cols-3", children: items.map(({ icon: Icon, title, text }) => (_jsxs("div", { className: "border rounded-lg p-6 text-center space-y-3 hover:shadow-md transition", children: [_jsx(Icon, { className: "mx-auto h-8 w-8 text-primary" }), _jsx("h3", { className: "font-semibold text-lg", children: title }), _jsx("p", { className: "text-sm text-gray-600", children: text })] }, title))) }));
};
