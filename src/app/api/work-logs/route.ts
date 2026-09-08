import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { calculateDuration } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const organization = searchParams.get("organization");
  const search = searchParams.get("search");

  const where: any = { userId: session.id };

  if (date) where.date = date;
  if (startDate && endDate) {
    where.date = { gte: startDate, lte: endDate };
  } else if (startDate) {
    where.date = { gte: startDate };
  } else if (endDate) {
    where.date = { lte: endDate };
  }

  if (organization && organization !== "ALL") where.organization = organization;
  if (category && category !== "ALL") where.category = category;
  if (status && status !== "ALL") where.status = status;
  if (priority && priority !== "ALL") where.priority = priority;

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { notes: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  try {
    const workLogs = await prisma.workLog.findMany({
      where,
      include: {
        attachments: true,
      },
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ workLogs });
  } catch (error: any) {
    console.error("Error fetching work logs:", error);
    return NextResponse.json({ error: "Failed to fetch work logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      category = "Development",
      date,
      startTime,
      endTime,
      priority = "MEDIUM",
      status = "COMPLETED",
      organization = "Galactic 3D",
      notes,
      learnings,
      tags,
      attachmentIds = [],
    } = body;

    if (!title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Title, date, start time, and end time are required" },
        { status: 400 }
      );
    }

    const durationMinutes = calculateDuration(startTime, endTime);

    const workLog = await prisma.workLog.create({
      data: {
        userId: session.id,
        title,
        description: description || "",
        category,
        date,
        startTime,
        endTime,
        durationMinutes,
        priority,
        status,
        organization: organization || "Galactic 3D",
        notes: notes || null,
        learnings: learnings || null,
        tags: tags || null,
      },
    });

    // Associate attachments if any
    if (attachmentIds.length > 0) {
      await prisma.attachment.updateMany({
        where: {
          id: { in: attachmentIds },
          userId: session.id,
        },
        data: {
          workLogId: workLog.id,
        },
      });
    }

    const completeLog = await prisma.workLog.findUnique({
      where: { id: workLog.id },
      include: { attachments: true },
    });

    return NextResponse.json({ workLog: completeLog }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating work log:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create work log" },
      { status: 500 }
    );
  }
}
