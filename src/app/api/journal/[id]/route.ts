import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.journal.findFirst({
      where: { id: params.id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    await prisma.journal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Journal deleted" });
  } catch (error: any) {
    console.error("Error deleting journal:", error);
    return NextResponse.json(
      { error: "Failed to delete journal" },
      { status: 500 }
    );
  }
}
