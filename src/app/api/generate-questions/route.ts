import { NextRequest, NextResponse } from "next/server";
import {
  chatWithFallback,
  extractJsonObject,
} from "@/app/lib/ai/providers";
import type { InterviewQuestion } from "@/app/lib/types";
import { matchSkillsToBank, pickBankQuestions } from "@/app/lib/questions/matchSkills";
import { ALL_BANK_QUESTIONS } from "@/app/lib/questions/questionBank";

export const runtime = "nodejs";

type GenerateQuestionsResponse = {
  questions: InterviewQuestion[];
};

const EMPTY: GenerateQuestionsResponse = { questions: [] };

async function generateQuestionsForMissingSkills(options: {
  unmatchedSkills: string[];
  experience?: string;
  projects?: string[] | string;
  count: number;
}): Promise<{ questions: InterviewQuestion[]; provider?: string; model?: string }> {
  const { unmatchedSkills, experience, projects, count } = options;
  if (!unmatchedSkills.length || count <= 0) {
    return { questions: [] };
  }

  const prompt = `Create ${count} interview questions ONLY for these skills that are missing from our question bank:
Skills to cover: ${unmatchedSkills.join(", ")}
Candidate experience: ${experience || "N/A"}
Projects: ${Array.isArray(projects) ? projects.join(", ") : projects || "N/A"}

Do NOT generate questions for React, JavaScript, TypeScript, HTML, CSS, Next.js, Node.js, Express, or common databases — those are already covered.

Return strict JSON:
{"questions":[{"id":1,"type":"technical","question":""}]}
Return only valid JSON.`;

  const completion = await chatWithFallback(
    [
      {
        role: "system",
        content:
          "You generate interview questions only for requested missing skills. Reply with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    { temperature: 0.4 }
  );

  const parsed = extractJsonObject<GenerateQuestionsResponse>(completion.content, EMPTY);
  const questions = Array.isArray(parsed.questions)
    ? parsed.questions
        .filter((item) => item && typeof item.question === "string" && item.question.trim())
        .map((item, index) => ({
          id: typeof item.id === "number" ? item.id : index + 1,
          type: item.type || "technical",
          question: item.question.trim(),
        }))
    : [];

  return {
    questions,
    provider: completion.provider,
    model: completion.model,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const skills = [
      ...(Array.isArray(body.skills) ? body.skills : []),
      ...(Array.isArray(body.technologies) ? body.technologies : []),
    ];
    const { experience, projects } = body;

    const match = matchSkillsToBank(skills);
    const bankTarget =
      match.unmatchedSkills.length > 0
        ? Math.max(6, 10 - Math.min(4, match.unmatchedSkills.length))
        : 10;

    const bankPicked = pickBankQuestions(match, bankTarget).map((item, index) => ({
      id: index + 1,
      type: item.type,
      question: item.question,
      source: "bank" as const,
      category: item.category,
    }));

    let aiQuestions: InterviewQuestion[] = [];
    let provider: string | undefined;
    let model: string | undefined;

    // AI only for skills that are NOT already covered by the static list.
    if (match.unmatchedSkills.length > 0) {
      const aiCount = Math.min(4, Math.max(2, match.unmatchedSkills.length * 2));
      try {
        const generated = await generateQuestionsForMissingSkills({
          unmatchedSkills: match.unmatchedSkills,
          experience,
          projects,
          count: aiCount,
        });
        aiQuestions = generated.questions.map((item, index) => ({
          ...item,
          id: bankPicked.length + index + 1,
        }));
        provider = generated.provider;
        model = generated.model;
      } catch (error) {
        console.warn(
          "[generate-questions] AI generation for unmatched skills failed:",
          error instanceof Error ? error.message : error
        );
      }
    }

    const questions = [
      ...bankPicked.map(({ id, type, question }) => ({ id, type, question })),
      ...aiQuestions,
    ];

    // Absolute fallback if nothing matched and AI failed.
    const finalQuestions =
      questions.length > 0
        ? questions
        : ALL_BANK_QUESTIONS.slice(0, 10).map((item, index) => ({
            id: index + 1,
            type: item.type,
            question: item.question,
          }));

    return NextResponse.json({
      questions: finalQuestions,
      matchedSkills: match.matchedSkills,
      unmatchedSkills: match.unmatchedSkills,
      matchedCategories: match.matchedCategories.map((category) => category.label),
      bankCount: bankPicked.length,
      aiCount: aiQuestions.length,
      provider: provider || (bankPicked.length ? "question-bank" : undefined),
      model,
    });
  } catch (error) {
    console.error("[generate-questions] FAILED", error);
    return NextResponse.json(
      {
        error: "Unable to generate questions",
        details: error instanceof Error ? error.message : "Unknown error",
        questions: [],
      },
      { status: 502 }
    );
  }
}
