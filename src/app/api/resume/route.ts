import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(data);
  const result = await extractText(pdf, { mergePages: true });
  const text = Array.isArray(result.text)
    ? result.text.join("\n")
    : result.text || "";
  return text.trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId")?.toString();

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Resume file and user ID are required" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    if (bytes.subarray(0, 5).toString("utf8") !== "%PDF-") {
      return NextResponse.json(
        {
          error: "Invalid PDF",
          details: `${file.name} does not look like a valid PDF file.`,
        },
        { status: 422 }
      );
    }

    let extractedText = "";
    try {
      extractedText = await extractPdfText(bytes);
    } catch (error) {
      console.error("[resume/extractPdfText] FAILED", error);
      return NextResponse.json(
        {
          error: "Unable to process resume",
          details:
            error instanceof Error
              ? error.message
              : "PDF parsing failed on the server.",
        },
        { status: 500 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        {
          error: "Resume text is required",
          details: `No text could be extracted from ${file.name}. The file may be an image-only PDF or an unsupported format.`,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      extractedText,
      message: "Resume text extracted successfully.",
    });
  } catch (error) {
    console.error("[resume/POST] Unhandled error", error);
    return NextResponse.json(
      {
        error: "Unable to process resume",
        details:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
