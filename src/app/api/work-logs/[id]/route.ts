import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { calculateDuration } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workLog = await prisma.workLog.findFirst({
    where: {
      id: params.id,
      userId: session.id,
    },
    include: { attachments: true },
  });

  if (!workLog) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ workLog });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      priority,
      status,
      organization,
      notes,
      learnings,
      tags,
      attachmentIds,
    } = body;

    const existing = await prisma.workLog.findFirst({
      where: { id: params.id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const durationMinutes =
      startTime && endTime
        ? calculateDuration(startTime, endTime)
        : existing.durationMinutes;

    const updated = await prisma.workLog.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(date !== undefined && { date }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(organization !== undefined && { organization }),
        ...(notes !== undefined && { notes }),
        ...(learnings !== undefined && { learnings }),
        ...(tags !== undefined && { tags }),
      },
    });

    if (Array.isArray(attachmentIds)) {
      await prisma.attachment.updateMany({
        where: { id: { in: attachmentIds }, userId: session.id },
        data: { workLogId: updated.id },
      });
    }

    const complete = await prisma.workLog.findUnique({
      where: { id: updated.id },
      include: { attachments: true },
    });

    return NextResponse.json({ workLog: complete });
  } catch (error: any) {
    console.error("Error updating work log:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update work log" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.workLog.findFirst({
      where: { id: params.id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.workLog.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error: any) {
    console.error("Error deleting work log:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete work log" },
      { status: 500 }
    );
  }
}
