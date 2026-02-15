import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Activity,
  BarChart3,
  Eye,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from '@/components/UserAvatar';
import api from '@/api/client';

interface ApplicationStats {
  total: number;
  draft: number;
  inProgress: number;
  submitted: number;
  underReview: number;
  completed: number;
  rejected: number;
  paymentPending: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
  approvalRate: number;
  avgProcessingTime: number;
}

interface ApplicationSummary {
  id: string;
  visaType: string;
  status: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface MonthlyAppData {
  month: string;
  submitted: number;
  completed: number;
  rejected: number;
}

// Chart configurations
const statusChartConfig = {
  submitted: {
    label: 'Submitted',
    color: 'var(--chart-1)',
  },
  completed: {
    label: 'Completed',
    color: 'var(--chart-2)',
  },
  rejected: {
    label: 'Rejected',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

const ApplicationTracker = () => {
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [recentApps, setRecentApps] = useState<ApplicationSummary[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyAppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visaTypeDistribution, setVisaTypeDistribution] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await api.get('/api/admin/stats');
      if (statsRes.data?.data?.applications || statsRes.data?.applications) {
        const appStats = statsRes.data?.data?.applications || statsRes.data?.applications;
        setStats(appStats);
      }

      // Fetch recent applications
      const appsRes = await api.get('/api/admin/applications');
      const apps = appsRes.data?.data || appsRes.data?.applications || [];
      setRecentApps(apps.slice(0, 10));

      // Calculate visa type distribution
      const visaTypes: Record<string, number> = {};
      apps.forEach((app: ApplicationSummary) => {
        visaTypes[app.visaType] = (visaTypes[app.visaType] || 0) + 1;
      });
      setVisaTypeDistribution(
        Object.entries(visaTypes).map(([name, value]) => ({ name, value }))
      );

      // Generate monthly trend data
      setMonthlyData(generateMonthlyData(apps));
    } catch (error: any) {
      console.error('Failed to fetch application data:', error);
      toast.error('Failed to load application tracking data');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (apps: ApplicationSummary[]): MonthlyAppData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const result: MonthlyAppData[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthApps = apps.filter((app) => {
        const appMonth = new Date(app.createdAt).getMonth();
        return appMonth === monthIndex;
      });

      result.push({
        month: months[monthIndex],
        submitted: monthApps.filter((a) => a.status === 'SUBMITTED').length,
        completed: monthApps.filter((a) => a.status === 'COMPLETED').length,
        rejected: monthApps.filter((a) => a.status === 'REJECTED').length,
      });
    }

    return result;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-500',
      IN_PROGRESS: 'bg-blue-500',
      PAYMENT_PENDING: 'bg-yellow-500',
      SUBMITTED: 'bg-indigo-500',
      UNDER_REVIEW: 'bg-purple-500',
      COMPLETED: 'bg-green-500',
      REJECTED: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusBadgeStyle = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      IN_PROGRESS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      PAYMENT_PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      SUBMITTED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      UNDER_REVIEW: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      COMPLETED: 'bg-green-500/20 text-green-300 border-green-500/30',
      REJECTED: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return styles[status] || styles.DRAFT;
  };

  const COLORS = ['#f6821f', '#ff9f43', '#ffc078', '#e67317', '#ffe0b3', '#804000', '#663300', '#331900'];

  // Status funnel data
  const funnelData = stats
    ? [
        { name: 'Draft', value: stats.draft, color: '#6b7280' },
        { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
        { name: 'Payment Pending', value: stats.paymentPending || 0, color: '#eab308' },
        { name: 'Submitted', value: stats.submitted, color: '#6366f1' },
        { name: 'Under Review', value: stats.underReview, color: '#8b5cf6' },
        { name: 'Completed', value: stats.completed, color: '#22c55e' },
        { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
      ]
    : [];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold">Application Tracking</h2>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <div className="flex items-center gap-1 mt-1">
              {(stats?.growth || 0) >= 0 ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700 gap-1">
                  <TrendingUp className="w-3 h-3" />+{stats?.growth || 0}%
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-700 gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {stats?.growth || 0}%
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approval Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.approvalRate || 0}%
            </div>
            <Progress value={stats?.approvalRate || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(stats?.submitted || 0) + (stats?.underReview || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.submitted || 0} submitted, {stats?.underReview || 0} under review
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Processing Time
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgProcessingTime || 3} days</div>
            <p className="text-xs text-muted-foreground mt-1">From submission to completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
          <CardDescription>Visual overview of applications in each stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
            {funnelData.map((stage, index) => (
              <div key={stage.name} className="flex-1 min-w-[100px] text-center">
                <div className="relative">
                  <div
                    className="h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-all hover:scale-105"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.value}
                  </div>
                  {index < funnelData.length - 1 && (
                    <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 text-muted-foreground z-10" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stage.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
            <CardDescription>Monthly application volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="h-[300px]">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="submittedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-submitted)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-submitted)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  type="natural"
                  dataKey="submitted"
                  stackId="1"
                  stroke="var(--color-submitted)"
                  fill="url(#submittedGradient)"
                />
                <Area
                  type="natural"
                  dataKey="completed"
                  stackId="2"
                  stroke="var(--color-completed)"
                  fill="url(#completedGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Visa Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Visa Type Distribution</CardTitle>
            <CardDescription>Applications by visa category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visaTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {visaTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {visaTypeDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest application submissions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar seed={app.user?.id} name={app.user?.name} email={app.user?.email} size="md" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{app.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground truncate">{app.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4 w-full md:w-auto">
                    <div className="text-right">
                      <Badge variant="outline" className="font-mono">
                        {app.visaType}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Step {app.currentStep}/9
                      </p>
                    </div>
                    <Badge className={getStatusBadgeStyle(app.status)}>
                      {app.status.replace(/_/g, ' ')}
                    </Badge>
                    <div className="text-right text-sm text-muted-foreground ml-auto">
                      <p>{new Date(app.updatedAt).toLocaleDateString()}</p>
                      <p className="text-xs">{new Date(app.updatedAt).toLocaleTimeString()}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {recentApps.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No applications found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationTracker;
