import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const where: any = { userId: session.id };
  if (date) where.date = date;

  try {
    const journals = await prisma.journal.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ journals });
  } catch (error: any) {
    console.error("Error fetching journals:", error);
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date, reflection, learnings, actionItems, isPrivate = true } = body;

    if (!date || !reflection) {
      return NextResponse.json(
        { error: "Date and reflection are required" },
        { status: 400 }
      );
    }

    // Check if journal for this date already exists for this user
    const existing = await prisma.journal.findFirst({
      where: { userId: session.id, date },
    });

    let journal;
    if (existing) {
      journal = await prisma.journal.update({
        where: { id: existing.id },
        data: {
          reflection,
          learnings: learnings || null,
          actionItems: actionItems || null,
          isPrivate: isPrivate !== undefined ? isPrivate : true,
        },
      });
    } else {
      journal = await prisma.journal.create({
        data: {
          userId: session.id,
          date,
          reflection,
          learnings: learnings || null,
          actionItems: actionItems || null,
          isPrivate: isPrivate !== undefined ? isPrivate : true,
        },
      });
    }

    return NextResponse.json({ journal }, { status: 200 });
  } catch (error: any) {
    console.error("Error saving journal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save journal" },
      { status: 500 }
    );
  }
}
