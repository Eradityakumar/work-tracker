import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const where: any = { userId: session.id };
  if (search) {
    where.OR = [
      { fileName: { contains: search } },
      { aiSummary: { contains: search } },
      { extractedText: { contains: search } },
    ];
  }

  try {
    const attachments = await prisma.attachment.findMany({
      where,
      include: {
        workLog: {
          select: {
            id: true,
            title: true,
            category: true,
            date: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ attachments });
  } catch (error: any) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
