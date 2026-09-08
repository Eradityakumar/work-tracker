import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ tasks: [], journals: [], files: [] });
  }

  try {
    const q = query.trim();

    const tasks = await prisma.workLog.findMany({
      where: {
        userId: session.id,
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { notes: { contains: q } },
          { learnings: { contains: q } },
          { tags: { contains: q } },
          { category: { contains: q } },
        ],
      },
      include: { attachments: true },
      take: 20,
      orderBy: { date: "desc" },
    });

    const journals = await prisma.journal.findMany({
      where: {
        userId: session.id,
        OR: [
          { reflection: { contains: q } },
          { learnings: { contains: q } },
          { actionItems: { contains: q } },
        ],
      },
      take: 10,
      orderBy: { date: "desc" },
    });

    const files = await prisma.attachment.findMany({
      where: {
        userId: session.id,
        OR: [
          { fileName: { contains: q } },
          { aiSummary: { contains: q } },
          { extractedText: { contains: q } },
        ],
      },
      include: {
        workLog: { select: { id: true, title: true } },
      },
      take: 15,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks, journals, files });
  } catch (error: any) {
    console.error("Global search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
