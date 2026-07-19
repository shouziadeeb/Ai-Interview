import { createReadStream } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_WHISPER_MODEL } from "@/app/lib/ai/providers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let tempPath = "";

  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is required for speech-to-text" },
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
    const extension = (file.name?.split(".").pop() || "webm").toLowerCase();
    const tempDir = path.join(process.cwd(), ".tmp");
    tempPath = path.join(tempDir, `transcript-${Date.now()}.${extension}`);

    await mkdir(tempDir, { recursive: true });
    await writeFile(tempPath, buffer);

    const groq = getGroqClient();
    const transcription = await groq.audio.transcriptions.create({
      file: createReadStream(tempPath),
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
  } finally {
    if (tempPath) {
      await unlink(tempPath).catch(() => undefined);
    }
  }
}
