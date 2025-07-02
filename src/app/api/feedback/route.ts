import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const qaPairs = body.answers; // array of { question, answer }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
  }

  const feedbacks: { question: string; feedback: string }[] = [];

  for (const { question, answer } of qaPairs) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Review the following answer to the interview question and give ratings like 10 out of 10 and give constructive feedback in easy to understand:\n\nQuestion: ${question}\nAnswer: ${answer}`
              }
            ] 
          }
        ]
      })
    });

    const result = await response.json();
    console.log(result);
    
    const feedbackText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;
    feedbacks.push({ question, feedback: feedbackText });
  }

  return NextResponse.json({ feedbacks });
}
