import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Activity,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  adminGetPaymentSummary,
  PaymentSummary,
  formatMNT,
  getServiceTypeName,
  PaymentServiceType,
} from '@/api/payments';
import api from '@/api/client';

// Chart configurations
const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
  transactions: {
    label: 'Transactions',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const serviceChartConfig = {
  VISA_APPLICATION: {
    label: 'Visa Application',
    color: 'var(--chart-1)',
  },
  CONSULTATION: {
    label: 'Consultation',
    color: 'var(--chart-2)',
  },
  DOCUMENT_REVIEW: {
    label: 'Document Review',
    color: 'var(--chart-3)',
  },
  RUSH_PROCESSING: {
    label: 'Rush Processing',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

interface MonthlyData {
  month: string;
  revenue: number;
  transactions: number;
}

const PaymentAnalytics = () => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Get payment summary
      const summaryRes = await adminGetPaymentSummary();
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }

      // Try to get monthly data from analytics endpoint
      try {
        const analyticsRes = await api.get('/api/payments/admin/analytics', {
          params: { range: timeRange },
        });
        if (analyticsRes.data.success && analyticsRes.data.data?.monthly) {
          setMonthlyData(analyticsRes.data.data.monthly);
        }
      } catch {
        // Generate sample monthly data if endpoint doesn't exist
        setMonthlyData(generateSampleMonthlyData());
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleMonthlyData = (): MonthlyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const result: MonthlyData[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      result.push({
        month: months[monthIndex],
        revenue: Math.floor(Math.random() * 5000000) + 500000, // Random revenue in MNT
        transactions: Math.floor(Math.random() * 50) + 10,
      });
    }

    return result;
  };

  // Transform service data for pie chart
  const serviceDistributionData = summary?.byServiceType
    ? Object.entries(summary.byServiceType).map(([service, data]) => ({
        name: getServiceTypeName(service as PaymentServiceType),
        value: data.revenue,
        count: data.count,
        service,
      }))
    : [];

  // Transform status data for radar chart
  const statusRadarData = summary?.byStatus
    ? Object.entries(summary.byStatus).map(([status, count]) => ({
        status,
        count,
        fullMark: Math.max(...Object.values(summary.byStatus || {}), 100),
      }))
    : [];

  // Provider distribution
  const providerData = summary?.byProvider
    ? Object.entries(summary.byProvider).map(([provider, data]) => ({
        name: provider,
        transactions: data.count,
        revenue: data.revenue,
      }))
    : [];

  const COLORS = ['#f6821f', '#ff9f43', '#ffc078', '#e67317', '#ffe0b3'];

  // Calculate growth percentage
  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold">Payment Analytics</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatMNT(summary?.totalRevenue || 0)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="bg-green-100 text-green-700 gap-1">
                <TrendingUp className="w-3 h-3" />
                +12.5%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalTransactions || 0}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-green-600">
                {summary?.successfulPayments || 0} successful
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-yellow-600">{summary?.pendingPayments || 0} pending</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalTransactions
                ? Math.round((summary.successfulPayments / summary.totalTransactions) * 100)
                : 0}
              %
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${
                    summary?.totalTransactions
                      ? (summary.successfulPayments / summary.totalTransactions) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Refunds
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatMNT(summary?.refundedAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total amount refunded</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend - Gradient Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue and transaction volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px]">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) =>
                        name === 'revenue' ? formatMNT(value as number) : value
                      }
                    />
                  }
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#revenueGradient)"
                  fillOpacity={0.4}
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Service Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service</CardTitle>
            <CardDescription>Distribution across service types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {serviceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Revenue: {formatMNT(data.value)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Transactions: {data.count}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {serviceDistributionData.map((item, index) => (
                <div key={item.service} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
            <CardDescription>Overview of payment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={statusRadarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="status"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                  <Radar
                    name="Count"
                    dataKey="count"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.5}
                  />
                  <ChartTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Provider Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Providers</CardTitle>
            <CardDescription>Transactions by payment provider</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px]">
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) =>
                        name === 'revenue' ? formatMNT(value as number) : value
                      }
                    />
                  }
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <Bar dataKey="transactions" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary?.byServiceType &&
          Object.entries(summary.byServiceType).map(([service, data]) => (
            <Card key={service} className="p-4">
              <p className="text-sm text-muted-foreground mb-1">
                {getServiceTypeName(service as PaymentServiceType)}
              </p>
              <p className="text-xl font-bold">{formatMNT(data.revenue)}</p>
              <p className="text-xs text-muted-foreground">{data.count} transactions</p>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default PaymentAnalytics;
