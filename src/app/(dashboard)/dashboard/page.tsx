"use client";

import * as React from "react";
import { useContext } from "react";
import { DashboardContext } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  FolderLock,
  Sparkles,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  PlusCircle,
  BarChart2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { CATEGORY_COLORS, formatMinutes, formatTime12h, STATUS_STYLES, PRIORITY_STYLES } from "@/lib/utils";

export default function DashboardPage() {
  const { openTaskModal, openReportModal, refreshTrigger, user } = useContext(DashboardContext);
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
      .catch((err) => {
        console.error("Analytics fetch error:", err);
        setLoading(false);
      });
  }, [refreshTrigger]);

  const metrics = data?.metrics || {
    completedToday: 0,
    todayHours: 0,
    todayFiles: 0,
    weeklyProductivityScore: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 p-6 border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back, {user?.name?.split(" ")[0] || "Employee"} 👋
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {user?.department || "Core Team"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Log daily work, attach photos, and track deliverables for Galactic 3D and Cambridge Institute of Technology.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => openTaskModal()}
              className="text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Log Work & Photos</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Completed Today */}
        <Card className="hover:border-emerald-500/50 transition-colors group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tasks Done Today
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">
              {loading ? "..." : metrics.completedToday}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold">Active day</span> • Verified output
            </p>
          </CardContent>
        </Card>

        {/* Total Hours Worked Today */}
        <Card className="hover:border-blue-500/50 transition-colors group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hours Logged Today
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">
              {loading ? "..." : `${metrics.todayHours} hrs`}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Continuous chronological tracking
            </p>
          </CardContent>
        </Card>

        {/* Files Uploaded Today */}
        <Card className="hover:border-purple-500/50 transition-colors group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Files Uploaded Today
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FolderLock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">
              {loading ? "..." : metrics.todayFiles}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
              <Sparkles className="h-3 w-3" /> Auto OCR & Categorized
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Main Grid: Recent Activities & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                Recent Activities
              </h2>
            </div>
            <Link
              href="/timeline"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <span>View Full Timeline</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading tasks...</div>
            ) : data?.recentActivities?.length > 0 ? (
              data.recentActivities.map((task: any) => {
                const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;
                const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.COMPLETED;
                const prioStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;

                return (
                  <div
                    key={task.id}
                    onClick={() => openTaskModal(task)}
                    className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-accent/40 hover:border-primary/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.bg} ${cat.text} ${cat.border}`}>
                          {task.category}
                        </span>
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {task.title}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description || "No description provided."}
                      </p>
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                          <FolderLock className="h-3 w-3" />
                          <span>{task.attachments.length} evidence attachment(s)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-xs text-muted-foreground flex-shrink-0 gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                      <span className="font-semibold text-foreground">
                        {formatTime12h(task.startTime)} – {formatTime12h(task.endTime)}
                      </span>
                      <span className="text-[11px]">
                        {formatMinutes(task.durationMinutes)} • {task.date}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                No recent activity logged yet. Click &ldquo;Log Work Entry&rdquo; to begin!
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks & Quick Hub (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                In-Progress & Upcoming
              </h2>
            </div>
            <Link
              href="/work-logs"
              className="text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              All Logs
            </Link>
          </div>

          <div className="space-y-2.5">
            {data?.upcomingTasks?.length > 0 ? (
              data.upcomingTasks.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => openTaskModal(task)}
                  className="p-3 rounded-xl border border-border bg-card/60 hover:bg-accent/40 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {task.title}
                    </span>
                    <Badge variant="outline" className="text-[9px] uppercase">
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{task.category}</span>
                    <span>{task.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                🎉 All tasks completed for today!
              </div>
            )}
          </div>

          {/* Quick Shortcuts Widget */}
          <Card className="p-4 bg-gradient-to-br from-card to-muted/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Quick Navigation
            </h3>
            <div className="space-y-2">
              <Link
                href="/work-logs"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Work Tracker & Photos</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/timeline"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-500" />
                  <span>Day Timeline View</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/calendar"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span>Calendar Work History</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
