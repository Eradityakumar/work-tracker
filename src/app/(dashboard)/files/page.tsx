"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Upload,
  Search,
  FolderLock,
  Download,
  Trash2,
  Eye,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";

export default function FilesPage() {
  const [files, setFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewFile, setPreviewFile] = React.useState<any>(null);

  const fetchFiles = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = search ? `/api/attachments?search=${encodeURIComponent(search)}` : "/api/attachments";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.attachments || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/attachments/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
      }
      toast.success("Files uploaded and analyzed by AI Evidence Analyzer!");
      fetchFiles();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const res = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("File deleted");
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } else {
        toast.error("Failed to delete file");
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
    toast.success(`Downloading ${file.fileName}`);
  };

  // Group files by date
  const groupedFiles: Record<string, any[]> = {};
  files.forEach((f) => {
    const dateKey = new Date(f.createdAt).toISOString().split("T")[0];
    if (!groupedFiles[dateKey]) groupedFiles[dateKey] = [];
    groupedFiles[dateKey].push(f);
  });

  const getFileIcon = (fileType: string, fileName: string) => {
    const lower = fileName.toLowerCase();
    if (fileType.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(fileName)) {
      return <ImageIcon className="h-5 w-5 text-pink-500" />;
    }
    if (fileType.includes("pdf") || lower.endsWith(".pdf")) {
      return <FileText className="h-5 w-5 text-rose-500" />;
    }
    if (fileType.includes("sheet") || fileType.includes("excel") || lower.endsWith(".xlsx")) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    }
    if (lower.endsWith(".zip") || lower.endsWith(".tar.gz")) {
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    }
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            File Evidence & Document Vault
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store and organize verifiable deliverables with instant AI OCR extraction and summarization.
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer shadow-sm transition-all active:scale-95">
          <Upload className="h-4 w-4" />
          <span>{isUploading ? "Uploading & Analyzing..." : "Upload Evidence"}</span>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.ppt,.pptx"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Drag & Drop Hero Box */}
      <div className="border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-2xl p-6 text-center bg-card relative group cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.ppt,.pptx"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Supports Screenshots, Photos, PDFs, Word, Excel Spreadsheets, and Archives
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30">
              AI OCR Text Extraction
            </Badge>
            <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">
              Automatic Categorization
            </Badge>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-card shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name or OCR keywords..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="text-xs text-muted-foreground whitespace-nowrap">
          <strong>{files.length}</strong> files stored
        </div>
      </div>

      {/* Grouped Files List */}
      {loading ? (
        <div className="text-center py-16 text-xs text-muted-foreground">
          Loading evidence vault...
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/40 space-y-2">
          <FolderLock className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No files uploaded yet</h3>
          <p className="text-xs text-muted-foreground">
            Upload screenshots or documents to provide tangible evidence for your work logs.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFiles).map(([date, dateFiles]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Uploaded on {date} ({dateFiles.length} files)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {dateFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setPreviewFile(file)}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      {/* Image Thumbnail or File Icon */}
                      {file.fileType?.startsWith("image/") ||
                      file.url?.startsWith("data:image/") ||
                      /\.(png|jpe?g|webp|gif)$/i.test(file.fileName) ? (
                        <div className="h-36 w-full rounded-lg overflow-hidden bg-muted/30 mb-2.5 relative group/thumb border border-border/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={file.url}
                            alt={file.fileName}
                            className="h-full w-full object-cover group-hover/thumb:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            Click to View Photo
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="p-3 rounded-lg bg-muted/60">
                            {getFileIcon(file.fileType, file.fileName)}
                          </div>
                        </div>
                      )}

                      {/* File Name */}
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {file.fileName}
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatBytes(file.fileSize)}
                      </p>

                      {/* AI Summary Snippet */}
                      {file.aiSummary && (
                        <div className="mt-2 p-2 rounded-lg bg-purple-500/5 border border-purple-500/10 text-[10px] text-muted-foreground line-clamp-2 italic">
                          <span className="font-semibold text-purple-600 dark:text-purple-400 not-italic">
                            AI:
                          </span>{" "}
                          {file.aiSummary}
                        </div>
                      )}

                      {/* Linked Task */}
                      {file.workLog && (
                        <p className="mt-2 text-[10px] text-primary truncate font-medium">
                          🔗 Task: {file.workLog.title}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file);
                        }}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-primary"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Preview
                      </Button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDownload(file, e)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(file.id, e)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          title={previewFile.fileName}
          description={`Size: ${formatBytes(previewFile.fileSize)} | Type: ${previewFile.fileType}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 pt-2">
            {/* Visual Preview */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 max-h-96 flex items-center justify-center overflow-hidden">
              {previewFile.fileType.startsWith("image/") ||
              /\.(png|jpe?g|webp|gif)$/i.test(previewFile.fileName) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewFile.url}
                  alt={previewFile.fileName}
                  className="max-h-80 w-auto rounded-lg object-contain shadow-sm"
                />
              ) : (
                <div className="text-center py-10 space-y-2">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-xs font-semibold text-foreground">
                    Direct visual preview not available for this binary format
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Inspect the OCR extract and AI summary below, or download the original file.
                  </p>
                </div>
              )}
            </div>

            {/* AI Summary Card */}
            {previewFile.aiSummary && (
              <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Evidence Insights</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {previewFile.aiSummary}
                </p>
              </div>
            )}

            {/* OCR Extracted Text */}
            {previewFile.extractedText && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Extracted OCR Text
                </label>
                <div className="p-3 rounded-xl border border-border bg-card font-mono text-[11px] text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {previewFile.extractedText}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleDownload(previewFile, e)}
                className="text-xs flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Original</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setPreviewFile(null)}
                className="text-xs"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
