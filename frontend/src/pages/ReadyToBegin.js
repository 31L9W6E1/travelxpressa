import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { findCountryByCode } from "../config/countries";
import { useState, useEffect } from "react";
import { ArrowRight, User, Phone, FileText, Plane, MapPin, Users, Briefcase, GraduationCap, Shield, Camera, CheckCircle, AlertTriangle, Sparkles, Globe, Clock, DollarSign } from "lucide-react";
const ReadyToBegin = () => {
    const { user } = useAuth();
    const [selectedCountry, setSelectedCountry] = useState(null);
    useEffect(() => {
        const countryCode = localStorage.getItem('selectedCountry');
        if (countryCode) {
            const config = findCountryByCode(countryCode);
            if (config) {
                setSelectedCountry(config);
            }
        }
    }, []);
    // If no country selected, redirect to country selection
    if (!localStorage.getItem('selectedCountry')) {
        return _jsx(Navigate, { to: "/select-country" });
    }
    // Icon mapping for sections
    const sectionIcons = {
        "Personal Details": User,
        "Personal Particulars": User,
        "Identity Details": User,
        "Contact Information": Phone,
        "Address & Contact": Phone,
        "Contact Details": Phone,
        "Passport Information": FileText,
        "Passport Details": FileText,
        "Passport & Travel Document": FileText,
        "Travel Information": Plane,
        "Travel Details": Plane,
        "Travel Itinerary": Plane,
        "Travel Plans": Plane,
        "Travel History": MapPin,
        "Previous Japan Visits": MapPin,
        "Previous Immigration History": MapPin,
        "Immigration History": MapPin,
        "U.S. Point of Contact": MapPin,
        "Accommodation Details": MapPin,
        "Accommodation in Ireland": MapPin,
        "Accommodation & Travel Plans": MapPin,
        "Family Information": Users,
        "Family Details": Users,
        "Guarantor/Inviter Details": Users,
        "Sponsor/Reference Details": Users,
        "Work/Education/Training": Briefcase,
        "Employment Information": Briefcase,
        "Employment Details": Briefcase,
        "Employment/Education History": Briefcase,
        "Employment & Income": Briefcase,
        "Employment History": Briefcase,
        "Education Background": GraduationCap,
        "Education History": GraduationCap,
        "Security and Background": Shield,
        "Background Information": Shield,
        "Medical & Character": Shield,
        "Character & Health": Shield,
        "Character Requirements": Shield,
        "Health Requirements": Shield,
        "SEVIS Information": GraduationCap,
        "Biometrics": Camera,
        "Photo Requirements": Camera,
        "Financial Information": DollarSign,
        "Financial Capacity": DollarSign,
        "Funds & Sponsorship": DollarSign,
        "Purpose of Visit": Plane,
        "Ties to Home Country": MapPin,
        "Additional Information": FileText,
        "Declaration & Submit": CheckCircle,
        "Review & Submit": CheckCircle,
    };
    const getIconForSection = (sectionName) => {
        return sectionIcons[sectionName] || FileText;
    };
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground pt-16 theme-transition", children: [_jsx("section", { className: "py-16 border-b border-border", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-4 mb-8", children: [user && (_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full text-sm text-muted-foreground", children: [_jsx(Sparkles, { className: "w-4 h-4" }), "Welcome back, ", user.name] })), selectedCountry && (_jsxs(Link, { to: "/select-country", className: "inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-foreground hover:bg-primary/20 transition-colors", children: [_jsx(Globe, { className: "w-4 h-4" }), _jsx("span", { className: "text-lg", children: selectedCountry.flag }), selectedCountry.name, _jsx("span", { className: "text-muted-foreground text-xs", children: "(Change)" })] }))] }), _jsx("h1", { className: "text-4xl md:text-5xl font-bold tracking-tight mb-4", children: "Information You'll Need" }), _jsx("p", { className: "text-xl text-muted-foreground max-w-2xl", children: selectedCountry
                                ? `The ${selectedCountry.name} visa application contains ${selectedCountry.formSections.length} main sections. Gather these details before starting to make the process smoother.`
                                : "Gather all required details before starting your visa application to make the process smoother." })] }) }), selectedCountry && (_jsx("section", { className: "py-6 border-b border-border", children: _jsx("div", { className: "max-w-6xl mx-auto px-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center gap-3 p-4 bg-secondary rounded-xl", children: [_jsx(Clock, { className: "w-5 h-5 text-muted-foreground" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Processing Time" }), _jsx("p", { className: "font-medium text-foreground text-sm", children: selectedCountry.processingTimeline })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-secondary rounded-xl", children: [_jsx(DollarSign, { className: "w-5 h-5 text-muted-foreground" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Visa Fee" }), _jsxs("p", { className: "font-medium text-foreground text-sm", children: [selectedCountry.paymentPricing.currency, " ", selectedCountry.paymentPricing.baseFee, selectedCountry.paymentPricing.serviceFee > 0 && ` + ${selectedCountry.paymentPricing.serviceFee} service fee`] })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-secondary rounded-xl", children: [_jsx(Users, { className: "w-5 h-5 text-muted-foreground" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Interview Required" }), _jsx("p", { className: "font-medium text-foreground text-sm", children: selectedCountry.interviewRequired ? 'Yes' : 'Generally No' })] })] })] }) }) })), _jsx("section", { className: "py-8 border-b border-border", children: _jsx("div", { className: "max-w-6xl mx-auto px-6", children: _jsx("div", { className: "bg-secondary border border-border rounded-xl p-6", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-foreground flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-foreground mb-1", children: "Important Notice" }), _jsx("p", { className: "text-muted-foreground text-sm", children: selectedCountry?.embassyRequirements ||
                                                "All answers must be in English using English characters. Your application will be saved automatically as you progress." })] })] }) }) }) }), _jsx("section", { className: "py-16 border-b border-border", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-8", children: "Application Sections" }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: selectedCountry?.formSections.map((section, index) => {
                                const IconComponent = getIconForSection(section);
                                const helpText = selectedCountry.helpText[section.toLowerCase().replace(/\s+/g, '')] || null;
                                return (_jsxs("div", { className: "bg-card hover:bg-secondary border border-border hover:border-muted-foreground rounded-xl p-6 transition-all", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsx("div", { className: "p-3 bg-secondary rounded-lg", children: _jsx(IconComponent, { className: "w-5 h-5 text-foreground" }) }), _jsxs("div", { children: [_jsxs("span", { className: "text-xs text-muted-foreground", children: ["Section ", index + 1] }), _jsx("h3", { className: "font-semibold text-foreground", children: section })] })] }), helpText && (_jsx("p", { className: "text-sm text-muted-foreground", children: helpText }))] }, index));
                            }) })] }) }), _jsx("section", { className: "py-16 border-b border-border", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-8", children: "Required Documents" }), _jsx("div", { className: "grid md:grid-cols-2 gap-4", children: selectedCountry?.requiredDocuments.map((doc, index) => (_jsxs("div", { className: "flex items-start gap-3 p-4 bg-card border border-border rounded-lg hover:bg-secondary transition-colors", children: [_jsx("div", { className: "w-5 h-5 border-2 border-border rounded flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-muted-foreground text-sm", children: doc })] }, index))) })] }) }), _jsx("section", { className: "py-20", children: _jsx("div", { className: "max-w-4xl mx-auto px-6 text-center", children: _jsxs("div", { className: "bg-secondary border border-border rounded-2xl p-12", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Ready to Begin?" }), _jsxs("p", { className: "text-muted-foreground mb-8 max-w-xl mx-auto", children: ["Our guided system will walk you through each section of your ", selectedCountry?.name || 'visa', " application. Your progress is automatically saved."] }), _jsxs(Link, { to: "/application", className: "group inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all text-lg", children: ["Start ", selectedCountry?.name || 'Visa', " Application", _jsx(ArrowRight, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform" })] }), _jsxs("div", { className: "flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Free to start"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4" }), "No credit card required"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), "Auto-save enabled"] })] })] }) }) })] }));
};
export default ReadyToBegin;
