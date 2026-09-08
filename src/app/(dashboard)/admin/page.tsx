"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  FolderLock,
  Sparkles,
  Filter,
  FileText,
  Search,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { formatMinutes } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [teamData, setTeamData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [department, setDepartment] = React.useState("ALL");
  const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null);

  const fetchTeam = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = department !== "ALL" ? `/api/admin/team?department=${encodeURIComponent(department)}` : "/api/admin/team";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTeamData(data);
      } else {
        toast.error("Failed to load team data");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [department]);

  React.useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const summary = teamData?.summary || {
    totalEmployees: 0,
    totalTeamHours: 0,
    totalTeamTasks: 0,
    avgProductivityScore: 0,
  };

  const employees = teamData?.team || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin & Engineering Management
            </h1>
            <Badge variant="secondary" className="text-[10px] text-purple-600 bg-purple-500/10">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Manager Access
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Track team-wide deliverables, employee productivity trends, and aggregate reporting metrics.
          </p>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background"
          >
            <option value="ALL">All Departments</option>
            <option value="Core Engineering">Core Engineering</option>
            <option value="Engineering Leadership">Engineering Leadership</option>
            <option value="Product Design">Product Design</option>
            <option value="Platform & DevOps">Platform & DevOps</option>
          </select>
        </div>
      </div>

      {/* Aggregate Team KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Team Members
            </span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {loading ? "..." : summary.totalEmployees}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Active engineers & leads</p>
        </Card>

        <Card className="p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Cumulative Team Hours
            </span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {loading ? "..." : `${summary.totalTeamHours} hrs`}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Recorded deep work & syncs</p>
        </Card>

        <Card className="p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Completed Tasks
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {loading ? "..." : summary.totalTeamTasks}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Verified milestones delivered</p>
        </Card>

        <Card className="p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Avg Team Score
            </span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {loading ? "..." : `${summary.avgProductivityScore}%`}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">High team velocity</p>
        </Card>
      </div>

      {/* Employee List Table / Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span>Team Roster & Individual Output</span>
        </h2>

        {loading ? (
          <div className="text-center py-12 text-xs text-muted-foreground">
            Loading team roster...
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
            No employees found for this department.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp: any) => (
              <Card
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top user avatar and role badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {emp.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {emp.designation}
                        </p>
                      </div>
                    </div>
                    <Badge variant={emp.role === "ADMIN" ? "secondary" : "outline"} className="text-[9px]">
                      {emp.role}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Department: <strong className="text-foreground">{emp.department}</strong>
                  </p>

                  {/* KPIs */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50 text-center">
                    <div className="p-2 rounded-lg bg-muted/40">
                      <p className="text-xs font-black text-foreground">{emp.totalHours}h</p>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Hours</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40">
                      <p className="text-xs font-black text-foreground">{emp.completedTasks}</p>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Done</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40">
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {emp.productivityScore}%
                      </p>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Score</p>
                    </div>
                  </div>

                  {/* Recent tasks snippet */}
                  {emp.recentTasks && emp.recentTasks.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        Recent Activity:
                      </p>
                      {emp.recentTasks.slice(0, 2).map((t: any) => (
                        <p key={t.id} className="text-xs text-muted-foreground truncate">
                          • {t.title}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-primary font-semibold">
                  <span>View Member Dossier</span>
                  <Eye className="h-3.5 w-3.5" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Employee Dossier Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          title={`${selectedEmployee.name} – Member Dossier`}
          description={`${selectedEmployee.designation} • ${selectedEmployee.department}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 pt-2">
            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-3 p-3 rounded-xl bg-muted/30 border border-border text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Total Hours</p>
                <p className="text-lg font-black text-foreground">{selectedEmployee.totalHours} hrs</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Deliverables</p>
                <p className="text-lg font-black text-foreground">{selectedEmployee.completedTasks} tasks</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Productivity</p>
                <p className="text-lg font-black text-emerald-600">{selectedEmployee.productivityScore}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Files Logged</p>
                <p className="text-lg font-black text-purple-600">{selectedEmployee.filesCount} files</p>
              </div>
            </div>

            {/* Recent Deliverables */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recent Tasks & Deliverables
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedEmployee.recentTasks?.map((t: any) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{t.title}</span>
                      <span className="text-muted-foreground ml-2">({t.category})</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Reports */}
            {selectedEmployee.latestReports?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  AI Reports
                </h4>
                <div className="space-y-1.5">
                  {selectedEmployee.latestReports.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-foreground">{r.title}</span>
                      <span className="text-emerald-600 font-bold">{r.productivityScore}% Score</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEmployee(null)}
                className="text-xs"
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
