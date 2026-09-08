import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const workLogs = await prisma.workLog.findMany({
      where: { userId: session.id },
    });

    const totalMinutes = workLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    const meetingMinutes = workLogs
      .filter((l) => l.category === "Meeting")
      .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    const devMinutes = workLogs
      .filter((l) => ["Development", "Design", "Research"].includes(l.category))
      .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    const otherMinutes = Math.max(0, totalMinutes - meetingMinutes - devMinutes);

    // Productivity hours analysis (count tasks start times)
    const hourCounts: Record<number, number> = {};
    workLogs.forEach((l) => {
      const h = parseInt(l.startTime.split(":")[0], 10);
      if (!isNaN(h)) {
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
    });

    // Find peak hour
    let peakHour = 10;
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([h, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(h, 10);
      }
    });

    const peakHourFormatted = `${peakHour % 12 || 12}:00 ${peakHour >= 12 ? "PM" : "AM"} – ${(peakHour + 2) % 12 || 12}:00 ${peakHour + 2 >= 12 ? "PM" : "AM"}`;

    const focusScore = totalMinutes > 0
      ? Math.min(96, Math.max(60, Math.round(((devMinutes) / totalMinutes) * 100)))
      : 88;

    const insights = [
      {
        id: "peak-hours",
        type: "PRODUCTIVITY",
        title: "Prime Execution Window",
        description: `Your highest output and completion density occurs between ${peakHourFormatted}. Protect this window from non-urgent meetings.`,
        metric: peakHourFormatted,
        badge: "Peak Performance",
      },
      {
        id: "focus-score",
        type: "FOCUS",
        title: "Deep Work Focus Ratio",
        description: `You dedicated ${Math.round((devMinutes / (totalMinutes || 1)) * 100)}% of your time to deep technical execution and design deliverables.`,
        metric: `${focusScore}/100`,
        badge: focusScore >= 80 ? "Superb Focus" : "Balanced",
      },
      {
        id: "meeting-overhead",
        type: "RECOMMENDATION",
        title: "Meeting Overhead Index",
        description: meetingMinutes > 0
          ? `Meetings accounted for ${Math.round((meetingMinutes / (totalMinutes || 1)) * 100)}% (${+(meetingMinutes / 60).toFixed(1)} hrs) of total logged time. Excellent boundary management.`
          : "Zero meeting drag recorded for this period. Maximum autonomy achieved.",
        metric: `${Math.round((meetingMinutes / (totalMinutes || 1)) * 100)}%`,
        badge: "Optimal Ratio",
      },
      {
        id: "recommendation",
        type: "RECOMMENDATION",
        title: "Continuous Learning & Evidence Rate",
        description: `${workLogs.filter((w) => w.notes || w.learnings).length} tasks have structured notes and learnings attached. This enhances team visibility and AI weekly reporting accuracy.`,
        metric: "High Fidelity",
        badge: "Verified",
      },
    ];

    return NextResponse.json({
      peakHour: peakHourFormatted,
      focusScore,
      breakdown: {
        deepWorkHours: +(devMinutes / 60).toFixed(1),
        meetingHours: +(meetingMinutes / 60).toFixed(1),
        operationsHours: +(otherMinutes / 60).toFixed(1),
        totalHours: +(totalMinutes / 60).toFixed(1),
      },
      insights,
    });
  } catch (error: any) {
    console.error("AI Insights error:", error);
    return NextResponse.json({ error: "Failed to fetch AI insights" }, { status: 500 });
  }
}
