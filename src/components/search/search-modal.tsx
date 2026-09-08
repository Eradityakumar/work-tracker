"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Search, FileText, Calendar, FolderLock, Tag, ArrowRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{ tasks: any[]; journals: any[]; files: any[] }>({
    tasks: [],
    journals: [],
    files: [],
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (!query.trim()) {
      setResults({ tasks: [], journals: [], files: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Global Workspace Search"
      description="Quickly jump to tasks, notes, files, or tags."
      maxWidth="2xl"
    >
      <div className="space-y-4 pt-1">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a keyword, tag, or document name..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
          />
          {isLoading && (
            <div className="absolute right-3 top-3 text-xs text-muted-foreground animate-pulse">
              Searching...
            </div>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {/* Tasks Results */}
          {results.tasks.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Tasks & Work Logs ({results.tasks.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleSelect(`/work-logs`)}
                    className="p-2.5 rounded-lg border border-border bg-card/60 hover:bg-accent hover:border-primary/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                          {task.title}
                        </span>
                        <Badge variant="outline" className="text-[9px]">
                          {task.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                      <span>{task.date}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files & Evidence Results */}
          {results.files.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <FolderLock className="h-3.5 w-3.5 text-emerald-500" />
                <span>Evidence & Files ({results.files.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleSelect(`/files`)}
                    className="p-2.5 rounded-lg border border-border bg-card/60 hover:bg-accent hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors truncate">
                        {file.fileName}
                      </p>
                      {file.aiSummary && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1 italic">
                          AI: {file.aiSummary}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-[9px] flex-shrink-0">
                      File
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journal Entries */}
          {results.journals.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                <span>Journal Entries ({results.journals.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.journals.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => handleSelect(`/journal`)}
                    className="p-2.5 rounded-lg border border-border bg-card/60 hover:bg-accent hover:border-purple-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {j.date}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {j.reflection}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {query.trim() &&
            results.tasks.length === 0 &&
            results.files.length === 0 &&
            results.journals.length === 0 &&
            !isLoading && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No matching results found for &ldquo;{query}&rdquo;
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
}
