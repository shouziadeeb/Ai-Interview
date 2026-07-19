import { NextRequest, NextResponse } from "next/server";
import { chatWithFallback, extractJsonObject } from "@/app/lib/ai/providers";

export const runtime = "nodejs";

type QAPair = {
  question: string;
  answer: string;
};

type FeedbackBatch = {
  feedbacks: Array<{ question: string; feedback: string }>;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const qaPairs = body?.answers as QAPair[] | undefined;

    if (!Array.isArray(qaPairs) || qaPairs.length === 0) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          feedbacks: qaPairs.map(({ question, answer }) => ({
            question,
            feedback: `You answered: "${answer}". Add GROQ_API_KEY or OPENROUTER_API_KEY to receive AI-generated coaching feedback.`,
          })),
        },
        { status: 200 }
      );
    }

    const prompt = `You are an interview coach. Review each Q&A and return constructive feedback with a score like 7/10.
Return strict JSON only in this shape:
{"feedbacks":[{"question":"...","feedback":"..."}]}

Use the exact question text from the input for each item.

Q&A pairs:
${JSON.stringify(qaPairs, null, 2)}`;

    const completion = await chatWithFallback(
      [
        {
          role: "system",
          content: "You review interview answers. Reply with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0.4 }
    );

    const parsed = extractJsonObject<FeedbackBatch>(completion.content, { feedbacks: [] });
    let feedbacks = Array.isArray(parsed.feedbacks) ? parsed.feedbacks : [];

    // Ensure every submitted answer gets a feedback entry.
    feedbacks = qaPairs.map((pair, index) => {
      const match =
        feedbacks.find((item) => item.question === pair.question) ||
        feedbacks[index];

      return {
        question: pair.question,
        feedback:
          match?.feedback?.trim() ||
          `You answered: "${pair.answer}". Add more structure, concrete examples, and a clear conclusion to strengthen this response.`,
      };
    });

    return NextResponse.json({
      feedbacks,
      provider: completion.provider,
      model: completion.model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[feedback] FAILED", message);
    return NextResponse.json(
      { error: message || "Unable to generate feedback right now." },
      { status: 502 }
    );
  }
}
