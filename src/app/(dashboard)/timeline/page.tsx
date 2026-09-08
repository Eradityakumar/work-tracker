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
  Calendar as CalendarIcon,
  Plus,
  Clock,
  FolderLock,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { format, addDays, subDays, parseISO } from "date-fns";
import {
  CATEGORY_COLORS,
  formatMinutes,
  formatTime12h,
  STATUS_STYLES,
  PRIORITY_STYLES,
} from "@/lib/utils";

export default function TimelinePage() {
  const { openTaskModal, refreshTrigger } = useContext(DashboardContext);
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const dateStr = format(currentDate, "yyyy-MM-dd");

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/work-logs?date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => {
        // Sort chronologically ascending
        const sorted = (data.workLogs || []).sort((a: any, b: any) =>
          a.startTime.localeCompare(b.startTime)
        );
        setTasks(sorted);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [dateStr, refreshTrigger]);

  const totalMinutes = tasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Visual Day Timeline
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chronological audit log of daily deliverables, time windows, and attached proof.
          </p>
        </div>

        <Button
          onClick={() => openTaskModal(undefined, dateStr)}
          size="sm"
          className="text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add to Timeline</span>
        </Button>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subDays(currentDate, 1))}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="text-xs h-8"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addDays(currentDate, 1))}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <span className="font-bold text-sm text-foreground ml-2">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>Total: {formatMinutes(totalMinutes)}</span>
          </div>
          <span className="hidden sm:inline-block">•</span>
          <span className="hidden sm:inline-block">
            {completedCount}/{tasks.length} Completed
          </span>
        </div>
      </div>

      {/* Vertical Timeline */}
      {loading ? (
        <div className="text-center py-16 text-xs text-muted-foreground">
          Loading timeline for {dateStr}...
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            No activities logged on {format(currentDate, "MMM d, yyyy")}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Add your schedule or meetings to construct a continuous, chronological timeline.
          </p>
          <Button
            size="sm"
            onClick={() => openTaskModal(undefined, dateStr)}
            className="text-xs"
          >
            Log First Activity
          </Button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-primary/20 space-y-6 my-4 ml-4">
          {tasks.map((task, index) => {
            const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;
            const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.COMPLETED;
            const prioStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;

            return (
              <div key={task.id} className="relative group">
                {/* Timeline Dot Indicator */}
                <div
                  className="absolute -left-[31px] sm:-left-[39px] top-4 h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm flex items-center justify-center group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: cat.bar }}
                />

                {/* Timeline Card */}
                <div
                  onClick={() => openTaskModal(task)}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                >
                  {/* Top Bar: Time and Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-wide text-foreground bg-muted/60 px-2 py-0.5 rounded-md font-mono">
                        {formatTime12h(task.startTime)} – {formatTime12h(task.endTime)}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        ({formatMinutes(task.durationMinutes)})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(!task.organization || task.organization === "Galactic 3D") ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                          🚀 Galactic 3D
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          🎓 Cambridge Inst
                        </span>
                      )}
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {task.description || "No description provided."}
                    </p>
                  </div>

                  {/* Notes / Learnings */}
                  {task.notes && (
                    <div className="p-2 rounded-lg bg-muted/30 border border-border/40 text-xs">
                      <strong className="text-foreground">Notes:</strong> {task.notes}
                    </div>
                  )}

                  {/* Attached Photos */}
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="pt-1.5 border-t border-border/40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        Photos ({task.attachments.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {task.attachments.map((att: any) => {
                          const isImg =
                            att.fileType?.startsWith("image/") ||
                            att.url?.startsWith("data:image/") ||
                            /\.(png|jpe?g|webp|gif)$/i.test(att.fileName);

                          return isImg ? (
                            <div
                              key={att.id}
                              className="h-12 w-14 rounded-lg overflow-hidden border border-border"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={att.url}
                                alt={att.fileName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              key={att.id}
                              className="h-12 px-2 rounded-lg border border-border bg-muted/40 flex items-center gap-1 text-[10px]"
                            >
                              <FolderLock className="h-3 w-3 text-primary" />
                              <span className="truncate max-w-[80px]">{att.fileName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {task.tags && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {task.tags.split(",").map((t: string) => (
                        <span
                          key={t}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground"
                        >
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
