"use client";

import * as React from "react";
import { useContext } from "react";
import { DashboardContext } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Sparkles,
  Download,
  FileSpreadsheet,
  FileText,
  Trash2,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function ReportsPage() {
  const { openReportModal, refreshTrigger } = useContext(DashboardContext);
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeType, setActiveType] = React.useState("ALL");
  const [viewingReport, setViewingReport] = React.useState<any>(null);
  const [copied, setCopied] = React.useState(false);

  const fetchReports = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = activeType !== "ALL" ? `/api/reports?type=${activeType}` : "/api/reports";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports, refreshTrigger]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const res = await fetch(`/api/reports?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Report deleted");
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const exportPDF = (report: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("WorkTrail AI - Executive Performance Report", 14, 20);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Title: ${report.title}`, 14, 28);
      doc.text(`Type: ${report.type} | Period: ${report.periodStart} to ${report.periodEnd}`, 14, 35);
      doc.text(`Hours Logged: ${report.hoursWorked} hrs | Tasks Completed: ${report.tasksCompleted}`, 14, 42);
      doc.text(`Productivity Rating: ${report.productivityScore}%`, 14, 49);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 55, 196, 55);

      doc.setFontSize(9.5);
      const splitText = doc.splitTextToSize(report.content, 180);
      doc.text(splitText, 14, 65);

      doc.save(`${report.title.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (err: any) {
      toast.error("Failed to generate PDF");
    }
  };

  const exportExcel = (report: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const rows = [
        ["WorkTrail AI Performance Report"],
        ["Title", report.title],
        ["Type", report.type],
        ["Period Start", report.periodStart],
        ["Period End", report.periodEnd],
        ["Total Hours Worked", report.hoursWorked],
        ["Tasks Completed", report.tasksCompleted],
        ["Productivity Score", `${report.productivityScore}%`],
        [""],
        ["Content"],
        [report.content],
      ];

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${report.title.replace(/\s+/g, "_")}.xlsx`);
      toast.success("Excel sheet exported successfully!");
    } catch (err: any) {
      toast.error("Failed to export Excel");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Report content copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            AI Reports & Executive Summaries
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-generate Daily summaries, Weekly milestones, and Monthly reviews with one-click PDF & Excel export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => openReportModal("DAILY")}
            size="sm"
            className="text-xs font-semibold flex items-center gap-1.5 shadow-sm bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate New Report</span>
          </Button>
        </div>
      </div>

      {/* Scope Filter Tabs */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-1">
          {["ALL", "DAILY", "WEEKLY", "MONTHLY"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeType === type
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {type.toLowerCase()}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground">
          <strong>{reports.length}</strong> reports archived
        </span>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-muted-foreground">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <Sparkles className="h-10 w-10 text-purple-500 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No reports generated yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Synthesize your work logs, journals, and evidence into executive-ready reports with OpenAI.
          </p>
          <Button size="sm" onClick={() => openReportModal("DAILY")} className="text-xs">
            Generate Daily Report
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => setViewingReport(report)}
              className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {report.type}
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{report.productivityScore}% Score</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {report.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Period: {report.periodStart} to {report.periodEnd}
                </p>

                {/* KPI chips */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{report.hoursWorked} hrs</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{report.tasksCompleted} tasks</span>
                  </div>
                </div>

                {/* Preview text */}
                <div className="mt-3 p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted-foreground line-clamp-3 leading-relaxed font-sans">
                  {report.content.replace(/#+/g, "").trim()}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setViewingReport(report)}
                  className="h-8 px-2 text-[11px] text-primary"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Read Full
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => exportPDF(report, e)}
                    className="p-1.5 rounded-md text-rose-600 hover:bg-rose-500/10 transition-colors"
                    title="Export PDF"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => exportExcel(report, e)}
                    className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                    title="Export Excel"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(report.id, e)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Report Reader Modal */}
      {viewingReport && (
        <Modal
          isOpen={!!viewingReport}
          onClose={() => setViewingReport(null)}
          title={viewingReport.title}
          description={`Period: ${viewingReport.periodStart} to ${viewingReport.periodEnd} | Score: ${viewingReport.productivityScore}%`}
          maxWidth="4xl"
        >
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/30 border border-border text-xs">
              <div className="flex items-center gap-3">
                <span>
                  Hours: <strong>{viewingReport.hoursWorked} hrs</strong>
                </span>
                <span>
                  Deliverables: <strong>{viewingReport.tasksCompleted}</strong>
                </span>
                <Badge variant="success" className="text-[10px]">
                  Efficiency Index: {viewingReport.productivityScore}%
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(viewingReport.content)}
                  className="text-xs flex items-center gap-1"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => exportPDF(viewingReport, e)}
                  className="text-xs flex items-center gap-1 text-rose-600"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>PDF</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => exportExcel(viewingReport, e)}
                  className="text-xs flex items-center gap-1 text-emerald-600"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </Button>
              </div>
            </div>

            {/* Markdown Body */}
            <div className="p-5 rounded-xl border border-border bg-card max-h-[65vh] overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed font-sans text-foreground">
              {viewingReport.content}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingReport(null)}
                className="text-xs"
              >
                Close Report
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
