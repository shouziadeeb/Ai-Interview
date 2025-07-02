import { NextResponse } from 'next/server';

const answers: { id: number; answer: string }[] = [];

export async function POST(req: Request) {
  const body = await req.json();
  answers.push({ id: body.id, answer: body.answer });
  console.log(answers)
  return NextResponse.json({ message: 'Answer saved' });
}

export async function GET() {
    console.log(answers)
  return NextResponse.json(answers);
}