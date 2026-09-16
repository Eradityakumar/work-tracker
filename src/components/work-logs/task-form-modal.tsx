"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { calculateDuration, formatMinutes, CATEGORY_COLORS } from "@/lib/utils";
import { parseVoiceLocally, ParsedVoiceWorkLog } from "@/lib/voice-parser";
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
  Mic,
  MicOff,
  Square,
  Loader2,
  Wand2,
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

  // Single Summary & Voice Auto-Fill State
  const [summaryInput, setSummaryInput] = React.useState("");
  const [isListening, setIsListening] = React.useState(false);
  const [isAutoFilling, setIsAutoFilling] = React.useState(false);
  const [voiceTranscript, setVoiceTranscript] = React.useState("");
  const recognitionRef = React.useRef<any>(null);
  const transcriptRef = React.useRef("");

  const applyParsedData = (data: ParsedVoiceWorkLog) => {
    if (data.organization) setOrganization(data.organization);
    if (data.title) setTitle(data.title);
    if (data.description) setDescription(data.description);
    if (data.category) setCategory(data.category);
    if (data.date) {
      let d = data.date.trim();
      const dmy = d.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (dmy) {
        d = `${dmy[3]}-${String(dmy[2]).padStart(2, "0")}-${String(dmy[1]).padStart(2, "0")}`;
      }
      setDate(d);
    }
    if (data.startTime) setStartTime(data.startTime);
    if (data.endTime) setEndTime(data.endTime);
    if (data.priority) setPriority(data.priority);
    if (data.status) setStatus(data.status);
    if (data.notes !== undefined) setNotes(data.notes);
    if (data.learnings !== undefined) setLearnings(data.learnings);
    if (data.tags !== undefined) setTags(data.tags);
  };

  const processSummaryAutoFill = async (textToProcess?: string) => {
    const targetText = (typeof textToProcess === "string" ? textToProcess : summaryInput).trim();
    if (!targetText) {
      toast.info("Please paste or type a summary first, or tap the mic to speak.");
      return;
    }

    setIsAutoFilling(true);
    toast.info("AI is analyzing summary and auto-filling all spaces...", { duration: 3000 });

    try {
      const savedKey = typeof window !== "undefined" ? localStorage.getItem("worktrail_ai_key") || "" : "";
      // Call AI endpoint first
      const res = await fetch("/api/ai/parse-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: targetText, transcript: targetText, apiKey: savedKey }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result && result.data) {
          applyParsedData(result.data);
          toast.success("✨ All form fields auto-filled successfully!");
          return;
        }
      }

      // Fallback to intelligent local parser
      const localParsed = parseVoiceLocally(targetText);
      applyParsedData(localParsed);
      toast.success("✨ Auto-filled all spaces from summary!");
    } catch (err: any) {
      console.warn("AI parsing fallback to local parser:", err);
      const localParsed = parseVoiceLocally(targetText);
      applyParsedData(localParsed);
      toast.success("✨ Auto-filled all spaces from summary!");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSummaryPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted && pasted.trim()) {
      setSummaryInput(pasted);
      // Auto-trigger parsing on paste for instantaneous 1-step workflow
      setTimeout(() => {
        processSummaryAutoFill(pasted);
      }, 50);
    }
  };

  const startSmartVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    transcriptRef.current = "";
    setVoiceTranscript("");
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const current = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(" ");
      transcriptRef.current = current;
      setVoiceTranscript(current);
      setSummaryInput(current);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event);
      if (event.error !== "no-speech") {
        toast.error(`Voice error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcriptRef.current.trim()) {
        processSummaryAutoFill(transcriptRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    toast.info("🎙️ Listening... Speak your workplace, task, times, and takeaways!", { duration: 4000 });
  };

  const stopSmartVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    if (transcriptRef.current.trim()) {
      processSummaryAutoFill(transcriptRef.current);
    }
  };

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
        {/* DUAL SMART AI QUICK AUTO-FILL (COPY-PASTE SUMMARY & VOICE) */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            isListening
              ? "border-rose-500 bg-rose-500/10 shadow-lg ring-2 ring-rose-500/30 animate-pulse"
              : isAutoFilling
              ? "border-primary bg-primary/10 shadow-md animate-pulse"
              : "border-primary/30 bg-gradient-to-r from-primary/10 via-violet-500/10 to-cyan-500/10 shadow-sm hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                  isListening
                    ? "bg-rose-500 text-white animate-bounce shadow-md"
                    : isAutoFilling
                    ? "bg-primary text-primary-foreground shadow-md animate-spin"
                    : "bg-primary text-primary-foreground shadow"
                }`}
              >
                {isAutoFilling ? (
                  <Loader2 className="h-4 w-4" />
                ) : isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                  <span>Smart AI Quick Auto-Fill</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    Paste or Speak = All Spaces Filled
                  </span>
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  {isListening
                    ? "Listening... Speak your workplace, task, times, priority, and progress!"
                    : isAutoFilling
                    ? "AI is analyzing and populating every space below..."
                    : "Paste any raw summary, message, or notes — or speak — and AI fills every field automatically!"}
                </p>
              </div>
            </div>
          </div>

          {/* SINGLE SUMMARY / DESCRIPTION INPUT */}
          <div className="relative mt-2">
            <textarea
              rows={2}
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              onPaste={handleSummaryPaste}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  processSummaryAutoFill();
                }
              }}
              placeholder="📋 Paste your single summary or description here (e.g. 'Electric 3D was there today so was working on meetings with Bass Aerospace and also figuring out previous orders and tracking them')..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border/80 bg-background/90 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-y shadow-inner"
            />
          </div>

          {/* ACTION BUTTONS: AUTO-FILL ALL SPACES + SPEAK */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isAutoFilling || !summaryInput.trim()}
                onClick={() => processSummaryAutoFill(summaryInput)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                {isAutoFilling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Auto-Filling All Spaces...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>✨ Auto-Fill All Spaces</span>
                  </>
                )}
              </button>

              {summaryInput.trim() && (
                <button
                  type="button"
                  onClick={() => setSummaryInput("")}
                  className="px-2.5 py-2 rounded-xl border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-semibold transition-all cursor-pointer"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const current = localStorage.getItem("worktrail_ai_key") || "";
                  const key = prompt(
                    "Optional: Enter your free Google Gemini API Key or OpenAI Key for 100% LLM AI accuracy (Leave empty to use built-in smart NLP):",
                    current
                  );
                  if (key !== null) {
                    if (key.trim()) {
                      localStorage.setItem("worktrail_ai_key", key.trim());
                      toast.success("AI Key saved! Powered by full LLM intelligence.");
                    } else {
                      localStorage.removeItem("worktrail_ai_key");
                      toast.info("Using embedded smart NLP parser.");
                    }
                  }
                }}
                className="px-2.5 py-2 rounded-xl border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                title="Configure Gemini or OpenAI API Key"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">AI Model</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isListening ? (
                <button
                  type="button"
                  onClick={stopSmartVoice}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Stop & Auto-Fill</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isAutoFilling}
                  onClick={startSmartVoice}
                  className="px-3.5 py-2 rounded-xl border border-primary/40 bg-card hover:bg-accent text-foreground font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Mic className="h-3.5 w-3.5 text-rose-500" />
                  <span>Tap to Speak</span>
                </button>
              )}
            </div>
          </div>

          {voiceTranscript && (
            <div className="mt-2.5 pt-2 border-t border-border/40 text-[11px] sm:text-xs text-foreground/80 bg-background/60 rounded-lg p-2 italic">
              <span className="font-semibold text-primary not-italic">Recognized Speech: </span>
              &ldquo;{voiceTranscript}&rdquo;
            </div>
          )}
        </div>

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
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Task Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 3D Model Optimization / Class Module Design"
            className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Detailed Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What exact deliverables or milestones were worked on?"
            className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Notes / Blockers
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Technical notes, blockers, or context..."
              className="w-full px-3 py-2 text-base sm:text-xs rounded-lg border border-border bg-background resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Learnings & Insights
            </label>
            <textarea
              rows={2}
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              placeholder="Key technical takeaway or new domain learning..."
              className="w-full px-3 py-2 text-base sm:text-xs rounded-lg border border-border bg-background resize-none"
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
            className="w-full px-3 py-2 text-base sm:text-xs rounded-lg border border-border bg-background"
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
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 sm:flex-none h-11 sm:h-9 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || isUploading}
            className="flex-1 sm:flex-none h-11 sm:h-9 text-xs font-bold shadow-md shadow-primary/20"
          >
            {isSubmitting ? "Saving..." : initialTask ? "Update Entry" : "Save Work Entry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
