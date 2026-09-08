import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import {
  generateDailySummary,
  generateWeeklyReport,
  generateMonthlyReport,
} from "@/lib/ai-service";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type = "DAILY", targetDate, targetUserId } = body;

    // Admins can generate or view reports for target employees
    const userId = session.role === "ADMIN" && targetUserId ? targetUserId : session.id;

    const baseDate = targetDate ? new Date(targetDate) : new Date();
    const dateStr = format(baseDate, "yyyy-MM-dd");

    let periodStart = dateStr;
    let periodEnd = dateStr;
    let title = "";
    let content = "";
    let hoursWorked = 0;
    let tasksCompleted = 0;
    let productivityScore = 85;

    if (type === "DAILY") {
      title = `Daily Work Report – ${format(baseDate, "MMMM d, yyyy")}`;
      const tasks = await prisma.workLog.findMany({
        where: { userId, date: dateStr },
      });
      const journals = await prisma.journal.findMany({
        where: { userId, date: dateStr },
      });

      const res = await generateDailySummary(tasks, journals);
      content = res.summary;
      hoursWorked = res.hoursWorked;
      tasksCompleted = res.tasksCompleted;
      productivityScore = tasks.length > 0
        ? Math.min(100, Math.round((res.tasksCompleted / tasks.length) * 100))
        : 90;
    } else if (type === "WEEKLY") {
      const s = startOfWeek(baseDate, { weekStartsOn: 1 });
      const e = endOfWeek(baseDate, { weekStartsOn: 1 });
      periodStart = format(s, "yyyy-MM-dd");
      periodEnd = format(e, "yyyy-MM-dd");
      title = `Weekly Productivity Report – Week of ${format(s, "MMM d, yyyy")}`;

      const tasks = await prisma.workLog.findMany({
        where: {
          userId,
          date: { gte: periodStart, lte: periodEnd },
        },
      });

      const res = await generateWeeklyReport(tasks, periodStart, periodEnd);
      content = res.summary;
      hoursWorked = res.hoursWorked;
      tasksCompleted = res.tasksCompleted;
      productivityScore = res.productivityScore;
    } else if (type === "MONTHLY") {
      const s = startOfMonth(baseDate);
      const e = endOfMonth(baseDate);
      periodStart = format(s, "yyyy-MM-dd");
      periodEnd = format(e, "yyyy-MM-dd");
      const monthName = format(baseDate, "MMMM yyyy");
      title = `Monthly Performance Review – ${monthName}`;

      const tasks = await prisma.workLog.findMany({
        where: {
          userId,
          date: { gte: periodStart, lte: periodEnd },
        },
      });

      const res = await generateMonthlyReport(tasks, monthName);
      content = res.summary;
      hoursWorked = res.hoursWorked;
      tasksCompleted = res.tasksCompleted;
      productivityScore = res.productivityScore;
    }

    const report = await prisma.report.create({
      data: {
        userId,
        type,
        title,
        periodStart,
        periodEnd,
        content,
        hoursWorked,
        tasksCompleted,
        productivityScore,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error: any) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
