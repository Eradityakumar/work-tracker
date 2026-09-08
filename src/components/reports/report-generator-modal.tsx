"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Download,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportGenerated?: (report: any) => void;
  defaultType?: "DAILY" | "WEEKLY" | "MONTHLY";
}

export function ReportGeneratorModal({
  isOpen,
  onClose,
  onReportGenerated,
  defaultType = "DAILY",
}: ReportGeneratorModalProps) {
  const [type, setType] = React.useState<"DAILY" | "WEEKLY" | "MONTHLY">(defaultType);
  const [targetDate, setTargetDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [reportResult, setReportResult] = React.useState<any>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (defaultType) setType(defaultType);
    setReportResult(null);
  }, [defaultType, isOpen]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, targetDate }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate report");
      }

      const data = await res.json();
      setReportResult(data.report);
      toast.success("AI Report compiled successfully!");
      if (onReportGenerated) onReportGenerated(data.report);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!reportResult?.content) return;
    navigator.clipboard.writeText(reportResult.content);
    setCopied(true);
    toast.success("Report copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPDF = () => {
    if (!reportResult) return;
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("WorkTrail AI - Executive Work Report", 14, 20);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Title: ${reportResult.title}`, 14, 30);
      doc.text(`Period: ${reportResult.periodStart} to ${reportResult.periodEnd}`, 14, 38);
      doc.text(`Hours Logged: ${reportResult.hoursWorked} hrs | Tasks Completed: ${reportResult.tasksCompleted}`, 14, 46);
      doc.text(`Productivity Score: ${reportResult.productivityScore}/100`, 14, 54);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 60, 196, 60);

      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(reportResult.content, 180);
      doc.text(splitText, 14, 70);

      doc.save(`${reportResult.title.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (err: any) {
      toast.error("Failed to generate PDF");
    }
  };

  const exportExcel = () => {
    if (!reportResult) return;
    try {
      const rows = [
        ["WorkTrail AI Report Summary"],
        ["Title", reportResult.title],
        ["Type", reportResult.type],
        ["Period Start", reportResult.periodStart],
        ["Period End", reportResult.periodEnd],
        ["Total Hours Worked", reportResult.hoursWorked],
        ["Tasks Completed", reportResult.tasksCompleted],
        ["Productivity Score", `${reportResult.productivityScore}%`],
        [""],
        ["Content"],
        [reportResult.content],
      ];

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${reportResult.title.replace(/\s+/g, "_")}.xlsx`);
      toast.success("Excel sheet exported successfully!");
    } catch (err: any) {
      toast.error("Failed to export Excel");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Performance & Work Reporting"
      description="Compile comprehensive, executive-ready reports with OpenAI intelligence."
      maxWidth="3xl"
    >
      <div className="space-y-4 pt-2">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl border border-border">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Report Scope
            </label>
            <div className="flex gap-1">
              {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    type === t
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Reference Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Synthesizing AI Report..." : "Generate Report"}</span>
            </Button>
          </div>
        </div>

        {/* Report Output View */}
        {reportResult && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-card border border-border">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {reportResult.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    {reportResult.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Logged: <strong>{reportResult.hoursWorked} hrs</strong>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Done: <strong>{reportResult.tasksCompleted} tasks</strong>
                  </span>
                  <Badge variant="success" className="text-[10px]">
                    Score: {reportResult.productivityScore}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportPDF}
                  className="text-xs flex items-center gap-1 text-rose-600 dark:text-rose-400"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>PDF</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportExcel}
                  className="text-xs flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card/60 text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-sans">
              {reportResult.content}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
