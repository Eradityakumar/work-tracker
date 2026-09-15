"use client";

import * as React from "react";
import { useContext } from "react";
import { DashboardContext } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  Tag,
  FileText,
  Download,
  Plus,
  ArrowRight,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from "date-fns";
import { calculateDuration, formatMinutes, CATEGORY_COLORS } from "@/lib/utils";
import { toast } from "sonner";

export default function WeeklyTrackerPage() {
  const { openTaskModal, openReportModal, refreshTrigger } = useContext(DashboardContext);

  const [mode, setMode] = React.useState<"WEEKLY" | "MONTHLY">("WEEKLY");
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedOrg, setSelectedOrg] = React.useState<string>("ALL");
  const [loading, setLoading] = React.useState(true);
  const [tasks, setTasks] = React.useState<any[]>([]);

  // Calculate current date range
  const dateRange = React.useMemo(() => {
    if (mode === "WEEKLY") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return {
        start,
        end,
        startStr: format(start, "yyyy-MM-dd"),
        endStr: format(end, "yyyy-MM-dd"),
        label: `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`,
      };
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return {
        start,
        end,
        startStr: format(start, "yyyy-MM-dd"),
        endStr: format(end, "yyyy-MM-dd"),
        label: format(currentDate, "MMMM yyyy"),
      };
    }
  }, [mode, currentDate]);

  // Fetch tasks for the selected date range
  const fetchRangeTasks = React.useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/work-logs?startDate=${dateRange.startStr}&endDate=${dateRange.endStr}`;
      if (selectedOrg !== "ALL") {
        url += `&organization=${encodeURIComponent(selectedOrg)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.workLogs || []);
      } else {
        toast.error("Failed to load work logs");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while loading work logs");
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedOrg]);

  React.useEffect(() => {
    fetchRangeTasks();
  }, [fetchRangeTasks, refreshTrigger]);

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentDate((prev) => (mode === "WEEKLY" ? subWeeks(prev, 1) : subMonths(prev, 1)));
  };

  const handleNext = () => {
    setCurrentDate((prev) => (mode === "WEEKLY" ? addWeeks(prev, 1) : addMonths(prev, 1)));
  };

  const handleCurrent = () => {
    setCurrentDate(new Date());
  };

  // Metrics calculations
  const totalMinutes = tasks.reduce((acc, t) => {
    return acc + (t.duration || calculateDuration(t.startTime, t.endTime));
  }, 0);

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;

  const galacticTasks = tasks.filter((t) => t.organization === "Galactic 3D");
  const galacticMinutes = galacticTasks.reduce(
    (acc, t) => acc + (t.duration || calculateDuration(t.startTime, t.endTime)),
    0
  );

  const cambridgeTasks = tasks.filter((t) => t.organization === "Cambridge Institute of Technology");
  const cambridgeMinutes = cambridgeTasks.reduce(
    (acc, t) => acc + (t.duration || calculateDuration(t.startTime, t.endTime)),
    0
  );

  // Days in current interval (for weekly view)
  const daysInWeek = React.useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  // Group tasks by date string (yyyy-MM-dd)
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, any[]> = {};
    tasks.forEach((t) => {
      const d = t.date;
      if (!map[d]) map[d] = [];
      map[d].push(t);
    });
    return map;
  }, [tasks]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CalendarRange className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Weekly & Monthly Work Tracker
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comprehensive breakdown of deliverables, hours, and accomplishments with instant AI reports.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => openReportModal(mode === "WEEKLY" ? "WEEKLY" : "MONTHLY")}
            size="sm"
            className="text-xs font-semibold flex items-center gap-1.5 shadow-sm bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate {mode === "WEEKLY" ? "Weekly" : "Monthly"} Report</span>
          </Button>

          <Button
            onClick={() => openTaskModal()}
            size="sm"
            variant="outline"
            className="text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>+ Log Work</span>
          </Button>
        </div>
      </div>

      {/* Control Bar: Mode Toggle + Date Stepper + Workplace Filter */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/50 shrink-0">
          <button
            onClick={() => setMode("WEEKLY")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "WEEKLY"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setMode("MONTHLY")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "MONTHLY"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            Monthly View
          </button>
        </div>

        {/* Center: Period Navigator */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted active:scale-95 transition-all"
            title="Previous period"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={handleCurrent}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
          >
            {mode === "WEEKLY" ? "This Week" : "This Month"}
          </button>

          <div className="flex items-center gap-1.5 font-bold text-sm text-foreground px-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>{dateRange.label}</span>
          </div>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted active:scale-95 transition-all"
            title="Next period"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Organization Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="ALL">All Workplaces</option>
            <option value="Galactic 3D">🚀 Galactic 3D</option>
            <option value="Cambridge Institute of Technology">🎓 Cambridge Inst.</option>
          </select>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Hours */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Hours</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {formatMinutes(totalMinutes)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Across {tasks.length} total work {tasks.length === 1 ? "entry" : "entries"}
          </div>
        </div>

        {/* Tasks Status */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {completedCount} <span className="text-xs font-normal text-muted-foreground">done</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
            <span>{inProgressCount} in progress</span>
            <span>•</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}% rate
            </span>
          </div>
        </div>

        {/* Galactic 3D Hours */}
        <div className="p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 shadow-xs">
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span>🚀</span> Galactic 3D
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              {galacticTasks.length} tasks
            </span>
          </div>
          <div className="text-2xl font-black text-foreground">
            {formatMinutes(galacticMinutes)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {totalMinutes > 0 ? Math.round((galacticMinutes / totalMinutes) * 100) : 0}% of tracked time
          </div>
        </div>

        {/* Cambridge Institute Hours */}
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span>🎓</span> Cambridge Inst.
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {cambridgeTasks.length} tasks
            </span>
          </div>
          <div className="text-2xl font-black text-foreground">
            {formatMinutes(cambridgeMinutes)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {totalMinutes > 0 ? Math.round((cambridgeMinutes / totalMinutes) * 100) : 0}% of tracked time
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-20 rounded-2xl border border-border bg-card/50 text-xs text-muted-foreground animate-pulse">
          Loading {mode === "WEEKLY" ? "weekly" : "monthly"} work deliverables...
        </div>
      ) : mode === "WEEKLY" ? (
        /* WEEKLY DAY-BY-DAY VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>Daily Breakdown for the Week</span>
              <span className="text-xs font-normal text-muted-foreground">
                ({format(dateRange.start, "MMM d")} – {format(dateRange.end, "MMM d")})
              </span>
            </h2>
            <span className="text-xs text-muted-foreground font-semibold">
              {tasks.length} total {tasks.length === 1 ? "deliverable" : "deliverables"}
            </span>
          </div>

          <div className="space-y-3.5">
            {daysInWeek.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDate[dayStr] || [];
              const dayTotalMin = dayTasks.reduce(
                (acc, t) => acc + (t.duration || calculateDuration(t.startTime, t.endTime)),
                0
              );
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dayStr}
                  className={`rounded-2xl border transition-all ${
                    isToday
                      ? "border-primary/50 bg-card shadow-sm ring-1 ring-primary/20"
                      : "border-border bg-card/70 hover:border-border/80"
                  }`}
                >
                  {/* Day Header Row */}
                  <div className="p-3.5 sm:p-4 border-b border-border/60 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1.5 rounded-xl text-center flex flex-col justify-center min-w-[58px] ${
                          isToday
                            ? "bg-primary text-primary-foreground font-bold"
                            : "bg-muted text-foreground font-semibold"
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-wider opacity-80">
                          {format(day, "EEE")}
                        </span>
                        <span className="text-base font-black leading-tight">
                          {format(day, "d")}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {format(day, "EEEE, MMMM d, yyyy")}
                          </span>
                          {isToday && (
                            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              Today
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {dayTasks.length === 0
                            ? "No tasks recorded"
                            : `${dayTasks.length} ${dayTasks.length === 1 ? "task" : "tasks"} • ${formatMinutes(dayTotalMin)} total`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openTaskModal(null, dayStr)}
                        className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 h-8 px-2.5"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        <span>Log for this day</span>
                      </Button>
                    </div>
                  </div>

                  {/* Day Tasks List */}
                  {dayTasks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground italic">
                      Nothing logged yet for this day. Click &ldquo;Log for this day&rdquo; to add deliverables.
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 space-y-3">
                      {dayTasks.map((task) => {
                        const isGalactic = task.organization === "Galactic 3D";
                        return (
                          <div
                            key={task.id}
                            onClick={() => openTaskModal(task)}
                            className="p-3.5 rounded-xl border border-border/80 bg-background hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer space-y-2.5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Organization Badge */}
                                <span
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                    isGalactic
                                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  }`}
                                >
                                  <span>{isGalactic ? "🚀" : "🎓"}</span>
                                  <span>{task.organization}</span>
                                </span>

                                {/* Category */}
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                  {task.category}
                                </span>

                                {/* Priority */}
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    task.priority === "HIGH"
                                      ? "bg-red-500/10 text-red-600"
                                      : task.priority === "LOW"
                                      ? "bg-slate-500/10 text-slate-600"
                                      : "bg-amber-500/10 text-amber-600"
                                  }`}
                                >
                                  {task.priority}
                                </span>

                                {/* Status */}
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                    task.status === "COMPLETED"
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : "bg-blue-500/10 text-blue-600"
                                  }`}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>{task.status}</span>
                                </span>
                              </div>

                              {/* Timing */}
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                <span>
                                  {task.startTime} – {task.endTime}
                                </span>
                                <span className="text-[11px] text-primary font-bold">
                                  ({formatMinutes(task.duration || calculateDuration(task.startTime, task.endTime))})
                                </span>
                              </div>
                            </div>

                            {/* Title & Description */}
                            <div>
                              <h4 className="text-sm font-bold text-foreground">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Notes & Learnings */}
                            {(task.notes || task.learnings) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                                {task.notes && (
                                  <div className="bg-muted/30 p-2 rounded-lg">
                                    <span className="font-bold text-muted-foreground block text-[10px] uppercase">
                                      Notes / Blockers:
                                    </span>
                                    <span className="text-foreground/90">{task.notes}</span>
                                  </div>
                                )}
                                {task.learnings && (
                                  <div className="bg-purple-500/5 border border-purple-500/10 p-2 rounded-lg">
                                    <span className="font-bold text-purple-600 dark:text-purple-400 block text-[10px] uppercase">
                                      Learning & Insight:
                                    </span>
                                    <span className="text-foreground/90">{task.learnings}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Tags & Attachments */}
                            {task.tags && (
                              <div className="flex items-center gap-1 pt-1">
                                <Tag className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[11px] text-muted-foreground">{task.tags}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* MONTHLY GROUPED VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>All Work Deliverables in {format(currentDate, "MMMM yyyy")}</span>
            </h2>
            <span className="text-xs text-muted-foreground font-semibold">
              {tasks.length} total items
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
              <CalendarRange className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-bold text-foreground">No tasks recorded for this month</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Select a different month or start logging work using the button below.
              </p>
              <Button size="sm" onClick={() => openTaskModal()} className="text-xs">
                + Log New Work Entry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {tasks.map((task) => {
                const isGalactic = task.organization === "Galactic 3D";
                return (
                  <div
                    key={task.id}
                    onClick={() => openTaskModal(task)}
                    className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                        <span>{format(parseISO(task.date), "EEE, MMM d, yyyy")}</span>
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isGalactic
                            ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isGalactic ? "🚀 Galactic 3D" : "🎓 Cambridge Inst."}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-foreground line-clamp-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {task.category}
                        </Badge>
                        <span className="font-semibold text-foreground">
                          {formatMinutes(task.duration || calculateDuration(task.startTime, task.endTime))}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold ${
                          task.status === "COMPLETED" ? "text-emerald-600" : "text-blue-600"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Integrated Executive Report Banner */}
      <div className="p-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-md">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Ready to submit or share your {mode === "WEEKLY" ? "Weekly" : "Monthly"} Report?
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate an executive summary synthesized with OpenAI, and export it instantly as a high-fidelity PDF or Excel spreadsheet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => openReportModal(mode === "WEEKLY" ? "WEEKLY" : "MONTHLY")}
            className="text-xs font-bold flex items-center gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Compile {mode === "WEEKLY" ? "Weekly" : "Monthly"} Report</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
