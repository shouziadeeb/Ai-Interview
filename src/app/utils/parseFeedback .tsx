export function parseFeedback(raw: string) {
  const sections = {
    answer: "",
    rating: "",
    strengths: "",
    weaknesses: "",
    feedback: "",
    revised: "",
    takeaways: "",
  };

  sections.answer =
    raw.split("**Answer:**")[1]?.split("**Overall Rating:**")[0]?.trim() || "";
  sections.rating =
    raw.split("**Overall Rating:**")[1]?.split("**Strengths:**")[0]?.trim() ||
    "";
  sections.strengths =
    raw.split("**Strengths:**")[1]?.split("**Weaknesses:**")[0]?.trim() || "";
  sections.weaknesses =
    raw
      .split("**Weaknesses:**")[1]
      ?.split("**Constructive Feedback")[0]
      ?.trim() || "";
  sections.feedback =
    raw
      .split("**Constructive Feedback")[1]
      ?.split("**Revised Example Answer")[0]
      ?.trim() || "";
  sections.revised =
    raw
      .split("**Revised Example Answer")[1]
      ?.split("**Key Takeaways")[0]
      ?.trim() || "";
  sections.takeaways = raw.split("**Key Takeaways")[1]?.trim() || "";

  return sections;
}
