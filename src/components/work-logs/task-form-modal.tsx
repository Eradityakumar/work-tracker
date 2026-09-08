"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { calculateDuration, formatMinutes, CATEGORY_COLORS } from "@/lib/utils";
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  X,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialTask?: any;
  defaultDate?: string;
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSaved,
  initialTask,
  defaultDate,
}: TaskFormModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [organization, setOrganization] = React.useState<string>("Galactic 3D");
  const [category, setCategory] = React.useState("Development");
  const [date, setDate] = React.useState(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:30");
  const [priority, setPriority] = React.useState("MEDIUM");
  const [status, setStatus] = React.useState("COMPLETED");
  const [notes, setNotes] = React.useState("");
  const [learnings, setLearnings] = React.useState("");
  const [tags, setTags] = React.useState("");

  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || "");
      setDescription(initialTask.description || "");
      setOrganization(initialTask.organization || "Galactic 3D");
      setCategory(initialTask.category || "Development");
      setDate(initialTask.date || new Date().toISOString().split("T")[0]);
      setStartTime(initialTask.startTime || "09:00");
      setEndTime(initialTask.endTime || "10:30");
      setPriority(initialTask.priority || "MEDIUM");
      setStatus(initialTask.status || "COMPLETED");
      setNotes(initialTask.notes || "");
      setLearnings(initialTask.learnings || "");
      setTags(initialTask.tags || "");
      setAttachments(initialTask.attachments || []);
    } else {
      setTitle("");
      setDescription("");
      setOrganization("Galactic 3D");
      setCategory("Development");
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      setStartTime("09:00");
      setEndTime("10:30");
      setPriority("MEDIUM");
      setStatus("COMPLETED");
      setNotes("");
      setLearnings("");
      setTags("");
      setAttachments([]);
    }
  }, [initialTask, defaultDate, isOpen]);

  const durationMinutes = calculateDuration(startTime, endTime);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/attachments/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const data = await res.json();
        const uploaded = data.attachment;
        setAttachments((prev) => [...prev, uploaded]);

        if (uploaded.suggestedCategory && uploaded.suggestedCategory !== category) {
          toast.info(
            `AI suggested category "${uploaded.suggestedCategory}" for ${uploaded.fileName}`,
            {
              action: {
                label: "Apply",
                onClick: () => setCategory(uploaded.suggestedCategory),
              },
            }
          );
        }
      }
      toast.success("Files uploaded and AI analyzed!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a task title");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        organization,
        category,
        date,
        startTime,
        endTime,
        priority,
        status,
        notes,
        learnings,
        tags,
        attachmentIds: attachments.map((a) => a.id),
      };

      const url = initialTask ? `/api/work-logs/${initialTask.id}` : "/api/work-logs";
      const method = initialTask ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save work log");
      }

      toast.success(initialTask ? "Task updated successfully" : "Task logged successfully");
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? "Edit Work Entry" : "Log New Work Entry"}
      description="Record what you worked on, choose workplace, and attach photos."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Workplace Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Work Done For *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setOrganization("Galactic 3D")}
              className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2.5 text-xs font-bold transition-all ${
                organization === "Galactic 3D"
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-cyan-500/40"
              }`}
            >
              <span className="text-base">🚀</span>
              <span>Galactic 3D</span>
            </button>

            <button
              type="button"
              onClick={() => setOrganization("Cambridge Institute of Technology")}
              className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2.5 text-xs font-bold transition-all ${
                organization === "Cambridge Institute of Technology"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-amber-500/40"
              }`}
            >
              <span className="text-base">🎓</span>
              <span>Cambridge Institute of Technology</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 3D Model Optimization / Class Module Design"
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Detailed Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What exact deliverables or milestones were worked on?"
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Start Time, End Time & Computed Duration */}
        <div className="grid grid-cols-3 gap-3 items-end bg-muted/30 p-3 rounded-xl border border-border/50">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Start Time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              End Time
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background"
            />
          </div>

          <div className="flex flex-col justify-end">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Duration
            </span>
            <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary/10 text-primary font-bold text-sm">
              <Clock className="h-4 w-4" />
              <span>{formatMinutes(durationMinutes)}</span>
            </div>
          </div>
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Notes & Learnings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Notes / Blockers
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Technical notes, blockers, or context..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Learnings & Insights
            </label>
            <textarea
              rows={2}
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              placeholder="Key technical takeaway or new domain learning..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background resize-none"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>Tags (comma separated)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="frontend, auth, redis, pull-request"
            className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
          />
        </div>

        {/* Photos & Evidence Attachments Dropzone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Upload className="h-3.5 w-3.5 text-primary" />
              <span>Attach Photos & Evidence</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              Screenshots, Photos, PDFs
            </span>
          </label>

          {/* Drag and drop input */}
          <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-4 text-center bg-card cursor-pointer relative group">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
              {isUploading ? (
                <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>Uploading photo...</span>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-foreground">
                    Click or drag & drop photos here
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Attach screenshots, work photos, or documents
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Uploaded attachments preview grid */}
          {attachments.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {attachments.map((att) => {
                const isImg =
                  att.fileType?.startsWith("image/") ||
                  att.url?.startsWith("data:image/") ||
                  /\.(png|jpe?g|webp|gif)$/i.test(att.fileName);

                return (
                  <div
                    key={att.id}
                    className="relative group rounded-xl border border-border bg-card p-1.5 overflow-hidden flex flex-col justify-between shadow-xs"
                  >
                    {isImg ? (
                      <div className="h-24 w-full rounded-lg overflow-hidden bg-muted/40 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.url}
                          alt={att.fileName}
                          className="h-full w-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-full rounded-lg bg-muted/30 flex flex-col items-center justify-center gap-1 text-muted-foreground p-2">
                        <FileText className="h-6 w-6 text-primary" />
                        <span className="text-[10px] text-center truncate max-w-full font-medium">
                          {att.fileName}
                        </span>
                      </div>
                    )}
                    <div className="pt-1.5 flex items-center justify-between text-[11px] px-1">
                      <span className="truncate max-w-[100px] text-muted-foreground">
                        {att.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors"
                        title="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting || isUploading}>
            {isSubmitting ? "Saving..." : initialTask ? "Update Entry" : "Save Work Entry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
