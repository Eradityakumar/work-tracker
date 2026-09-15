import { NextRequest, NextResponse } from "next/server";
import { parseVoiceWorkLog } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Please provide a voice transcript" },
        { status: 400 }
      );
    }

    const parsed = await parseVoiceWorkLog(transcript);
    return NextResponse.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Parse voice error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse voice transcript" },
      { status: 500 }
    );
  }
}
