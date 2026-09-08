"use client";

import * as React from "react";
import { useContext } from "react";
import { DashboardContext } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  FolderLock,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import {
  CATEGORY_COLORS,
  formatMinutes,
  formatTime12h,
  STATUS_STYLES,
} from "@/lib/utils";

export default function CalendarPage() {
  const { openTaskModal, refreshTrigger } = useContext(DashboardContext);
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = React.useState<Date>(new Date());
  const [viewMode, setViewMode] = React.useState<"month" | "week" | "day">("month");
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    // Fetch logs for broad range around current view
    fetch("/api/work-logs")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.workLogs || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [refreshTrigger]);

  const selectedDateStr = format(selectedDay, "yyyy-MM-dd");
  const selectedDayTasks = tasks
    .filter((t) => t.date === selectedDateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Calendar calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Month days
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1)); // or subDays
  };

  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Calendar Work History
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Browse activities across days, weeks, and months with interactive day inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View selector */}
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40 text-xs">
            {(["month", "week", "day"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md capitalize font-semibold transition-all ${
                  viewMode === mode
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button
            onClick={() => openTaskModal(undefined, selectedDateStr)}
            size="sm"
            className="text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Log for Selected Day</span>
          </Button>
        </div>
      </div>

      {/* Navigation Toolbar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              setCurrentDate(now);
              setSelectedDay(now);
            }}
            className="text-xs h-8"
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>

          <span className="font-bold text-sm text-foreground ml-2">
            {format(currentDate, viewMode === "month" ? "MMMM yyyy" : "MMM d, yyyy")}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          Selected: <strong className="text-foreground">{format(selectedDay, "MMM d, yyyy")}</strong>
        </div>
      </div>

      {/* Main Calendar View & Slide Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2">
          {viewMode === "month" && (
            <Card className="p-4 shadow-xs">
              {/* Day Header Row */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-muted-foreground uppercase pb-2 border-b border-border">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1.5 pt-2">
                {monthDays.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const dayLogs = tasks.filter((t) => t.date === dayStr);
                  const isSelected = isSameDay(day, selectedDay);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[85px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                          : isCurrentMonth
                          ? "border-border/60 bg-card hover:border-primary/40 hover:bg-accent/40"
                          : "border-transparent bg-muted/20 text-muted-foreground/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center ${
                            isToday
                              ? "bg-primary text-primary-foreground font-bold"
                              : isSelected
                              ? "text-primary font-bold"
                              : "text-foreground"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                        {dayLogs.length > 0 && (
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {dayLogs.length}
                          </span>
                        )}
                      </div>

                      {/* Dot indicators for categories */}
                      <div className="space-y-1">
                        {dayLogs.slice(0, 2).map((log) => {
                          const cat = CATEGORY_COLORS[log.category] || CATEGORY_COLORS.Other;
                          return (
                            <div
                              key={log.id}
                              className="text-[9px] truncate px-1 py-0.5 rounded font-medium"
                              style={{ backgroundColor: `${cat.bar}20`, color: cat.bar }}
                            >
                              {log.title}
                            </div>
                          );
                        })}
                        {dayLogs.length > 2 && (
                          <div className="text-[8px] text-muted-foreground text-center">
                            +{dayLogs.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {viewMode === "week" && (
            <Card className="p-4 shadow-xs space-y-3">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const dayLogs = tasks.filter((t) => t.date === dayStr);
                  const isSelected = isSameDay(day, selectedDay);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDay(day)}
                      className={`p-3 rounded-xl border cursor-pointer text-center space-y-1 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">
                        {format(day, "EEE")}
                      </div>
                      <div
                        className={`text-base font-black mx-auto h-7 w-7 rounded-full flex items-center justify-center ${
                          isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="text-[11px] font-semibold text-primary">
                        {dayLogs.length} tasks
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {viewMode === "day" && (
            <Card className="p-6 text-center space-y-3 shadow-xs">
              <h2 className="text-xl font-bold text-foreground">
                {format(selectedDay, "EEEE, MMMM d, yyyy")}
              </h2>
              <p className="text-xs text-muted-foreground">
                Displaying detailed activity breakdown in the side inspector panel.
              </p>
            </Card>
          )}
        </div>

        {/* Day Activities Inspector (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Activities on {format(selectedDay, "MMM d")}
              </h3>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {selectedDayTasks.length} total
            </span>
          </div>

          <div className="space-y-3">
            {selectedDayTasks.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card/40 space-y-2">
                <p className="text-xs text-muted-foreground">
                  No work entries recorded for this day.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openTaskModal(undefined, selectedDateStr)}
                  className="text-xs"
                >
                  Log Entry for {format(selectedDay, "MMM d")}
                </Button>
              </div>
            ) : (
              selectedDayTasks.map((task) => {
                const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;
                const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.COMPLETED;

                return (
                  <div
                    key={task.id}
                    onClick={() => openTaskModal(task)}
                    className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.bg} ${cat.text} ${cat.border}`}>
                        {task.category}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-foreground">
                        {formatTime12h(task.startTime)} - {formatTime12h(task.endTime)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground line-clamp-1">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                      <span>{formatMinutes(task.durationMinutes)}</span>
                      <span className={`px-1.5 py-0.2 rounded font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
