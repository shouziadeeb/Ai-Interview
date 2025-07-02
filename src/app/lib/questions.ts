export const fetchQuestions = async () => {
  const res = await fetch('/api/questions');
  return res.json();
};
