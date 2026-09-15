import { NextRequest, NextResponse } from "next/server";
import { parseVoiceWorkLog } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawInput = body.transcript || body.summary || body.text;
    const apiKey = body.apiKey || req.headers.get("x-api-key") || undefined;

    if (!rawInput || typeof rawInput !== "string") {
      return NextResponse.json(
        { error: "Please provide a work summary or voice transcript" },
        { status: 400 }
      );
    }

    const parsed = await parseVoiceWorkLog(rawInput, apiKey);
    return NextResponse.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Parse voice error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse voice transcript" },
      { status: 500 }
    );
  }
}
