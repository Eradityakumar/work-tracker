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
  Printer,
  Building2,
  Clock,
  Award,
  TrendingUp,
  ShieldCheck,
  Eye,
  Code,
  Layers,
  ChevronRight,
  AlertCircle,
  Lightbulb,
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

function getTaskHours(t: any): string {
  if (t.durationHours) return `${t.durationHours} hrs`;
  if (!t.startTime || !t.endTime) return "1.5 hrs";
  const [sH, sM] = t.startTime.split(":").map(Number);
  const [eH, eM] = t.endTime.split(":").map(Number);
  if (isNaN(sH) || isNaN(eH)) return "1.5 hrs";
  const diff = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
  const mins = diff > 0 ? diff : 90;
  return `${+(mins / 60).toFixed(1)} hrs`;
}

// Clean markdown renderer into structured executive sections
function FormattedReportView({ content, tasks }: { content: string; tasks?: any[] }) {
  // Parse markdown into sections
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
      {/* Itemized Deliverables Table */}
      {tasks && tasks.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Layers className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Work Deliverables Summary ({tasks.length})
                </h4>
                <p className="text-[11px] text-muted-foreground">Title of work, description, and hours completed</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
              {tasks.length} {tasks.length === 1 ? "Deliverable" : "Deliverables"}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold">
                  <th className="py-2 px-2.5">Date</th>
                  <th className="py-2 px-2.5">Workplace</th>
                  <th className="py-2 px-2.5">Title of Work</th>
                  <th className="py-2 px-2.5">Description</th>
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">Hours Done</th>
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
                      <td className="py-2 px-2.5 font-bold text-foreground max-w-xs">
                        {(task.title || "").replace(/\*\*/g, "").replace(/\*/g, "")}
                      </td>
                      <td className="py-2 px-2.5 text-muted-foreground text-[11px] max-w-md">
                        {(task.description || "").replace(/\*\*/g, "").replace(/\*/g, "")}
                      </td>
                      <td className="py-2 px-2.5 text-right whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                        {getTaskHours(task)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Render executive sections */}
      {sections.map((sec, idx) => {
        const textContent = sec.lines.join("\n").trim();
        if (!textContent && !sec.title) return null;

        const titleLower = sec.title.toLowerCase();
        if (tasks && tasks.length > 0 && titleLower.includes("itemized") && titleLower.includes("audit")) {
          return null;
        }

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
  const [viewMode, setViewMode] = React.useState<"FORMATTED" | "RAW">("FORMATTED");

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
      toast.success("Executive AI Report compiled successfully!");
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
    toast.success("Executive Report copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // High-Resolution Executive Print View
  const handlePrint = () => {
    if (!reportResult) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print report");
      return;
    }

    const tasksHtml = (reportResult.tasks || []).map((t: any, i: number) => `
      <tr>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${i + 1}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; white-space: nowrap;">${t.date || ""}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold;">${t.organization || "Galactic 3D"}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 600;">${(t.title || "").replace(/\*\*/g, "").replace(/\*/g, "")}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #475569;">${(t.description || "").replace(/\*\*/g, "").replace(/\*/g, "")}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: right; font-weight: bold; color: #4f46e5; white-space: nowrap;">${getTaskHours(t)}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportResult.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .logo span { color: #4f46e5; }
          .meta { text-align: right; font-size: 11px; color: #64748b; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
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
            <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">${reportResult.title}</div>
            <div style="font-size: 11px; color: #64748b;">Period: ${reportResult.periodStart} to ${reportResult.periodEnd}</div>
          </div>
          <div class="meta">
            <div><strong>WORK PERFORMANCE REPORT</strong></div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Hours Worked</div>
            <div class="kpi-val">${reportResult.hoursWorked} hrs</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Tasks Completed</div>
            <div class="kpi-val">${reportResult.tasksCompleted} deliverables</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Reporting Period</div>
            <div class="kpi-val">${reportResult.periodStart} to ${reportResult.periodEnd}</div>
          </div>
        </div>

        ${tasksHtml ? `
          <h3 style="font-size: 13px; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Work Deliverables Summary</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th style="width: 80px;">Date</th>
                <th style="width: 120px;">Workplace</th>
                <th style="width: 180px;">Title of Work</th>
                <th>Description</th>
                <th style="width: 80px; text-align: right;">Hours Done</th>
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
          ${(() => {
            let content = reportResult.content || "";
            const auditIdx = content.search(/##\s*.*itemized.*audit/i);
            if (auditIdx !== -1) content = content.substring(0, auditIdx);
            return content
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
              .join("\n");
          })()}
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>WorkTrail Performance Tracking System</span>
          <span>Official Work Record</span>
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

  // Corporate PDF Export with Autotable & Executive Styling
  const exportPDF = () => {
    if (!reportResult) return;
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Navy Executive Top Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 26, "F");

      // Banner Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("WORKTRAIL  |  EXECUTIVE WORK PERFORMANCE REPORT", 14, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Official Work Deliverables Report  •  Generated: ${new Date().toLocaleDateString()}`, 14, 19);

      // Report Header
      let y = 36;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(reportResult.title || "Work Performance Report", 14, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Reporting Scope: ${reportResult.type}   |   Period: ${reportResult.periodStart} to ${reportResult.periodEnd}`, 14, y);

      // KPI Metric Tiles (3 clean tiles)
      y += 8;
      const boxW = (pageWidth - 28 - 6) / 3;
      const boxH = 16;
      const kpis = [
        { label: "TOTAL HOURS WORKED", val: `${reportResult.hoursWorked} hrs` },
        { label: "DELIVERABLES COMPLETED", val: `${reportResult.tasksCompleted} tasks` },
        { label: "REPORTING PERIOD", val: `${reportResult.periodStart} - ${reportResult.periodEnd}` },
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

      // Itemized Tasks Table with Title of Work, Description, Hours Done
      const tasks = reportResult.tasks || [];
      if (tasks.length > 0) {
        const tableRows = tasks.map((t: any, i: number) => [
          String(i + 1),
          t.date || "",
          t.organization || "Galactic 3D",
          (t.title || "").replace(/\*\*/g, "").replace(/\*/g, ""),
          (t.description || "").replace(/\*\*/g, "").replace(/\*/g, ""),
          getTaskHours(t),
        ]);

        (doc as any).autoTable({
          startY: y,
          head: [["#", "Date", "Workplace", "Title of Work", "Description", "Hours Done"]],
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
            2: { cellWidth: 28 },
            3: { cellWidth: 42, fontStyle: "bold" },
            4: { cellWidth: 64 },
            5: { cellWidth: 20, fontStyle: "bold" },
          },
          margin: { left: 14, right: 14 },
        });

        y = (doc as any).lastAutoTable.finalY + 8;
      }

      // Executive Narrative Section
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
      let rawContent = reportResult.content || "";
      const auditCutoff = rawContent.search(/##\s*.*itemized.*audit/i);
      if (auditCutoff !== -1) {
        rawContent = rawContent.substring(0, auditCutoff);
      }
      const cleanContent = rawContent
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

      // Add Page Numbers & Confidential Footer
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

      doc.save(`${(reportResult.title || "Work_Report").replace(/\s+/g, "_")}.pdf`);
      toast.success("Executive PDF exported successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  // Corporate Excel Spreadsheet Export with Multi-Table Formatting
  const exportExcel = () => {
    if (!reportResult) return;
    try {
      const tasks = reportResult.tasks || [];

      // Clean and organize the executive narrative rows without asterisks
      let rawContent = reportResult.content || "";
      const auditCutoff = rawContent.search(/##\s*.*itemized.*audit/i);
      if (auditCutoff !== -1) {
        rawContent = rawContent.substring(0, auditCutoff);
      }
      const rawLines = rawContent.split("\n");
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
        if (trimmed.toLowerCase().includes("itemized") && trimmed.toLowerCase().includes("audit")) break;

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
        ["WORKTRAIL - WORK PERFORMANCE REPORT"],
        [""],
        ["Report Title", reportResult.title],
        ["Scope", reportResult.type],
        ["Period Start", reportResult.periodStart],
        ["Period End", reportResult.periodEnd],
        ["Generated Date", new Date().toLocaleString()],
        ["Total Hours Worked", `${reportResult.hoursWorked} hrs`],
        ["Tasks Completed", reportResult.tasksCompleted],
        [""],
        ["WORK DELIVERABLES"],
        ["#", "Date", "Workplace", "Work Title", "Description", "Hours Worked"],
        ...tasks.map((t: any, idx: number) => [
          idx + 1,
          t.date || "",
          t.organization || "Galactic 3D",
          (t.title || "").replace(/\*\*/g, "").replace(/\*/g, ""),
          (t.description || "").replace(/\*\*/g, "").replace(/\*/g, ""),
          getTaskHours(t),
        ]),
        [""],
        ["EXECUTIVE SUMMARY"],
        [""],
        ...narrativeRows,
      ];

      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      wsSummary["!cols"] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 28 },
        { wch: 38 },
        { wch: 65 },
        { wch: 16 },
      ];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Work Summary");

      if (tasks.length > 0) {
        const taskHeaders = [
          "#",
          "Date",
          "Workplace",
          "Work Title",
          "Description",
          "Hours Worked",
          "Category",
          "Start Time",
          "End Time",
          "Notes",
          "Learnings",
          "Tags",
        ];

        const taskRows = tasks.map((t: any, idx: number) => [
          idx + 1,
          t.date || "",
          t.organization || "Galactic 3D",
          (t.title || "").replace(/\*\*/g, "").replace(/\*/g, ""),
          (t.description || "").replace(/\*\*/g, "").replace(/\*/g, ""),
          getTaskHours(t),
          t.category || "",
          t.startTime || "",
          t.endTime || "",
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
          { wch: 55 },
          { wch: 14 },
          { wch: 14 },
          { wch: 10 },
          { wch: 10 },
          { wch: 30 },
          { wch: 30 },
          { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(wb, wsTasks, "Deliverables Log");
      }

      XLSX.writeFile(wb, `${(reportResult.title || "Work_Report").replace(/\s+/g, "_")}.xlsx`);
      toast.success("Executive Excel workbook exported successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to export Excel workbook");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Performance & Work Deliverables Reporting"
      description="Compile comprehensive work reports powered by Gemini AI."
      maxWidth="4xl"
    >
      <div className="space-y-4 pt-2">
        {/* Scope Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-muted/40 rounded-xl border border-border">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Report Scope
            </label>
            <div className="flex gap-1">
              {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    type === t
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border/50"
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Reference Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background font-medium focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold shadow-md shadow-primary/20"
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Synthesizing AI Report..." : "Compile Report"}</span>
            </Button>
          </div>
        </div>

        {/* Results */}
        {reportResult && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border">
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  {reportResult.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Period: {reportResult.periodStart} to {reportResult.periodEnd}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode(viewMode === "FORMATTED" ? "RAW" : "FORMATTED")}
                  className="text-xs"
                >
                  {viewMode === "FORMATTED" ? "Raw Text" : "Formatted View"}
                </Button>

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
                  onClick={handlePrint}
                  className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportPDF}
                  className="text-xs flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>PDF</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportExcel}
                  className="text-xs flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </Button>
              </div>
            </div>

            {/* Executive KPI Ribbon Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" /> Total Hours Worked
                </div>
                <div className="text-lg font-black text-foreground mt-1">
                  {reportResult.hoursWorked} <span className="text-xs font-normal text-muted-foreground">hrs</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Deliverables Completed
                </div>
                <div className="text-lg font-black text-foreground mt-1">
                  {reportResult.tasksCompleted} <span className="text-xs font-normal text-muted-foreground">tasks</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" /> Reporting Scope
                </div>
                <div className="text-lg font-black text-foreground mt-1">
                  {reportResult.type} <span className="text-xs font-normal text-muted-foreground">report</span>
                </div>
              </div>
            </div>

            {/* Report Content Display */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 max-h-[480px] overflow-y-auto">
              {viewMode === "FORMATTED" ? (
                <FormattedReportView content={reportResult.content} tasks={reportResult.tasks} />
              ) : (
                <pre className="p-4 rounded-lg bg-card text-xs font-mono whitespace-pre-wrap leading-relaxed border border-border text-foreground">
                  {reportResult.content}
                </pre>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
