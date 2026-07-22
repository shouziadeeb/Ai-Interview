import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export const runtime = "nodejs";

const MAX_RESULTS_PER_USER = 5;

type QAPairPayload = {
  question: string;
  answer: string;
  feedback?: string;
};

type SaveBody = {
  title?: string;
  overallScore?: number | null;
  questionsAnswered?: number;
  durationSeconds?: number | null;
  strengths?: string[];
  feedbackSummary?: string | null;
  qaPairs?: QAPairPayload[];
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ data: results, error: resultsError }, { data: stats, error: statsError }] =
      await Promise.all([
        supabase
          .from("interview_results")
          .select(
            "id, title, overall_score, questions_answered, duration_seconds, strengths, feedback_summary, qa_pairs, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(MAX_RESULTS_PER_USER),
        supabase
          .from("user_interview_stats")
          .select(
            "last_interview_at, last_score, best_score, interviews_completed, updated_at"
          )
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

    if (resultsError || statsError) {
      return NextResponse.json(
        {
          error: "Unable to load interview history",
          details: resultsError?.message || statsError?.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      results: results || [],
      stats: stats || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to load interview history",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SaveBody;
    const qaPairs = Array.isArray(body.qaPairs) ? body.qaPairs : [];
    const overallScore =
      typeof body.overallScore === "number" ? body.overallScore : null;
    const questionsAnswered =
      typeof body.questionsAnswered === "number"
        ? body.questionsAnswered
        : qaPairs.length;
    const title = body.title?.trim() || "Software Engineering Interview";
    const strengths = Array.isArray(body.strengths)
      ? body.strengths.map(String)
      : [];

    const { data: inserted, error: insertError } = await supabase
      .from("interview_results")
      .insert({
        user_id: user.id,
        title,
        overall_score: overallScore,
        questions_answered: questionsAnswered,
        duration_seconds:
          typeof body.durationSeconds === "number" ? body.durationSeconds : null,
        strengths,
        feedback_summary: body.feedbackSummary || null,
        qa_pairs: qaPairs,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          error: "Unable to save interview result",
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    const { data: existing } = await supabase
      .from("interview_results")
      .select("id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const overflow = (existing || []).slice(MAX_RESULTS_PER_USER);
    if (overflow.length > 0) {
      await supabase
        .from("interview_results")
        .delete()
        .in(
          "id",
          overflow.map((row) => row.id)
        );
    }

    const { data: currentStats } = await supabase
      .from("user_interview_stats")
      .select("best_score, interviews_completed")
      .eq("user_id", user.id)
      .maybeSingle();

    const previousBest =
      typeof currentStats?.best_score === "number"
        ? currentStats.best_score
        : null;
    const bestScore =
      overallScore === null
        ? previousBest
        : previousBest === null
          ? overallScore
          : Math.max(previousBest, overallScore);

    await supabase.from("user_interview_stats").upsert({
      user_id: user.id,
      last_interview_at: new Date().toISOString(),
      last_score: overallScore,
      best_score: bestScore,
      interviews_completed: (currentStats?.interviews_completed || 0) + 1,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      id: inserted.id,
      createdAt: inserted.created_at,
      kept: MAX_RESULTS_PER_USER,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to save interview result",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
