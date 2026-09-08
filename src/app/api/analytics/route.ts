import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId");
  const userId = session.role === "ADMIN" && targetUserId ? targetUserId : session.id;

  try {
    const today = format(new Date(), "yyyy-MM-dd");

    // All logs for user
    const allLogs = await prisma.workLog.findMany({
      where: { userId },
      include: { attachments: true },
      orderBy: { date: "desc" },
    });

    // Today's logs
    const todayLogs = allLogs.filter((l) => l.date === today);
    const completedToday = todayLogs.filter((l) => l.status === "COMPLETED").length;
    const todayMinutes = todayLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    const todayHours = +(todayMinutes / 60).toFixed(1);

    // Today's files uploaded
    const todayFiles = await prisma.attachment.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    // Total files
    const totalFilesCount = await prisma.attachment.count({
      where: { userId },
    });

    // Last 7 days hours trend
    const dailyTrend: { date: string; day: string; hours: number; tasks: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dStr = format(d, "yyyy-MM-dd");
      const dayLabel = format(d, "EEE");
      const logsForDay = allLogs.filter((l) => l.date === dStr);
      const mins = logsForDay.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
      dailyTrend.push({
        date: dStr,
        day: dayLabel,
        hours: +(mins / 60).toFixed(1),
        tasks: logsForDay.length,
      });
    }

    // Category distribution
    const categoryMap: Record<string, number> = {};
    allLogs.forEach((l) => {
      categoryMap[l.category] = (categoryMap[l.category] || 0) + (l.durationMinutes || 0);
    });
    const categoryDistribution = Object.entries(categoryMap).map(([name, mins]) => ({
      name,
      value: +(mins / 60).toFixed(1),
      minutes: mins,
    }));

    // Status breakdown
    const completedCount = allLogs.filter((l) => l.status === "COMPLETED").length;
    const inProgressCount = allLogs.filter((l) => l.status === "IN_PROGRESS").length;
    const pendingCount = allLogs.filter((l) => l.status === "PENDING").length;

    // Weekly Productivity Score
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const thisWeekLogs = allLogs.filter((l) => l.date >= weekStart && l.date <= weekEnd);
    const weekCompleted = thisWeekLogs.filter((l) => l.status === "COMPLETED").length;
    const weekCompletionRate = thisWeekLogs.length > 0 ? (weekCompleted / thisWeekLogs.length) * 100 : 90;
    const weeklyProductivityScore = Math.min(100, Math.round(weekCompletionRate * 0.8 + 15));

    // Recent activities (top 5 latest worklogs)
    const recentActivities = allLogs.slice(0, 5);

    // Upcoming tasks (tasks not completed)
    const upcomingTasks = allLogs.filter((l) => l.status !== "COMPLETED").slice(0, 5);

    return NextResponse.json({
      metrics: {
        completedToday,
        todayHours,
        todayFiles,
        weeklyProductivityScore,
        totalTasks: allLogs.length,
        totalFiles: totalFilesCount,
      },
      dailyTrend,
      categoryDistribution,
      statusBreakdown: [
        { name: "Completed", count: completedCount, color: "#10b981" },
        { name: "In Progress", count: inProgressCount, color: "#3b82f6" },
        { name: "Pending", count: pendingCount, color: "#f59e0b" },
      ],
      recentActivities,
      upcomingTasks,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
