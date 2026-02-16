import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface VisaTypeChartProps {
  applications: any[];
}

const VISA_COLORS: Record<string, string> = {
  B1_B2: 'var(--chart-1)',
  F1: 'var(--chart-2)',
  J1: 'var(--chart-3)',
  H1B: 'var(--chart-4)',
  L1: 'var(--chart-5)',
  O1: 'var(--primary)',
  K1: 'color-mix(in oklch, var(--primary) 65%, #e63b3b 35%)',
  OTHER: 'color-mix(in oklch, var(--muted-foreground) 70%, var(--primary) 30%)',
};

const VISA_LABELS: Record<string, string> = {
  B1_B2: 'B1/B2 Tourism',
  F1: 'F1 Student',
  J1: 'J1 Exchange',
  H1B: 'H1B Work',
  L1: 'L1 Transfer',
  O1: 'O1 Extraordinary',
  K1: 'K1 Fiance',
  OTHER: 'Other',
};

export default function VisaTypeChart({ applications }: VisaTypeChartProps) {
  const visaTypeCounts = applications.reduce((acc: Record<string, number>, app) => {
    const type = app.visaType || 'OTHER';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const sortedData = Object.entries(visaTypeCounts)
    .map(([type, count]) => ({
      type,
      name: VISA_LABELS[type] || type,
      count: count as number,
      fill: VISA_COLORS[type] || VISA_COLORS.OTHER,
    }))
    .sort((a, b) => b.count - a.count);

  const totalApplications = sortedData.reduce((sum, item) => sum + item.count, 0);
  const topType = sortedData[0];
  const activeTypes = sortedData.length;

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applications by Visa Type</CardTitle>
          <CardDescription>Visual distribution appears once submissions arrive.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-6 py-5 text-center">
            <p className="text-sm font-semibold text-foreground">No application data yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Submit test applications to activate this chart section.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Applications
            </p>
            <p className="text-3xl font-bold text-foreground">{totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Top Category
            </p>
            <p className="text-lg font-semibold text-foreground">{topType?.name || '-'}</p>
            <p className="text-xs text-muted-foreground">{topType?.count || 0} applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active Visa Types
            </p>
            <p className="text-3xl font-bold text-foreground">{activeTypes}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Visa Type Distribution</CardTitle>
          <CardDescription>Share of all submitted applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={118}
                  paddingAngle={3}
                  stroke="var(--background)"
                  strokeWidth={2}
                  dataKey="count"
                  labelLine={false}
                >
                  {sortedData.map((entry) => (
                    <Cell key={entry.type} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, 'Applications']}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-primary/20 bg-background/95 px-5 py-4 text-center shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold text-foreground">{totalApplications}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sortedData.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between rounded-lg border border-primary/15 bg-background/70 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs text-foreground truncate">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications by Type</CardTitle>
          <CardDescription>Count per visa category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                />
                <YAxis
                  dataKey="type"
                  type="category"
                  width={68}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(value: number) => [value, 'Applications']}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[8, 8, 8, 8]}
                  background={{ fill: 'color-mix(in oklch, var(--muted) 70%, transparent)' }}
                >
                  {sortedData.map((entry) => (
                    <Cell key={`bar-${entry.type}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {sortedData.map((item) => (
              <div
                key={`chip-${item.type}`}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {item.type} • {item.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
