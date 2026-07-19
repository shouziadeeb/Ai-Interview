import { NextResponse } from "next/server";
import { ALL_BANK_QUESTIONS } from "@/app/lib/questions/questionBank";

/** Full static bank (fallback when no resume skills are available). */
export async function GET() {
  return NextResponse.json(
    ALL_BANK_QUESTIONS.map(({ question }) => ({ question }))
  );
}
