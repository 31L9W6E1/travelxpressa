import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Users, Globe, BarChart3, CheckCircle, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
const LearnMore = () => {
    // Mongolian visa statistics
    const mongoliaStats = [
        { label: "Total Applications (2023)", value: "12,450", change: "+15%" },
        { label: "Approval Rate", value: "78%", change: "+3%" },
        { label: "Average Processing", value: "45 days", change: "-5 days" },
        { label: "B1/B2 Visas Issued", value: "8,200", change: "+12%" }
    ];
    // Global visa statistics
    const globalStats = [
        { country: "United Kingdom", approval: "92%" },
        { country: "Germany", approval: "89%" },
        { country: "France", approval: "87%" },
        { country: "Japan", approval: "95%" },
        { country: "Australia", approval: "85%" },
        { country: "South Korea", approval: "91%" },
        { country: "Canada", approval: "88%" },
        { country: "Mongolia", approval: "78%" }
    ];
    // Visa categories breakdown
    const visaCategories = [
        { type: "B1/B2 Tourist/Business", percentage: 65, count: "8,100" },
        { type: "F1 Student", percentage: 18, count: "2,240" },
        { type: "H1B Work", percentage: 8, count: "996" },
        { type: "J1 Exchange", percentage: 5, count: "622" },
        { type: "Other Categories", percentage: 4, count: "492" }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground pt-16", children: [_jsx("section", { className: "py-20 border-b border-border", children: _jsx("div", { className: "max-w-7xl mx-auto px-6", children: _jsxs("div", { className: "max-w-3xl", children: [_jsxs("h1", { className: "text-5xl md:text-6xl font-bold tracking-tight mb-6", children: ["Visa Statistics &", _jsx("span", { className: "block text-muted-foreground", children: "Insights" })] }), _jsx("p", { className: "text-xl text-muted-foreground mb-8", children: "Comprehensive data on US visa applications, approval rates, and trends for Mongolian citizens and global travelers." })] }) }) }), _jsx("section", { className: "py-20 border-b border-border", children: _jsx("div", { className: "max-w-7xl mx-auto px-6", children: _jsxs("div", { className: "grid lg:grid-cols-2 gap-12", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-8", children: [_jsx("div", { className: "p-2 bg-secondary rounded-lg", children: _jsx(Globe, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-bold", children: "Mongolia Visa Data" })] }), _jsx("div", { className: "grid grid-cols-2 gap-4 mb-8", children: mongoliaStats.map((stat, index) => (_jsx(Card, { className: "bg-secondary/50", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-2", children: stat.label }), _jsx("p", { className: "text-3xl font-bold mb-1", children: stat.value }), _jsx("span", { className: "text-sm text-green-500 dark:text-green-400", children: stat.change })] }) }, index))) }), _jsx(Card, { className: "bg-secondary/50", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-6", children: "Visa Categories Breakdown" }), _jsx("div", { className: "space-y-4", children: visaCategories.map((category, index) => (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-2", children: [_jsx("span", { className: "text-foreground", children: category.type }), _jsxs("span", { className: "text-muted-foreground", children: [category.count, " (", category.percentage, "%)"] })] }), _jsx("div", { className: "h-2 bg-secondary rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-primary rounded-full transition-all duration-500", style: { width: `${category.percentage}%` } }) })] }, index))) })] }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-8", children: [_jsx("div", { className: "p-2 bg-secondary rounded-lg", children: _jsx(BarChart3, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-bold", children: "Global Approval Rates" })] }), _jsx(Card, { className: "bg-secondary/50 overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border", children: [_jsx("th", { className: "text-left p-4 text-sm font-medium text-muted-foreground", children: "Country" }), _jsx("th", { className: "text-right p-4 text-sm font-medium text-muted-foreground", children: "Approval Rate" }), _jsx("th", { className: "text-right p-4 text-sm font-medium text-muted-foreground", children: "Comparison" })] }) }), _jsx("tbody", { children: globalStats.map((stat, index) => (_jsxs("tr", { className: `border-b border-border/50 ${stat.country === "Mongolia" ? "bg-primary/10" : ""}`, children: [_jsxs("td", { className: "p-4", children: [_jsx("span", { className: stat.country === "Mongolia" ? "font-semibold" : "", children: stat.country }), stat.country === "Mongolia" && (_jsx("span", { className: "ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded", children: "You" }))] }), _jsx("td", { className: "p-4 text-right font-mono", children: stat.approval }), _jsx("td", { className: "p-4 text-right", children: _jsx("div", { className: "w-20 h-2 bg-secondary rounded-full overflow-hidden ml-auto", children: _jsx("div", { className: "h-full bg-primary rounded-full", style: { width: stat.approval } }) }) })] }, index))) })] }) }), _jsx(Card, { className: "mt-8 bg-secondary/50", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Key Insights" }), _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-start gap-3", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" }), _jsx("span", { className: "text-muted-foreground", children: "Mongolia's approval rate has increased by 3% compared to the previous year" })] }), _jsxs("li", { className: "flex items-start gap-3", children: [_jsx(Users, { className: "w-5 h-5 text-foreground mt-0.5" }), _jsx("span", { className: "text-muted-foreground", children: "B1/B2 tourist visas remain the most commonly applied category" })] }), _jsxs("li", { className: "flex items-start gap-3", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-foreground mt-0.5" }), _jsx("span", { className: "text-muted-foreground", children: "Complete documentation significantly improves approval chances" })] })] })] }) })] })] }) }) }), _jsx("section", { className: "py-20 border-b border-border", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6", children: [_jsx("h2", { className: "text-3xl font-bold mb-12 text-center", children: "Tips to Improve Your Approval Chances" }), _jsx("div", { className: "grid md:grid-cols-3 gap-6", children: [
                                {
                                    title: "Complete Documentation",
                                    description: "Ensure all required documents are accurate, up-to-date, and properly organized before your interview."
                                },
                                {
                                    title: "Strong Ties to Home",
                                    description: "Demonstrate employment, property ownership, family ties, or other reasons to return to Mongolia."
                                },
                                {
                                    title: "Clear Travel Purpose",
                                    description: "Articulate a specific, legitimate reason for your trip with supporting documentation."
                                },
                                {
                                    title: "Financial Stability",
                                    description: "Show sufficient funds through bank statements and proof of income to cover your trip expenses."
                                },
                                {
                                    title: "Honest Answers",
                                    description: "Always provide truthful information. Inconsistencies can lead to immediate denial."
                                },
                                {
                                    title: "Professional Appearance",
                                    description: "Dress appropriately and arrive early for your interview to make a positive impression."
                                }
                            ].map((tip, index) => (_jsx(Card, { className: "bg-secondary/50 hover:bg-secondary transition-colors", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("div", { className: "w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold mb-4", children: index + 1 }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: tip.title }), _jsx("p", { className: "text-muted-foreground text-sm", children: tip.description })] }) }, index))) })] }) }), _jsx("section", { className: "py-20", children: _jsx("div", { className: "max-w-7xl mx-auto px-6", children: _jsx(Card, { className: "bg-secondary", children: _jsxs(CardContent, { className: "p-12 text-center", children: [_jsx("h2", { className: "text-4xl font-bold mb-4", children: "Ready to Apply?" }), _jsx("p", { className: "text-xl text-muted-foreground mb-8 max-w-2xl mx-auto", children: "Start your DS-160 application with TravelXpressa and join the thousands who have successfully obtained their US visa." }), _jsx(Button, { asChild: true, size: "lg", children: _jsxs(Link, { to: "/login", className: "inline-flex items-center gap-2", children: ["Start Your Application", _jsx(ArrowRight, { className: "w-5 h-5" })] }) })] }) }) }) }), _jsx("footer", { className: "border-t border-border py-12", children: _jsx("div", { className: "max-w-7xl mx-auto px-6", children: _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Plane, { className: "w-6 h-6" }), _jsx("span", { className: "text-xl font-bold", children: "TravelXpressa" })] }), _jsxs("div", { className: "flex flex-wrap justify-center gap-6 text-sm text-muted-foreground", children: [_jsx(Link, { to: "/about", className: "hover:text-foreground transition-colors", children: "About" }), _jsx(Link, { to: "/learn-more", className: "hover:text-foreground transition-colors", children: "Learn More" }), _jsx(Link, { to: "/privacy", className: "hover:text-foreground transition-colors", children: "Privacy Policy" }), _jsx(Link, { to: "/terms", className: "hover:text-foreground transition-colors", children: "Terms of Service" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "\u00A9 2024 TravelXpressa. All rights reserved." })] }) }) })] }));
};
export default LearnMore;
