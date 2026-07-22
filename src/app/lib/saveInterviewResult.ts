export type PersistableQA = {
  question: string;
  answer: string;
  feedback?: string;
};

export function extractAverageScore(qaPairs: PersistableQA[]) {
  const scores = qaPairs
    .map((pair) => {
      const match = pair.feedback?.match(/(\d{1,2})\s*\/\s*10/);
      if (!match) return null;
      const value = Number(match[1]);
      return Number.isFinite(value) ? value : null;
    })
    .filter((value): value is number => value !== null);

  if (!scores.length) return null;
  const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  return Math.round(average * 10) / 10;
}

export async function saveInterviewResult(input: {
  title?: string;
  qaPairs: PersistableQA[];
  durationSeconds?: number | null;
  strengths?: string[];
}) {
  const overallScore = extractAverageScore(input.qaPairs);
  const feedbackSummary = input.qaPairs
    .map((pair, index) => `Q${index + 1}: ${pair.feedback || "No feedback"}`)
    .join("\n")
    .slice(0, 4000);

  const response = await fetch("/api/interview-results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: input.title || "Software Engineering Interview",
      overallScore,
      questionsAnswered: input.qaPairs.length,
      durationSeconds: input.durationSeconds ?? null,
      strengths: input.strengths || [],
      feedbackSummary,
      qaPairs: input.qaPairs,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || data?.details || "Failed to save result");
  }

  return data;
}
