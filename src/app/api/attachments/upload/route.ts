import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { analyzeEvidenceFile } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const workLogId = formData.get("workLogId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type || "application/octet-stream";
    const base64 = buffer.toString("base64");
    const dataUri = `data:${fileType};base64,${base64}`;

    // Run AI Evidence Analyzer
    const aiAnalysis = await analyzeEvidenceFile(file.name, fileType, dataUri);

    const attachment = await prisma.attachment.create({
      data: {
        userId: session.id,
        workLogId: workLogId || null,
        fileName: file.name,
        fileType: fileType,
        fileSize: file.size,
        url: dataUri,
        extractedText: aiAnalysis.extractedText,
        aiSummary: aiAnalysis.aiSummary,
        suggestedCategory: aiAnalysis.suggestedCategory,
      },
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
