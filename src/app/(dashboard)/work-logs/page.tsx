"use client";

import * as React from "react";
import { useContext } from "react";
import { DashboardContext } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Plus,
  Search,
  Clock,
  LayoutGrid,
  List,
  FolderLock,
  Trash2,
  Edit2,
  Image as ImageIcon,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  CATEGORY_COLORS,
  formatMinutes,
  formatTime12h,
  STATUS_STYLES,
  PRIORITY_STYLES,
} from "@/lib/utils";
import { toast } from "sonner";

export default function WorkLogsPage() {
  const { openTaskModal, refreshTrigger, triggerRefresh } = useContext(DashboardContext);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [organization, setOrganization] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("ALL");
  const [status, setStatus] = React.useState("ALL");
  const [priority, setPriority] = React.useState("ALL");
  const [dateFilter, setDateFilter] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");

  // Photo viewer modal state
  const [activePhoto, setActivePhoto] = React.useState<any>(null);

  const fetchTasks = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (organization !== "ALL") params.append("organization", organization);
      if (search) params.append("search", search);
      if (category !== "ALL") params.append("category", category);
      if (status !== "ALL") params.append("status", status);
      if (priority !== "ALL") params.append("priority", priority);
      if (dateFilter) params.append("date", dateFilter);

      const res = await fetch(`/api/work-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.workLogs || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load work logs");
    } finally {
      setLoading(false);
    }
  }, [organization, search, category, status, priority, dateFilter]);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this work log entry?")) return;

    try {
      const res = await fetch(`/api/work-logs/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted");
        triggerRefresh();
      } else {
        toast.error("Failed to delete task");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleDownload = (file: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Daily Work Tracker
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log your daily tasks, choose organization, and inspect photos and evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "cards"
                  ? "bg-background shadow-xs text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-background shadow-xs text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={() => openTaskModal()}
            size="sm"
            className="text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>+ Log Work & Photos</span>
          </Button>
        </div>
      </div>

      {/* Organization Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border">
        <button
          onClick={() => setOrganization("ALL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            organization === "ALL"
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>📁 All Work</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted">
            {organization === "ALL" ? tasks.length : ""}
          </span>
        </button>

        <button
          onClick={() => setOrganization("Galactic 3D")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            organization === "Galactic 3D"
              ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm"
              : "text-muted-foreground hover:text-cyan-500 hover:bg-cyan-500/5"
          }`}
        >
          <span>🚀 Galactic 3D</span>
          {organization === "Galactic 3D" && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20">
              {tasks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setOrganization("Cambridge Institute of Technology")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            organization === "Cambridge Institute of Technology"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm"
              : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/5"
          }`}
        >
          <span>🎓 Cambridge Institute of Technology</span>
          {organization === "Cambridge Institute of Technology" && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20">
              {tasks.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-xl border border-border bg-card/60 space-y-2.5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background"
            >
              <option value="ALL">All Categories</option>
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background"
            />
          </div>
        </div>

        {/* Reset Filter Button */}
        {(search || category !== "ALL" || dateFilter || organization !== "ALL") && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
            <span>Showing filtered results ({tasks.length} entries found)</span>
            <button
              onClick={() => {
                setSearch("");
                setCategory("ALL");
                setStatus("ALL");
                setDateFilter("");
                setOrganization("ALL");
              }}
              className="text-primary hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Cards or Table */}
      {loading ? (
        <div className="text-center py-16 text-xs text-muted-foreground">
          Loading work entries...
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No work logs found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Log your tasks and attach photos to track your work for Galactic 3D or Cambridge Institute of Technology.
          </p>
          <Button size="sm" onClick={() => openTaskModal()} className="text-xs">
            + Log Work & Attach Photos
          </Button>
        </div>
      ) : viewMode === "cards" ? (
        /* Cards View with DIRECT PHOTO PREVIEWS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;
            const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.COMPLETED;
            const prioStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;

            const isGalactic =
              !task.organization || task.organization === "Galactic 3D";

            return (
              <div
                key={task.id}
                onClick={() => openTaskModal(task)}
                className="rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all p-4.5 cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div>
                  {/* Workplace Badge & Category Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Organization Chip */}
                    {isGalactic ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        🚀 Galactic 3D
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        🎓 Cambridge Inst of Tech
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                        {task.status.replace("_", " ")}
                      </span>
                      <span className={`h-2 w-2 rounded-full ${prioStyle.dot}`} title={`Priority: ${task.priority}`} />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {task.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {task.description || "No description provided."}
                  </p>

                  {/* Notes snippet */}
                  {task.notes && (
                    <p className="mt-2 text-[11px] text-muted-foreground line-clamp-1 bg-muted/40 p-1.5 rounded-md">
                      <strong className="text-foreground">Note:</strong> {task.notes}
                    </p>
                  )}

                  {/* DIRECT PHOTO PREVIEWS ON THE CARD */}
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-border/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3 text-primary" />
                        <span>Photos & Evidence ({task.attachments.length})</span>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhoto(att);
                              }}
                              className="h-14 w-16 rounded-lg overflow-hidden border border-border hover:border-primary transition-all cursor-pointer relative group/img shadow-xs"
                              title={`Click to view ${att.fileName}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={att.url}
                                alt={att.fileName}
                                className="h-full w-full object-cover group-hover/img:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold">
                                View
                              </div>
                            </div>
                          ) : (
                            <div
                              key={att.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhoto(att);
                              }}
                              className="h-14 px-2 rounded-lg border border-border bg-muted/40 hover:bg-accent transition-all cursor-pointer flex flex-col items-center justify-center text-[10px] font-medium"
                              title={att.fileName}
                            >
                              <FileText className="h-4 w-4 text-primary mb-0.5" />
                              <span className="truncate max-w-[60px] text-[9px]">
                                {att.fileName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Time & Actions */}
                <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {formatTime12h(task.startTime)} – {formatTime12h(task.endTime)}
                    </span>
                    <span className="text-[10px]">
                      ({formatMinutes(task.durationMinutes)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTaskModal(task);
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(task.id, e)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Workplace</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Photos</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => {
                  const isGalactic =
                    !task.organization || task.organization === "Galactic 3D";

                  return (
                    <tr
                      key={task.id}
                      onClick={() => openTaskModal(task)}
                      className="hover:bg-accent/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-foreground truncate">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {task.description}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isGalactic ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                            🚀 Galactic 3D
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 whitespace-nowrap">
                            🎓 Cambridge Inst of Tech
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                        <div>{task.date}</div>
                        <div className="text-[10px]">
                          {formatTime12h(task.startTime)} - {formatTime12h(task.endTime)}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {formatMinutes(task.durationMinutes)}
                      </td>
                      <td className="py-3 px-4">
                        {task.attachments && task.attachments.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            {task.attachments.slice(0, 3).map((att: any) => {
                              const isImg =
                                att.fileType?.startsWith("image/") ||
                                att.url?.startsWith("data:image/") ||
                                /\.(png|jpe?g|webp|gif)$/i.test(att.fileName);

                              return isImg ? (
                                <button
                                  key={att.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePhoto(att);
                                  }}
                                  className="h-8 w-8 rounded overflow-hidden border border-border hover:border-primary"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={att.url}
                                    alt={att.fileName}
                                    className="h-full w-full object-cover"
                                  />
                                </button>
                              ) : (
                                <Badge
                                  key={att.id}
                                  variant="outline"
                                  className="text-[9px]"
                                >
                                  Doc
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openTaskModal(task);
                            }}
                            className="p-1 rounded text-muted-foreground hover:text-primary"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(task.id, e)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL PHOTO LIGHTBOX MODAL */}
      {activePhoto && (
        <Modal
          isOpen={!!activePhoto}
          onClose={() => setActivePhoto(null)}
          title={activePhoto.fileName}
          description={`Attached Photo & Evidence`}
          maxWidth="3xl"
        >
          <div className="space-y-4 pt-1">
            <div className="rounded-xl border border-border bg-black/5 dark:bg-black/40 p-2 flex items-center justify-center max-h-[70vh] overflow-hidden">
              {activePhoto.fileType?.startsWith("image/") ||
              activePhoto.url?.startsWith("data:image/") ||
              /\.(png|jpe?g|webp|gif)$/i.test(activePhoto.fileName) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePhoto.url}
                  alt={activePhoto.fileName}
                  className="max-h-[65vh] w-auto rounded-lg object-contain"
                />
              ) : (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <FileText className="h-16 w-16 mx-auto text-primary" />
                  <p className="text-xs font-semibold text-foreground">
                    {activePhoto.fileName}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleDownload(activePhoto, e)}
                className="text-xs flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Photo</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setActivePhoto(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
