"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  Lock,
  Globe,
  Save,
  Trash2,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  ListTodo,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function JournalPage() {
  const [journals, setJournals] = React.useState<any[]>([]);
  const [selectedJournal, setSelectedJournal] = React.useState<any>(null);
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [reflection, setReflection] = React.useState("");
  const [learnings, setLearnings] = React.useState("");
  const [actionItems, setActionItems] = React.useState("");
  const [isPrivate, setIsPrivate] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const fetchJournals = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const data = await res.json();
        setJournals(data.journals || []);
        // If there's an entry for today, select it by default
        const todayStr = new Date().toISOString().split("T")[0];
        const todayEntry = (data.journals || []).find((j: any) => j.date === todayStr);
        if (todayEntry) {
          loadEntry(todayEntry);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  const loadEntry = (entry: any) => {
    setSelectedJournal(entry);
    setDate(entry.date);
    setReflection(entry.reflection || "");
    setLearnings(entry.learnings || "");
    setActionItems(entry.actionItems || "");
    setIsPrivate(entry.isPrivate ?? true);
  };

  const handleNewEntry = () => {
    setSelectedJournal(null);
    setDate(new Date().toISOString().split("T")[0]);
    setReflection("");
    setLearnings("");
    setActionItems("");
    setIsPrivate(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) {
      toast.error("Please provide your daily reflection");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          reflection,
          learnings,
          actionItems,
          isPrivate,
        }),
      });

      if (!res.ok) throw new Error("Failed to save journal");

      const data = await res.json();
      toast.success("Journal saved!");
      setSelectedJournal(data.journal);
      fetchJournals();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return;

    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Entry removed");
        handleNewEntry();
        fetchJournals();
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Personal Work Journal & Notes
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capture daily reflections, continuous learnings, private thoughts, and tomorrow&apos;s action plan.
          </p>
        </div>

        <Button
          onClick={handleNewEntry}
          size="sm"
          variant="outline"
          className="text-xs font-semibold"
        >
          New Entry
        </Button>
      </div>

      {/* Main 2-column layout: Left History, Right Editor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Past Journals Sidebar (1 col) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>Journal Timeline ({journals.length})</span>
          </h3>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Loading history...
              </div>
            ) : journals.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                No past reflections found.
              </div>
            ) : (
              journals.map((j) => (
                <div
                  key={j.id}
                  onClick={() => loadEntry(j)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    selectedJournal?.id === j.id
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      {j.date}
                    </span>
                    {j.isPrivate ? (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Lock className="h-3 w-3" /> Private
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                        <Globe className="h-3 w-3" /> Shared
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {j.reflection}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor (2 cols) */}
        <div className="md:col-span-2">
          <Card className="p-6 shadow-xs">
            <form onSubmit={handleSave} className="space-y-5">
              {/* Date and Privacy Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-2.5 py-1 text-sm font-semibold rounded-lg border border-border bg-background"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isPrivate
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                    <span>{isPrivate ? "Private Journal" : "Shared with Team"}</span>
                  </button>

                  {selectedJournal && (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedJournal.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete Journal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Daily Reflection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>Daily Reflection *</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="How did the day go? What went smoothly? What blocked progress or demanded unexpected energy?"
                  className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
                />
              </div>

              {/* Key Learnings */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span>Key Technical Learnings & Domain Growth</span>
                </label>
                <textarea
                  rows={3}
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                  placeholder="What new concepts, tools, bugs, or paradigms did you learn today?"
                  className="w-full p-3 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500/40 leading-relaxed resize-none"
                />
              </div>

              {/* Future Action Items */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ListTodo className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Future Action Items & Follow-ups</span>
                </label>
                <textarea
                  rows={3}
                  value={actionItems}
                  onChange={(e) => setActionItems(e.target.value)}
                  placeholder="1. Verify database migration&#10;2. Sync with client design team&#10;3. Merge feature branch"
                  className="w-full p-3 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 leading-relaxed font-mono resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end pt-3 border-t border-border">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving Entry..." : "Save Journal Entry"}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
