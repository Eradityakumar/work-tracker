import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");

  try {
    const userWhere: any = {};
    if (department && department !== "ALL") {
      userWhere.department = department;
    }

    const employees = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        designation: true,
        createdAt: true,
        workLogs: {
          select: {
            id: true,
            title: true,
            category: true,
            durationMinutes: true,
            status: true,
            date: true,
            priority: true,
          },
          orderBy: { date: "desc" },
        },
        reports: {
          select: {
            id: true,
            type: true,
            title: true,
            productivityScore: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        _count: {
          select: { attachments: true, journals: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const teamData = employees.map((emp) => {
      const totalMinutes = emp.workLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
      const completed = emp.workLogs.filter((l) => l.status === "COMPLETED").length;
      const total = emp.workLogs.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 90;
      const score = Math.min(99, Math.max(70, Math.round(completionRate * 0.75 + (totalMinutes / 120))));

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        department: emp.department,
        designation: emp.designation,
        totalTasks: total,
        completedTasks: completed,
        totalHours: +(totalMinutes / 60).toFixed(1),
        productivityScore: score,
        recentTasks: emp.workLogs.slice(0, 3),
        latestReports: emp.reports,
        filesCount: emp._count.attachments,
        journalCount: emp._count.journals,
      };
    });

    // Team aggregate metrics
    const totalTeamHours = teamData.reduce((sum, e) => sum + e.totalHours, 0);
    const totalTeamTasks = teamData.reduce((sum, e) => sum + e.totalTasks, 0);
    const avgScore = teamData.length > 0
      ? Math.round(teamData.reduce((sum, e) => sum + e.productivityScore, 0) / teamData.length)
      : 88;

    return NextResponse.json({
      team: teamData,
      summary: {
        totalEmployees: employees.length,
        totalTeamHours: +totalTeamHours.toFixed(1),
        totalTeamTasks,
        avgProductivityScore: avgScore,
      },
    });
  } catch (error: any) {
    console.error("Admin team fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch team data" }, { status: 500 });
  }
}
