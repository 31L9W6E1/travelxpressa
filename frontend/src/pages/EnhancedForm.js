import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";
const EnhancedForm = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        message: "",
        serviceType: "visa",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [charCount, setCharCount] = useState(0);
    const serviceTypes = [
        {
            value: "visa",
            label: "Visa Application",
            icon: "🛂",
            description: "Tourist, business, or student visas",
            pricing: "From $299",
            features: ["Expert consultation", "Document preparation", "Fast processing"]
        },
        {
            value: "tourism",
            label: "Tourism Package",
            icon: "✈️",
            description: "Custom travel packages and tours",
            pricing: "From $599",
            features: ["Flight booking", "Hotel accommodation", "Tour guide", "Travel insurance"]
        },
        {
            value: "consultation",
            label: "Consultation",
            icon: "💼",
            description: "Expert travel advice and planning",
            pricing: "From $99",
            features: ["Personalized planning", "Budget optimization", "24/7 support", "Itinerary creation"]
        }
    ];
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === "message") {
            setCharCount(value.length);
        }
        // Clear error when user starts typing
        if (submitStatus === "error") {
            setSubmitStatus("idle");
            setErrorMessage("");
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone || !formData.message) {
            setSubmitStatus("error");
            setErrorMessage("Please fill in all required fields");
            return;
        }
        if (!formData.email.includes("@")) {
            setSubmitStatus("error");
            setErrorMessage("Please enter a valid email address");
            return;
        }
        setIsSubmitting(true);
        setSubmitStatus("idle");
        setErrorMessage("");
        try {
            const response = await fetch("http://localhost:3000/api/inquiry", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setSubmitStatus("success");
                // Reset form but keep user data
                setFormData({
                    name: user?.name || "",
                    email: user?.email || "",
                    phone: "",
                    message: "",
                    serviceType: "visa",
                });
                setCharCount(0);
            }
            else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to submit application");
            }
        }
        catch (error) {
            setSubmitStatus("error");
            setErrorMessage(error.message);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen", children: [_jsxs("div", { className: "fixed inset-0 pointer-events-none", children: [_jsx("div", { className: "absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-10" }), _jsx("div", { className: "absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10" })] }), _jsx("div", { className: "relative flex items-center justify-center min-h-screen px-4 py-8", children: _jsxs("div", { className: "w-full max-w-4xl", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold text-gradient-primary mb-4", children: "Travel Application" }), _jsx("p", { className: "text-lg text-secondary mb-8 max-w-2xl mx-auto", children: "Complete the form below to begin your journey with confidence and ease" })] }), _jsxs("div", { className: "mb-12", children: [_jsx("h2", { className: "text-xl font-semibold text-primary mb-6", children: "Select Service Type" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: serviceTypes.map((service) => (_jsxs("label", { className: `
                    prettify-card cursor-pointer
                    ${formData.serviceType === service.value
                                            ? 'border-gradient'
                                            : 'hover:border-gradient'}
                  `, children: [_jsx("input", { type: "radio", name: "serviceType", value: service.value, checked: formData.serviceType === service.value, onChange: () => setFormData(prev => ({ ...prev, serviceType: service.value })), className: "sr-only" }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl mb-4", children: service.icon }), _jsx("div", { className: "font-semibold text-primary text-lg mb-2", children: service.label }), _jsx("div", { className: "text-secondary text-sm mb-4", children: service.description }), _jsx("div", { className: "text-accent-cyan font-semibold", children: service.pricing }), _jsx("div", { className: "mt-4 space-y-1", children: service.features.map((feature, index) => (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-secondary", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("span", { children: feature })] }, index))) })] })] }, service.value))) })] }), _jsxs("div", { className: "prettify-card mb-8", children: [_jsxs("div", { className: "prettify-header", children: [_jsxs("div", { className: "prettify-deck", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" }), _jsx("div", { className: "w-3 h-3 bg-purple-500 rounded-full animate-pulse" }), _jsx("div", { className: "w-3 h-3 bg-purple-500 rounded-full" })] }), _jsx("h2", { className: "prettify-title", children: "Application Details" }), _jsx("p", { className: "prettify-subtitle", children: "Please provide accurate information" })] }), submitStatus === "success" && (_jsxs("div", { className: "mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-green-900 dark:text-green-100", children: "Application Submitted!" }), _jsx("p", { className: "text-green-700 dark:text-green-300", children: "Your application has been successfully submitted. We'll contact you within 24 hours." })] })] })), submitStatus === "error" && (_jsxs("div", { className: "mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-red-900 dark:text-red-100", children: "Submission Failed" }), _jsx("p", { className: "text-red-700 dark:text-red-300", children: errorMessage })] })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-primary mb-2", children: "Full Name *" }), _jsx("input", { type: "text", name: "name", value: formData.name, onChange: handleInputChange, disabled: !!user?.name, className: "prettify-input", placeholder: "Enter your full name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-primary mb-2", children: "Email Address *" }), _jsx("input", { type: "email", name: "email", value: formData.email, onChange: handleInputChange, disabled: !!user?.email, className: "prettify-input", placeholder: "your.email@example.com" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-primary mb-2", children: "Phone Number *" }), _jsx("input", { type: "tel", name: "phone", value: formData.phone, onChange: handleInputChange, className: "prettify-input", placeholder: "+1 (555) 123-4567" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-primary mb-2", children: ["Message / Additional Details *", _jsxs("span", { className: "text-muted ml-2", children: ["(", charCount, "/500)"] })] }), _jsx("textarea", { name: "message", value: formData.message, onChange: handleInputChange, rows: 6, className: "prettify-input resize-none", placeholder: "Please describe your requirements, travel dates, destination, and any specific needs..." })] }), _jsx("div", { className: "flex items-center justify-center pt-4", children: _jsx("button", { type: "submit", disabled: isSubmitting || submitStatus === "success", className: `
                    prettify-button primary
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                    ${submitStatus === "success" ? 'bg-green-600 border-green-600 hover:bg-green-700' : ''}
                  `, children: isSubmitting ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-4 h-4 bg-white rounded-full animate-spin" }), _jsx("span", { children: "Processing..." })] })) : submitStatus === "success" ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }), _jsx("span", { children: "Application Submitted" })] })) : ("Submit Application") }) })] })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "prettify-kpi", children: [_jsxs("div", { className: "stat-item", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("span", { className: "stat-value", children: "Need Help?" })] }), _jsxs("div", { className: "stat-item", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8.228 9c.549-1.165 2.03-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("span", { className: "stat-value", children: "Contact Support" })] }), _jsxs("div", { className: "stat-item", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }), _jsx("span", { className: "stat-value", children: "Documents" })] })] }), _jsxs(Link, { to: "/dashboard", className: "prettify-button cyan mt-6", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m4 11h6m-6 0h6" }) }), "View Dashboard"] })] })] }) })] }));
};
export default EnhancedForm;
