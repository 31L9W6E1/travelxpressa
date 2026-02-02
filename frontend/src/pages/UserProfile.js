import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import api from "../api/client";
import { User, Calendar, FileText, CheckCircle, Clock, AlertCircle, CreditCard, ChevronRight, Edit3, Eye, Download, Shield, Loader2, QrCode, Smartphone, Building2, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
const UserProfile = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeApplication, setActiveApplication] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    useEffect(() => {
        fetchApplications();
    }, []);
    const fetchApplications = async () => {
        try {
            const response = await api.get("/api/applications");
            const apps = response.data.data || [];
            setApplications(apps);
            if (apps.length > 0) {
                setActiveApplication(apps[0]);
            }
        }
        catch (error) {
            console.error("Error fetching applications:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusInfo = (status) => {
        switch (status) {
            case "SUBMITTED":
                return {
                    label: "Submitted",
                    color: "text-foreground",
                    bgColor: "bg-secondary",
                    borderColor: "border-border",
                    icon: CheckCircle
                };
            case "UNDER_REVIEW":
                return {
                    label: "Under Review",
                    color: "text-foreground",
                    bgColor: "bg-secondary",
                    borderColor: "border-border",
                    icon: Clock
                };
            case "PAYMENT_PENDING":
                return {
                    label: "Payment Pending",
                    color: "text-foreground",
                    bgColor: "bg-secondary",
                    borderColor: "border-border",
                    icon: CreditCard
                };
            case "APPROVED":
                return {
                    label: "Approved",
                    color: "text-green-600 dark:text-green-400",
                    bgColor: "bg-green-100 dark:bg-green-900/30",
                    borderColor: "border-green-200 dark:border-green-800",
                    icon: CheckCircle
                };
            case "REJECTED":
                return {
                    label: "Rejected",
                    color: "text-red-600 dark:text-red-400",
                    bgColor: "bg-red-100 dark:bg-red-900/30",
                    borderColor: "border-red-200 dark:border-red-800",
                    icon: AlertCircle
                };
            case "DRAFT":
            case "IN_PROGRESS":
            default:
                return {
                    label: status === "DRAFT" ? "Draft" : "In Progress",
                    color: "text-muted-foreground",
                    bgColor: "bg-secondary/50",
                    borderColor: "border-border",
                    icon: Edit3
                };
        }
    };
    const statusTimeline = [
        { step: 1, label: "Application Started", completed: true },
        { step: 2, label: "Form Completed", completed: activeApplication?.status !== "DRAFT" && activeApplication?.status !== "IN_PROGRESS" },
        { step: 3, label: "Submitted", completed: ["SUBMITTED", "PAYMENT_PENDING", "UNDER_REVIEW", "APPROVED"].includes(activeApplication?.status || "") },
        { step: 4, label: "Payment Received", completed: ["UNDER_REVIEW", "APPROVED"].includes(activeApplication?.status || "") },
        { step: 5, label: "Under Review", completed: ["UNDER_REVIEW", "APPROVED"].includes(activeApplication?.status || "") },
        { step: 6, label: "Decision Made", completed: activeApplication?.status === "APPROVED" || activeApplication?.status === "REJECTED" },
    ];
    const paymentMethods = [
        {
            id: "khan_qr",
            name: "Khan Bank QR",
            description: "Pay using Khan Bank QR code",
            icon: QrCode,
            instructions: "Scan the QR code with your Khan Bank app"
        },
        {
            id: "monpay",
            name: "MonPay",
            description: "Pay using MonPay wallet",
            icon: Smartphone,
            instructions: "Open MonPay app and scan or enter payment code"
        },
        {
            id: "bank_transfer",
            name: "Bank Transfer",
            description: "Direct bank transfer",
            icon: Building2,
            instructions: "Transfer to our bank account directly"
        },
        {
            id: "qpay",
            name: "QPay",
            description: "Pay using QPay",
            icon: Wallet,
            instructions: "Scan QR code with any QPay-supported bank app"
        }
    ];
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-12 h-12 text-foreground animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading your profile..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground pt-16", children: [_jsxs("div", { className: "max-w-6xl mx-auto px-6 py-8", children: [_jsxs("div", { className: "flex items-start justify-between mb-8 pt-4", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsx("div", { className: "w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-3xl font-bold", children: user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground", children: user?.name || "User" }), _jsx("p", { className: "text-muted-foreground", children: user?.email }), _jsx("div", { className: "flex items-center gap-4 mt-2", children: _jsxs("span", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Member since ", new Date().toLocaleDateString()] }) })] })] }), _jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-full", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-foreground text-sm", children: "Auto-save enabled" })] })] }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [activeApplication ? (_jsxs(Card, { children: [_jsx(CardHeader, { className: "border-b border-border", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-secondary rounded-lg", children: _jsx(FileText, { className: "w-5 h-5 text-foreground" }) }), _jsxs("div", { children: [_jsxs("h2", { className: "text-lg font-semibold text-foreground", children: [activeApplication.visaType || "B1/B2", " Visa Application"] }), _jsxs("p", { className: "text-muted-foreground text-sm", children: ["Started ", new Date(activeApplication.createdAt).toLocaleDateString()] })] })] }), (() => {
                                                            const status = getStatusInfo(activeApplication.status);
                                                            const StatusIcon = status.icon;
                                                            return (_jsxs("span", { className: `flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.bgColor} ${status.borderColor} ${status.color}`, children: [_jsx(StatusIcon, { className: "w-4 h-4" }), status.label] }));
                                                        })()] }) }), _jsxs(CardContent, { className: "p-6", children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground mb-4", children: "Application Progress" }), _jsx("div", { className: "relative", children: statusTimeline.map((item, index) => (_jsxs("div", { className: "flex items-start gap-4 mb-6 last:mb-0", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${item.completed
                                                                                ? "bg-primary text-primary-foreground"
                                                                                : "bg-secondary border-2 border-border"}`, children: item.completed ? (_jsx(CheckCircle, { className: "w-4 h-4" })) : (_jsx("span", { className: "text-xs text-muted-foreground", children: item.step })) }), index < statusTimeline.length - 1 && (_jsx("div", { className: `absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-6 ${item.completed ? "bg-primary/50" : "bg-border"}` }))] }), _jsx("div", { className: "pt-1", children: _jsx("p", { className: item.completed ? "text-foreground font-medium" : "text-muted-foreground", children: item.label }) })] }, item.step))) })] }), _jsx("div", { className: "p-6 bg-secondary/30 border-t border-border", children: _jsxs("div", { className: "flex flex-wrap gap-3", children: [activeApplication.status === "DRAFT" || activeApplication.status === "IN_PROGRESS" ? (_jsx(Button, { asChild: true, children: _jsxs(Link, { to: "/application", className: "flex items-center gap-2", children: [_jsx(Edit3, { className: "w-4 h-4" }), "Continue Application"] }) })) : (_jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(Eye, { className: "w-4 h-4" }), "View Application"] })), _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), "Download PDF"] })] }) })] })) : (_jsxs(Card, { className: "p-12 text-center", children: [_jsx(FileText, { className: "w-16 h-16 text-muted-foreground mx-auto mb-4" }), _jsx("h3", { className: "text-xl font-semibold text-foreground mb-2", children: "No Applications Yet" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Start your DS-160 visa application today." }), _jsx(Button, { asChild: true, children: _jsxs(Link, { to: "/application", className: "inline-flex items-center gap-2", children: ["Start Application", _jsx(ChevronRight, { className: "w-4 h-4" })] }) })] })), applications.length > 1 && (_jsxs(Card, { children: [_jsx(CardHeader, { className: "border-b border-border", children: _jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Submission History" }) }), _jsx("div", { className: "divide-y divide-border", children: applications.map((app) => {
                                                    const status = getStatusInfo(app.status);
                                                    const StatusIcon = status.icon;
                                                    return (_jsxs("div", { className: `p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer ${activeApplication?.id === app.id ? "bg-secondary/50" : ""}`, onClick: () => setActiveApplication(app), children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-2 bg-secondary rounded-lg", children: _jsx(FileText, { className: "w-5 h-5 text-foreground" }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-foreground font-medium", children: [app.visaType || "B1/B2", " Visa"] }), _jsxs("p", { className: "text-muted-foreground text-sm", children: ["Updated ", new Date(app.updatedAt).toLocaleDateString()] })] })] }), _jsxs("span", { className: `flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.bgColor} ${status.borderColor} ${status.color} text-sm`, children: [_jsx(StatusIcon, { className: "w-3 h-3" }), status.label] })] }, app.id));
                                                }) })] }))] }), _jsxs("div", { className: "space-y-6", children: [activeApplication && (activeApplication.status === "SUBMITTED" || activeApplication.status === "PAYMENT_PENDING") && (_jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-secondary rounded-lg", children: _jsx(CreditCard, { className: "w-5 h-5 text-foreground" }) }), _jsx("h3", { className: "text-lg font-semibold text-foreground", children: "Payment Required" })] }), _jsx("p", { className: "text-muted-foreground text-sm mb-4", children: "Complete your payment to proceed with visa application processing." }), _jsxs("div", { className: "p-4 bg-secondary/50 rounded-xl border border-border mb-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-muted-foreground", children: "Application Fee" }), _jsx("span", { className: "text-foreground font-medium", children: "$160.00" })] }), _jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-muted-foreground", children: "Processing Fee" }), _jsx("span", { className: "text-foreground font-medium", children: "$25.00" })] }), _jsx("div", { className: "border-t border-border pt-2 mt-2", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-foreground font-medium", children: "Total" }), _jsx("span", { className: "text-foreground font-bold text-lg", children: "$185.00" })] }) })] }), _jsx("div", { className: "space-y-2 mb-4", children: paymentMethods.map((method) => (_jsxs("button", { onClick: () => {
                                                        setSelectedPayment(method.id);
                                                        setShowPaymentModal(true);
                                                    }, className: `w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedPayment === method.id
                                                        ? "bg-secondary border-primary"
                                                        : "bg-secondary/30 border-border hover:bg-secondary hover:border-muted-foreground"}`, children: [_jsx(method.icon, { className: "w-5 h-5 text-foreground" }), _jsxs("div", { className: "text-left flex-1", children: [_jsx("p", { className: "text-foreground font-medium text-sm", children: method.name }), _jsx("p", { className: "text-muted-foreground text-xs", children: method.description })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground" })] }, method.id))) }), _jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Secure payment processing. Your payment information is encrypted." })] })), _jsxs(Card, { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground mb-4", children: "Quick Actions" }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Link, { to: "/application", className: "flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border hover:bg-secondary hover:border-muted-foreground transition-all group", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "w-5 h-5 text-foreground" }), _jsx("span", { className: "text-muted-foreground", children: "New Application" })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" })] }), _jsxs("button", { className: "w-full flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border hover:bg-secondary hover:border-muted-foreground transition-all group", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(User, { className: "w-5 h-5 text-foreground" }), _jsx("span", { className: "text-muted-foreground", children: "Edit Profile" })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" })] }), _jsxs("button", { className: "w-full flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border hover:bg-secondary hover:border-muted-foreground transition-all group", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Shield, { className: "w-5 h-5 text-foreground" }), _jsx("span", { className: "text-muted-foreground", children: "Security Settings" })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" })] })] })] }), _jsxs(Card, { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "Need Help?" }), _jsx("p", { className: "text-muted-foreground text-sm mb-4", children: "Our support team is available 24/7 to assist with your application." }), _jsx(Button, { variant: "outline", className: "w-full", children: "Contact Support" })] })] })] })] }), showPaymentModal && selectedPayment && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm", children: _jsxs(Card, { className: "w-full max-w-md p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-xl font-bold text-foreground", children: paymentMethods.find(m => m.id === selectedPayment)?.name }), _jsx("button", { onClick: () => setShowPaymentModal(false), className: "p-2 hover:bg-secondary rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5 text-muted-foreground" }) })] }), _jsx("div", { className: "bg-card border border-border rounded-xl p-8 mb-6", children: _jsx("div", { className: "w-48 h-48 mx-auto bg-secondary rounded-lg flex items-center justify-center", children: _jsx(QrCode, { className: "w-24 h-24 text-muted-foreground" }) }) }), _jsxs("div", { className: "text-center mb-6", children: [_jsx("p", { className: "text-foreground font-semibold mb-1", children: "Amount: $185.00" }), _jsx("p", { className: "text-muted-foreground text-sm", children: paymentMethods.find(m => m.id === selectedPayment)?.instructions })] }), _jsx("div", { className: "bg-secondary rounded-lg p-4 mb-6 border border-border", children: _jsxs("p", { className: "text-xs text-muted-foreground", children: [_jsx("strong", { className: "text-foreground", children: "Note:" }), " After payment, it may take up to 24 hours for your payment to be confirmed. You will receive an email notification once your payment is processed."] }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", onClick: () => setShowPaymentModal(false), className: "flex-1", children: "Cancel" }), _jsx(Button, { onClick: () => {
                                        alert("Payment initiated! You will receive confirmation shortly.");
                                        setShowPaymentModal(false);
                                    }, className: "flex-1", children: "I've Paid" })] })] }) }))] }));
};
export default UserProfile;
