import { NextRequest, NextResponse } from "next/server";
import {
  chatWithGroqPreferred,
  extractJsonObject,
} from "@/app/lib/ai/providers";
import type { ResumeAnalysis } from "@/app/lib/types";

export const runtime = "nodejs";

const EMPTY_ANALYSIS: ResumeAnalysis = {
  name: "",
  experience: "",
  skills: [],
  technologies: [],
  projects: [],
  education: "",
};

const ANALYSIS_PROMPT = (text: string) =>
  `Extract structured resume information from the following text and return strict JSON with this shape: {"name":"","experience":"","skills":[],"technologies":[],"projects":[],"education":""}. Return only valid JSON.\n\n${text}`;

function normalizeAnalysis(raw: Partial<ResumeAnalysis>): ResumeAnalysis {
  return {
    name: raw.name || "",
    experience: raw.experience || "",
    skills: Array.isArray(raw.skills) ? raw.skills.map(String) : [],
    technologies: Array.isArray(raw.technologies) ? raw.technologies.map(String) : [],
    projects: Array.isArray(raw.projects) ? raw.projects.map(String) : [],
    education: raw.education || "",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    const completion = await chatWithGroqPreferred(
      [
        {
          role: "system",
          content: "You extract structured resume data. Reply with valid JSON only.",
        },
        {
          role: "user",
          content: ANALYSIS_PROMPT(text),
        },
      ],
      0.2
    );

    const parsed = extractJsonObject<ResumeAnalysis>(completion.content, EMPTY_ANALYSIS);
    const result = normalizeAnalysis(parsed);

    return NextResponse.json({
      ...result,
      provider: completion.provider,
      model: completion.model,
    });
  } catch (error) {
    console.error("[analyze-resume] FAILED", error);
    return NextResponse.json(
      {
        error: "Unable to analyze resume",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}
