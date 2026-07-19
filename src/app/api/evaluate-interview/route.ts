import { NextRequest, NextResponse } from "next/server";
import {
  chatWithFallback,
  extractJsonObject,
} from "@/app/lib/ai/providers";
import type { InterviewEvaluation } from "@/app/lib/types";

export const runtime = "nodejs";

const EMPTY_EVALUATION: InterviewEvaluation = {
  overallScore: 0,
  strengths: [],
  weaknesses: [],
  suggestions: [],
  questions: [],
};

export async function POST(req: NextRequest) {
  try {
    const { questions, answers } = await req.json();

    const prompt = `You are a Senior Engineering Manager conducting a Frontend Developer interview.
Analyze the answers and provide strict JSON with this shape:
{"overallScore":85,"strengths":[],"weaknesses":[],"suggestions":[],"questions":[{"question":"","score":0,"feedback":""}]}

Questions and answers: ${JSON.stringify({ questions, answers })}
Return only valid JSON.`;

    const completion = await chatWithFallback(
      [
        {
          role: "system",
          content: "You evaluate interview answers. Reply with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0.3 }
    );

    const parsed = extractJsonObject<InterviewEvaluation>(completion.content, EMPTY_EVALUATION);

    const result: InterviewEvaluation = {
      overallScore: typeof parsed.overallScore === "number" ? parsed.overallScore : 0,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
      questions: Array.isArray(parsed.questions)
        ? parsed.questions.map((item) => ({
            question: item?.question || "",
            score: typeof item?.score === "number" ? item.score : 0,
            feedback: item?.feedback || "",
          }))
        : [],
    };

    return NextResponse.json({
      ...result,
      provider: completion.provider,
      model: completion.model,
    });
  } catch (error) {
    console.error("[evaluate-interview] FAILED", error);
    return NextResponse.json(
      {
        error: "Unable to evaluate interview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}
