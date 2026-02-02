import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
const VISA_COLORS = {
    'B1_B2': '#3b82f6',
    'F1': '#8b5cf6',
    'J1': '#ec4899',
    'H1B': '#f59e0b',
    'L1': '#10b981',
    'O1': '#06b6d4',
    'K1': '#ef4444',
    'OTHER': '#6b7280',
};
const VISA_LABELS = {
    'B1_B2': 'B1/B2 Tourism',
    'F1': 'F1 Student',
    'J1': 'J1 Exchange',
    'H1B': 'H1B Work',
    'L1': 'L1 Transfer',
    'O1': 'O1 Extraordinary',
    'K1': 'K1 Fiance',
    'OTHER': 'Other',
};
export default function VisaTypeChart({ applications }) {
    // Count applications by visa type
    const visaTypeCounts = applications.reduce((acc, app) => {
        const type = app.visaType || 'OTHER';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.entries(visaTypeCounts).map(([type, count]) => ({
        name: VISA_LABELS[type] || type,
        value: count,
        type,
    }));
    const barData = Object.entries(visaTypeCounts).map(([type, count]) => ({
        name: VISA_LABELS[type] || type,
        shortName: type,
        count: count,
        fill: VISA_COLORS[type] || '#6b7280',
    }));
    if (applications.length === 0) {
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Applications by Visa Type" }), _jsx(CardDescription, { children: "Distribution of visa applications" })] }), _jsx(CardContent, { className: "flex items-center justify-center h-[300px]", children: _jsx("p", { className: "text-muted-foreground", children: "No applications data available" }) })] }));
    }
    return (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Visa Type Distribution" }), _jsx(CardDescription, { children: "Breakdown by visa category" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: pieData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, paddingAngle: 2, dataKey: "value", label: ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`, labelLine: false, children: pieData.map((entry, index) => (_jsx(Cell, { fill: VISA_COLORS[entry.type] || '#6b7280' }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => [value, 'Applications'], contentStyle: {
                                                    backgroundColor: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px',
                                                } })] }) }) }), _jsx("div", { className: "flex flex-wrap justify-center gap-3 mt-4", children: pieData.map((item) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: VISA_COLORS[item.type] || '#6b7280' } }), _jsx("span", { className: "text-xs text-muted-foreground", children: item.name })] }, item.type))) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Applications by Type" }), _jsx(CardDescription, { children: "Number of applications per visa type" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: barData, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }), _jsx(XAxis, { type: "number", className: "text-xs" }), _jsx(YAxis, { dataKey: "shortName", type: "category", width: 60, className: "text-xs" }), _jsx(Tooltip, { formatter: (value) => [value, 'Applications'], contentStyle: {
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            } }), _jsx(Bar, { dataKey: "count", radius: [0, 4, 4, 0], children: barData.map((entry, index) => (_jsx(Cell, { fill: entry.fill }, `cell-${index}`))) })] }) }) }) })] })] }));
}
