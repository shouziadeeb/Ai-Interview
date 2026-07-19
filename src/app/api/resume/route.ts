import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

async function extractPdfText(buffer: Buffer): Promise<string> {
  console.log("[resume/extractPdfText] START", {
    bufferLength: buffer.length,
    bufferIsBuffer: Buffer.isBuffer(buffer),
  });

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const text = (result?.text || "").trim();

    console.log("[resume/extractPdfText] SUCCESS", {
      totalLength: text.length,
      preview: text.slice(0, 200),
    });

    return text;
  } catch (error) {
    console.error("[resume/extractPdfText] FAILED", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    return "";
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

export async function POST(req: NextRequest) {
  console.log("[resume/POST] ===== REQUEST RECEIVED =====");
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId")?.toString();

    console.log("[resume/POST] Form data", {
      hasFile: Boolean(file),
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      userId,
    });

    if (!file || !userId) {
      console.error("[resume/POST] Missing file or userId");
      return NextResponse.json({ error: "Resume file and user ID are required" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    console.log("[resume/POST] File buffer ready", {
      byteLength: bytes.length,
      firstBytesHex: bytes.subarray(0, 8).toString("hex"),
      looksLikePdf: bytes.subarray(0, 5).toString("utf8") === "%PDF-",
    });

    if (bytes.subarray(0, 5).toString("utf8") !== "%PDF-") {
      console.error("[resume/POST] File is not a valid PDF");
      return NextResponse.json(
        {
          error: "Invalid PDF",
          details: `${file.name} does not look like a valid PDF file.`,
        },
        { status: 422 }
      );
    }

    const extractedText = await extractPdfText(bytes);

    console.log("[resume/POST] Extraction result", {
      extractedLength: extractedText.length,
      isEmpty: !extractedText.trim(),
      preview: extractedText.slice(0, 300),
    });

    if (!extractedText.trim()) {
      console.error("[resume/POST] No text extracted — returning 422");
      return NextResponse.json(
        {
          error: "Resume text is required",
          details: `No text could be extracted from ${file.name}. The file may be an image-only PDF or an unsupported format.`,
        },
        { status: 422 }
      );
    }

    console.log("[resume/POST] SUCCESS — returning extracted text");
    return NextResponse.json({ extractedText, message: "Resume text extracted successfully." });
  } catch (error) {
    console.error("[resume/POST] Unhandled error", error);
    return NextResponse.json({ error: "Unable to process resume" }, { status: 500 });
  }
}
