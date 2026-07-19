import { NextRequest, NextResponse } from "next/server";

const answers: { id: number; answer: string }[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json();
  answers.push({ id: body.id, answer: body.answer });
  return NextResponse.json({ message: "Answer saved" });
}

export async function GET() {
  return NextResponse.json(answers);
}