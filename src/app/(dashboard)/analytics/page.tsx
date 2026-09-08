"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Clock,
  TrendingUp,
  FolderLock,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const COLORS = ["#3b82f6", "#a855f7", "#10b981", "#ec4899", "#f59e0b", "#6366f1", "#06b6d4"];

  if (loading) {
    return (
      <div className="text-center py-20 text-xs text-muted-foreground">
        Aggregating work analytics and trend charts...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const dailyTrend = data?.dailyTrend || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const statusBreakdown = data?.statusBreakdown || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Productivity Analytics & Velocity
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time metrics on work allocation, daily focus, task completion rates, and category distribution.
        </p>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Hours Logged
          </p>
          <p className="text-2xl font-black text-foreground mt-1">
            {dailyTrend.reduce((sum: number, d: any) => sum + d.hours, 0).toFixed(1)} hrs
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold">Last 7 days cumulative</span>
        </Card>

        <Card className="p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Efficiency Score
          </p>
          <p className="text-2xl font-black text-foreground mt-1">
            {metrics.weeklyProductivityScore}%
          </p>
          <span className="text-[10px] text-primary font-semibold">Based on delivery velocity</span>
        </Card>

        <Card className="p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Deliverables
          </p>
          <p className="text-2xl font-black text-foreground mt-1">
            {metrics.totalTasks || 0}
          </p>
          <span className="text-[10px] text-muted-foreground">Logged tasks to date</span>
        </Card>

        <Card className="p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Evidence Files
          </p>
          <p className="text-2xl font-black text-foreground mt-1">
            {metrics.totalFiles || 0}
          </p>
          <span className="text-[10px] text-purple-600 font-semibold">Verified attachments</span>
        </Card>
      </div>

      {/* Charts Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours Logged per Day (Bar Chart) */}
        <Card className="p-5 shadow-xs">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Hours Logged Per Day (7-Day History)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`${value} hours`, "Hours Logged"]}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Productivity & Task Volume Trend (Line Chart) */}
        <Card className="p-5 shadow-xs">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>Daily Task Completion Velocity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`${value} tasks`, "Deliverables"]}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution (Pie Chart) */}
        <Card className="p-5 shadow-xs">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-purple-500" />
              <span>Time Distribution by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64 flex items-center justify-center">
            {categoryDistribution.length === 0 ? (
              <p className="text-xs text-muted-foreground">No category data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name} (${entry.value}h)`}
                    labelLine={false}
                  >
                    {categoryDistribution.map((entry: any, index: number) => {
                      const catStyle = CATEGORY_COLORS[entry.name];
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={catStyle?.bar || COLORS[index % COLORS.length]}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [`${value} hours`, "Time Spent"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Task Completion Status Breakdown */}
        <Card className="p-5 shadow-xs">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span>Deliverables Status Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64 flex flex-col justify-center space-y-4">
            {statusBreakdown.map((item: any) => {
              const total = statusBreakdown.reduce((s: number, i: any) => s + i.count, 0) || 1;
              const percent = Math.round((item.count / total) * 100);

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {item.count} tasks ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
