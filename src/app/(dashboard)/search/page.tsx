"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Clock,
  FolderLock,
  Calendar,
  Tag,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { CATEGORY_COLORS, formatMinutes, formatTime12h } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{
    tasks: any[];
    journals: any[];
    files: any[];
  }>({ tasks: [], journals: [], files: [] });
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults({ tasks: [], journals: [], files: [] });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalResults =
    results.tasks.length + results.journals.length + results.files.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Workspace Search
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Find anything across deliverables, notes, learnings, tags, and evidence uploads.
        </p>
      </div>

      {/* Large Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by keyword, tag (e.g. #redis), file name, or meeting topic..."
          className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
        />
      </div>

      {/* Quick Tag Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span>Popular filters:</span>
        {["Development", "Meeting", "redis", "auth", "architecture", "design"].map(
          (tag) => (
            <button
              key={tag}
              onClick={() => handleSearch(tag)}
              className="px-2 py-0.5 rounded-md bg-muted hover:bg-accent text-[11px] font-medium transition-colors"
            >
              #{tag}
            </button>
          )
        )}
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="text-center py-12 text-xs text-muted-foreground">
          Searching workspace...
        </div>
      ) : query.trim() && totalResults === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/40">
          <p className="text-sm font-bold text-foreground">No matches found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try searching for a broader term or different keyword.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tasks Results */}
          {results.tasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>Work Logs & Tasks ({results.tasks.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.tasks.map((task) => {
                  const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;
                  return (
                    <Link
                      key={task.id}
                      href="/work-logs"
                      className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all space-y-2 block group"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.bg} ${cat.text} ${cat.border}`}>
                          {task.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {task.date}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                        <span>{formatTime12h(task.startTime)} - {formatTime12h(task.endTime)}</span>
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          View details <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Files Results */}
          {results.files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FolderLock className="h-4 w-4 text-purple-500" />
                <span>Evidence & Files ({results.files.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.files.map((file) => (
                  <Link
                    key={file.id}
                    href="/files"
                    className="p-3 rounded-xl border border-border bg-card hover:border-purple-500/50 transition-all space-y-1 block group"
                  >
                    <p className="text-xs font-bold text-foreground group-hover:text-purple-500 transition-colors truncate">
                      {file.fileName}
                    </p>
                    {file.aiSummary && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                        {file.aiSummary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Journal Results */}
          {results.journals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span>Journals & Learnings ({results.journals.length})</span>
              </h3>

              <div className="space-y-2">
                {results.journals.map((j) => (
                  <Link
                    key={j.id}
                    href="/journal"
                    className="p-3.5 rounded-xl border border-border bg-card hover:border-amber-500/50 transition-all block space-y-1 group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                      <span>{j.date}</span>
                    </div>
                    <p className="text-xs text-foreground line-clamp-2">
                      {j.reflection}
                    </p>
                    {j.learnings && (
                      <p className="text-[11px] text-muted-foreground italic">
                        Learnings: {j.learnings}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
