import { NextRequest, NextResponse } from "next/server";
import { toFile } from "groq-sdk";
import { getGroqClient, GROQ_WHISPER_MODEL } from "@/app/lib/ai/providers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is missing in this deployment. Add it in Vercel → Settings → Environment Variables, then redeploy.",
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || typeof audioFile === "string") {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const file = audioFile as File;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (!buffer.length) {
      return NextResponse.json({ error: "Audio file is empty" }, { status: 400 });
    }

    const filename = file.name || `answer-${Date.now()}.webm`;
    // In-memory upload — works on Vercel (no /var/task writes).
    const upload = await toFile(buffer, filename, {
      type: file.type || "audio/webm",
    });

    const groq = getGroqClient();
    const transcription = await groq.audio.transcriptions.create({
      file: upload,
      model: GROQ_WHISPER_MODEL,
      language: "en",
      temperature: 0.1,
    });

    return NextResponse.json({
      transcript: transcription?.text?.trim() || "",
      provider: "groq",
      model: GROQ_WHISPER_MODEL,
    });
  } catch (error: unknown) {
    console.error("[transcribe] FAILED", error);
    const message =
      error instanceof Error ? error.message : "Unable to transcribe audio right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
