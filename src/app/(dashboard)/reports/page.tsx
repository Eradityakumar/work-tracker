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
  Printer,
  ShieldCheck,
  Code,
  Award,
  Lightbulb,
  AlertCircle,
  Building2,
  ChevronRight,
  Layers,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

// Clean inline markdown renderer that converts **bold** to clean <strong> tags with no raw asterisks
function renderFormattedInline(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const clean = part.replace(/\*([^*]+?)\*/g, "$1").replace(/`([^`]+?)`/g, "$1");
    return clean;
  });
}

function FormattedReportView({ content, tasks }: { content: string; tasks?: any[] }) {
  const sections = React.useMemo(() => {
    if (!content) return [];
    const lines = content.split("\n");
    const parsed: { title: string; level: number; lines: string[] }[] = [];
    let current = { title: "Overview", level: 1, lines: [] as string[] };

    for (const line of lines) {
      if (line.startsWith("## ")) {
        if (current.lines.length > 0 || current.title !== "Overview") {
          parsed.push(current);
        }
        current = { title: line.replace(/^##\s+/, "").replace(/^[^\w\s]+/, "").trim(), level: 2, lines: [] };
      } else if (line.startsWith("### ")) {
        if (current.lines.length > 0) {
          parsed.push(current);
        }
        current = { title: line.replace(/^###\s+/, "").replace(/^[^\w\s]+/, "").trim(), level: 3, lines: [] };
      } else {
        current.lines.push(line);
      }
    }
    if (current.lines.length > 0) parsed.push(current);
    return parsed;
  }, [content]);

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100">
      {tasks && tasks.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Layers className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Itemized Work Deliverables ({tasks.length})
                </h4>
                <p className="text-[11px] text-muted-foreground">Chronological audit of deliverables</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold">
              {tasks.filter((t) => t.status === "COMPLETED").length} Completed
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold">
                  <th className="py-2 px-2.5">Date</th>
                  <th className="py-2 px-2.5">Workplace</th>
                  <th className="py-2 px-2.5">Deliverable Title</th>
                  <th className="py-2 px-2.5">Category</th>
                  <th className="py-2 px-2.5">Time</th>
                  <th className="py-2 px-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {tasks.map((task, idx) => {
                  const isCit = (task.organization || "").includes("Cambridge");
                  return (
                    <tr key={task.id || idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2 px-2.5 text-muted-foreground whitespace-nowrap font-medium text-[11px]">
                        {task.date || "—"}
                      </td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isCit
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60"
                            : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60"
                        }`}>
                          {isCit ? "🎓 Cambridge" : "🚀 Galactic 3D"}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-medium text-foreground max-w-xs truncate">
                        {task.title}
                      </td>
                      <td className="py-2 px-2.5 text-muted-foreground whitespace-nowrap text-[11px]">
                        {task.category || "General"}
                      </td>
                      <td className="py-2 px-2.5 text-muted-foreground whitespace-nowrap text-[11px]">
                        {task.startTime || "09:00"} – {task.endTime || "10:30"}
                      </td>
                      <td className="py-2 px-2.5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.status === "COMPLETED"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60"
                            : "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60"
                        }`}>
                          {task.status || "COMPLETED"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sections.map((sec, idx) => {
        const textContent = sec.lines.join("\n").trim();
        if (!textContent && !sec.title) return null;

        const isExecutive = sec.title.toLowerCase().includes("executive") || sec.title.toLowerCase().includes("overview");
        const isLearnings = sec.title.toLowerCase().includes("learning") || sec.title.toLowerCase().includes("insight");
        const isBlockers = sec.title.toLowerCase().includes("blocker") || sec.title.toLowerCase().includes("challenge") || sec.title.toLowerCase().includes("notes");
        const isWorkplace = sec.title.toLowerCase().includes("workplace") || sec.title.toLowerCase().includes("distribution");

        return (
          <div
            key={idx}
            className={`rounded-xl border p-4 transition-all ${
              isExecutive
                ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-800/50"
                : isLearnings
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40"
                : isBlockers
                ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40"
                : "bg-card border-border shadow-sm"
            }`}
          >
            {sec.title && sec.title !== "Overview" && (
              <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-border/50">
                {isExecutive && <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                {isLearnings && <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                {isBlockers && <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                {isWorkplace && <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                {!isExecutive && !isLearnings && !isBlockers && !isWorkplace && (
                  <ChevronRight className="h-4 w-4 text-primary" />
                )}
                <h4 className="text-xs sm:text-sm font-bold tracking-wide text-foreground">
                  {sec.title}
                </h4>
              </div>
            )}

            <div className="text-xs sm:text-[13px] leading-relaxed text-foreground/90 space-y-1.5 whitespace-pre-wrap font-sans">
              {sec.lines.map((l, lIdx) => {
                const trimmed = l.trim();
                if (!trimmed) return <div key={lIdx} className="h-1.5" />;
                if (trimmed.startsWith("---")) return <hr key={lIdx} className="my-2 border-border/60" />;

                // Bullet points
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
                  const bulletText = trimmed.replace(/^[-*•]\s+/, "");
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-1">
                      <span className="text-primary mt-1 text-[10px] shrink-0">•</span>
                      <span className="flex-1">{renderFormattedInline(bulletText)}</span>
                    </div>
                  );
                }

                // Numbered list
                if (/^\d+\.\s+/.test(trimmed)) {
                  const num = trimmed.match(/^\d+\./)?.[0];
                  const rest = trimmed.replace(/^\d+\.\s+/, "");
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-1 font-medium">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">{num}</span>
                      <span className="flex-1">{renderFormattedInline(rest)}</span>
                    </div>
                  );
                }

                return <p key={lIdx}>{renderFormattedInline(trimmed)}</p>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ReportsPage() {
  const { openReportModal, refreshTrigger } = useContext(DashboardContext);
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeType, setActiveType] = React.useState("ALL");
  const [viewingReport, setViewingReport] = React.useState<any>(null);
  const [copied, setCopied] = React.useState(false);

  const [viewMode, setViewMode] = React.useState<"FORMATTED" | "RAW">("FORMATTED");

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

  const handlePrint = (report: any) => {
    if (!report) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print report");
      return;
    }

    const tasksHtml = (report.tasks || []).map((t: any, i: number) => `
      <tr>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${i + 1}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; white-space: nowrap;">${t.date || ""}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold;">${t.organization || "Galactic 3D"}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${t.title || ""}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${t.category || ""}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; white-space: nowrap;">${t.startTime || ""} – ${t.endTime || ""}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: right; font-weight: bold; color: #059669;">${t.status || "COMPLETED"}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .logo span { color: #4f46e5; }
          .meta { text-align: right; font-size: 11px; color: #64748b; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
          .kpi-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
          .kpi-val { font-size: 16px; font-weight: 800; color: #0f172a; }
          .content-block { white-space: pre-wrap; font-size: 12px; line-height: 1.6; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
          th { background: #0f172a; color: white; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; }
          @media print { body { padding: 0; } button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">WORKTRAIL <span>AI</span></div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">${report.title}</div>
            <div style="font-size: 11px; color: #64748b;">Period: ${report.periodStart} to ${report.periodEnd}</div>
          </div>
          <div class="meta">
            <div><strong>EXECUTIVE AUDIT</strong></div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Status: <strong>VERIFIED</strong></div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Hours Logged</div>
            <div class="kpi-val">${report.hoursWorked} hrs</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Tasks Completed</div>
            <div class="kpi-val">${report.tasksCompleted} deliverables</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Productivity Rating</div>
            <div class="kpi-val">${report.productivityScore}%</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Audit Engine</div>
            <div class="kpi-val">Gemini AI</div>
          </div>
        </div>

        ${tasksHtml ? `
          <h3 style="font-size: 13px; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Chronological Deliverables Audit</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Workplace</th>
                <th>Title</th>
                <th>Category</th>
                <th>Time</th>
                <th style="text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tasksHtml}
            </tbody>
          </table>
          <div style="height: 20px;"></div>
        ` : ""}

        <h3 style="font-size: 13px; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Executive Narrative & Summary</h3>
        <div class="content-block">
          ${(report.content || "")
            .split("\n")
            .map((line: string) => {
              const trimmed = line.trim();
              if (!trimmed) return "<div style='height: 6px;'></div>";
              if (trimmed.startsWith("---")) return "<hr style='border: none; border-top: 1px solid #e2e8f0; margin: 12px 0;' />";
              if (trimmed.startsWith("#### ")) {
                return `<h5 style="font-size: 11px; font-weight: bold; color: #1e293b; margin: 10px 0 3px 0;">${trimmed.replace(/^####\s+/, "").replace(/\*\*/g, "").replace(/\*/g, "")}</h5>`;
              }
              if (trimmed.startsWith("### ")) {
                return `<h4 style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 14px 0 4px 0; text-transform: uppercase;">${trimmed.replace(/^###\s+/, "").replace(/\*\*/g, "").replace(/\*/g, "")}</h4>`;
              }
              if (trimmed.startsWith("## ")) {
                return `<h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 16px 0 6px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">${trimmed.replace(/^##\s+/, "").replace(/\*\*/g, "").replace(/\*/g, "")}</h3>`;
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
                const clean = trimmed.replace(/^[-*•]\s+/, "").replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>").replace(/\*/g, "");
                return `<div style="display: flex; gap: 6px; margin-bottom: 3px; padding-left: 6px;"><span style="color: #4f46e5;">•</span><span>${clean}</span></div>`;
              }
              const cleanLine = trimmed.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>").replace(/\*/g, "");
              return `<p style="margin-bottom: 4px;">${cleanLine}</p>`;
            })
            .join("\n")}
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>WorkTrail AI Performance Tracking System</span>
          <span>Page 1 of 1 • Strictly Confidential</span>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  };

  const exportPDF = (report: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Executive Navy Top Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 26, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("WORKTRAIL AI  |  EXECUTIVE PERFORMANCE REPORT", 14, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Official Corporate Deliverables Audit  •  Generated: ${new Date().toLocaleDateString()}`, 14, 19);

      let y = 36;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(report.title || "Work Performance Audit", 14, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Reporting Scope: ${report.type}   |   Period: ${report.periodStart} to ${report.periodEnd}`, 14, y);

      y += 8;
      const boxW = (pageWidth - 28 - 9) / 4;
      const boxH = 16;
      const kpis = [
        { label: "HOURS LOGGED", val: `${report.hoursWorked} hrs` },
        { label: "TASKS DONE", val: `${report.tasksCompleted} tasks` },
        { label: "PRODUCTIVITY", val: `${report.productivityScore}%` },
        { label: "AI ENGINE", val: "Gemini AI" },
      ];

      kpis.forEach((kpi, idx) => {
        const x = 14 + idx * (boxW + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(x, y, boxW, boxH, 1.5, 1.5, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, x + 3, y + 5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(kpi.val, x + 3, y + 12);
      });

      y += boxH + 8;

      const tasks = report.tasks || [];
      if (tasks.length > 0) {
        const tableRows = tasks.map((t: any, i: number) => [
          String(i + 1),
          t.date || "",
          t.organization || "Galactic 3D",
          t.title || "",
          t.category || "",
          `${t.startTime || ""} - ${t.endTime || ""}`,
          t.status || "COMPLETED",
        ]);

        (doc as any).autoTable({
          startY: y,
          head: [["#", "Date", "Workplace", "Deliverable Title", "Category", "Time", "Status"]],
          body: tableRows,
          theme: "grid",
          headStyles: {
            fillColor: [15, 23, 42],
            textColor: 255,
            fontSize: 8,
            fontStyle: "bold",
          },
          bodyStyles: {
            fontSize: 7.5,
            textColor: [51, 65, 85],
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 20 },
            2: { cellWidth: 32 },
            3: { cellWidth: 60 },
            4: { cellWidth: 22 },
            5: { cellWidth: 24 },
            6: { cellWidth: 20, fontStyle: "bold" },
          },
          margin: { left: 14, right: 14 },
        });

        y = (doc as any).lastAutoTable.finalY + 8;
      }

      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("EXECUTIVE NARRATIVE & DELIVERABLE HIGHLIGHTS", 14, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      // Split raw content cleanly without any asterisks or markdown artifacts
      const cleanContent = (report.content || "")
        .replace(/#{1,6}\s+/g, "")
        .replace(/\*\*([^*]+?)\*\*/g, "$1")
        .replace(/\*([^*]+?)\*/g, "$1")
        .replace(/^[-*•]\s+/gm, "• ")
        .replace(/`([^`]+?)`/g, "$1")
        .replace(/\*/g, "")
        .replace(/---+/g, "")
        .trim();
      const lines = doc.splitTextToSize(cleanContent, pageWidth - 28);

      for (let i = 0; i < lines.length; i++) {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(lines[i], 14, y);
        y += 4.5;
      }

      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `WorkTrail AI • Confidential Audit Report • Page ${p} of ${totalPages}`,
          14,
          doc.internal.pageSize.getHeight() - 8
        );
      }

      doc.save(`${(report.title || "Work_Report").replace(/\s+/g, "_")}.pdf`);
      toast.success("Executive PDF exported successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  const exportExcel = (report: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const tasks = report.tasks || [];

      // Clean and organize the executive narrative rows without asterisks
      const rawLines = (report.content || "").split("\n");
      const narrativeRows: string[][] = [];

      narrativeRows.push(["EXECUTIVE NARRATIVE SUMMARY"]);
      narrativeRows.push([""]);

      for (const line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed) {
          narrativeRows.push([""]);
          continue;
        }
        if (trimmed.startsWith("---")) continue;

        // Clean out all markdown asterisks, hashes, backticks
        const clean = trimmed
          .replace(/#{1,6}\s+/g, "")
          .replace(/\*\*([^*]+?)\*\*/g, "$1")
          .replace(/\*([^*]+?)\*/g, "$1")
          .replace(/^[-*•]\s+/, "• ")
          .replace(/`([^`]+?)`/g, "$1")
          .replace(/\*/g, "")
          .trim();

        if (clean) {
          narrativeRows.push([clean.startsWith("•") ? `  ${clean}` : clean]);
        }
      }

      const summaryRows = [
        ["WORKTRAIL AI - EXECUTIVE WORK AUDIT REPORT"],
        [""],
        ["Report Title", report.title],
        ["Scope", report.type],
        ["Period Start", report.periodStart],
        ["Period End", report.periodEnd],
        ["Generated Date", new Date().toLocaleString()],
        ["Total Hours Worked", report.hoursWorked],
        ["Tasks Completed", report.tasksCompleted],
        ["Productivity Score", `${report.productivityScore}%`],
        ["Audit Engine", "Gemini AI"],
        ["Status", "VERIFIED"],
        [""],
        ...narrativeRows,
      ];

      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      wsSummary["!cols"] = [{ wch: 28 }, { wch: 70 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");

      if (tasks.length > 0) {
        const taskHeaders = [
          "#",
          "Date",
          "Workplace",
          "Deliverable Title",
          "Category",
          "Start Time",
          "End Time",
          "Status",
          "Priority",
          "Description",
          "Notes / Action Items",
          "Learnings / Insights",
          "Tags",
        ];

        const taskRows = tasks.map((t: any, idx: number) => [
          idx + 1,
          t.date || "",
          t.organization || "Galactic 3D",
          (t.title || "").replace(/\*\*/g, "").replace(/\*/g, ""),
          t.category || "",
          t.startTime || "",
          t.endTime || "",
          t.status || "COMPLETED",
          t.priority || "MEDIUM",
          (t.description || "").replace(/\*\*/g, "").replace(/\*/g, ""),
          (t.notes || "").replace(/\*\*/g, "").replace(/\*/g, ""),
          (t.learnings || "").replace(/\*\*/g, "").replace(/\*/g, ""),
          (t.tags || "").replace(/\*\*/g, "").replace(/\*/g, ""),
        ]);

        const wsTasks = XLSX.utils.aoa_to_sheet([taskHeaders, ...taskRows]);
        wsTasks["!cols"] = [
          { wch: 5 },
          { wch: 12 },
          { wch: 28 },
          { wch: 35 },
          { wch: 14 },
          { wch: 10 },
          { wch: 10 },
          { wch: 14 },
          { wch: 10 },
          { wch: 45 },
          { wch: 30 },
          { wch: 30 },
          { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(wb, wsTasks, "Itemized Deliverables");
      }

      XLSX.writeFile(wb, `${(report.title || "Work_Report").replace(/\s+/g, "_")}.xlsx`);
      toast.success("Executive Excel workbook exported successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to export Excel workbook");
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
          title="Executive Performance & Deliverables Report"
          description={`Period: ${viewingReport.periodStart} to ${viewingReport.periodEnd} | Score: ${viewingReport.productivityScore}%`}
          maxWidth="4xl"
        >
          <div className="space-y-4 pt-2">
            {/* Executive Action Header */}
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
                    <ShieldCheck className="h-3 w-3" /> OFFICIAL AUDIT
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold">
                    {viewingReport.type}
                  </Badge>
                </div>
                <h3 className="text-base font-extrabold text-foreground mt-1">
                  {viewingReport.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Period: <strong>{viewingReport.periodStart}</strong> to <strong>{viewingReport.periodEnd}</strong>
                </p>
              </div>

              {/* Action Buttons: Toggle, Copy, Print, PDF, Excel */}
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode(viewMode === "FORMATTED" ? "RAW" : "FORMATTED")}
                  className="text-xs flex items-center gap-1"
                >
                  {viewMode === "FORMATTED" ? <Code className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{viewMode === "FORMATTED" ? "Markdown" : "Formatted"}</span>
                </Button>

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
                  onClick={() => handlePrint(viewingReport)}
                  className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => exportPDF(viewingReport, e)}
                  className="text-xs flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>PDF</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => exportExcel(viewingReport, e)}
                  className="text-xs flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </Button>
              </div>
            </div>

            {/* 4 Executive KPI Ribbon Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" /> Tracked Time
                </div>
                <div className="text-lg font-black text-foreground mt-1">
                  {viewingReport.hoursWorked} <span className="text-xs font-normal text-muted-foreground">hrs</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Deliverables
                </div>
                <div className="text-lg font-black text-foreground mt-1">
                  {viewingReport.tasksCompleted} <span className="text-xs font-normal text-muted-foreground">completed</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" /> Productivity
                </div>
                <div className="text-lg font-black text-foreground mt-1">
                  {viewingReport.productivityScore}% <span className="text-xs font-normal text-muted-foreground">score</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" /> Audit Engine
                </div>
                <div className="text-lg font-black text-foreground mt-1">
                  Gemini <span className="text-xs font-normal text-muted-foreground">Verified</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 max-h-[55vh] overflow-y-auto">
              {viewMode === "FORMATTED" ? (
                <FormattedReportView content={viewingReport.content} tasks={viewingReport.tasks} />
              ) : (
                <pre className="p-4 rounded-lg bg-card text-xs font-mono whitespace-pre-wrap leading-relaxed border border-border text-foreground">
                  {viewingReport.content}
                </pre>
              )}
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
