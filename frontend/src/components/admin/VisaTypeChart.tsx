import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface VisaTypeChartProps {
  applications: any[];
}

const VISA_COLORS: Record<string, string> = {
  'B1_B2': '#3b82f6',
  'F1': '#8b5cf6',
  'J1': '#ec4899',
  'H1B': '#f59e0b',
  'L1': '#10b981',
  'O1': '#06b6d4',
  'K1': '#ef4444',
  'OTHER': '#6b7280',
};

const VISA_LABELS: Record<string, string> = {
  'B1_B2': 'B1/B2 Tourism',
  'F1': 'F1 Student',
  'J1': 'J1 Exchange',
  'H1B': 'H1B Work',
  'L1': 'L1 Transfer',
  'O1': 'O1 Extraordinary',
  'K1': 'K1 Fiance',
  'OTHER': 'Other',
};

export default function VisaTypeChart({ applications }: VisaTypeChartProps) {
  // Count applications by visa type
  const visaTypeCounts = applications.reduce((acc: Record<string, number>, app) => {
    const type = app.visaType || 'OTHER';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(visaTypeCounts).map(([type, count]) => ({
    name: VISA_LABELS[type] || type,
    value: count as number,
    type,
  }));

  const barData = Object.entries(visaTypeCounts).map(([type, count]) => ({
    name: VISA_LABELS[type] || type,
    shortName: type,
    count: count as number,
    fill: VISA_COLORS[type] || '#6b7280',
  }));

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applications by Visa Type</CardTitle>
          <CardDescription>Distribution of visa applications</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No applications data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visa Type Distribution</CardTitle>
          <CardDescription>Breakdown by visa category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={VISA_COLORS[entry.type] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, 'Applications']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {pieData.map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: VISA_COLORS[item.type] || '#6b7280' }}
                />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Applications by Type</CardTitle>
          <CardDescription>Number of applications per visa type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="shortName" type="category" width={60} className="text-xs" />
                <Tooltip
                  formatter={(value: number) => [value, 'Applications']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
