import { NextResponse } from 'next/server';

const questions = [
  { question: "What is the Virtual DOM and how does React use it?" },
  { question: "Explain the difference between props and state in React." },
  { question: "What are React hooks? Name a few commonly used ones." },
   { question: "What is the difference between class components and functional components in React?" },
   { question: "How does the useEffect hook work?" },
  // { question: "What is the purpose of keys in React lists?" },
  // { question: "How do you optimize the performance of a React application?" },
  // { question: "What is event delegation in JavaScript?" },
  // { question: "Explain the CSS Box Model." },
  // { question: "What is the difference between == and === in JavaScript?" },
  // { question: "What is hoisting in JavaScript?" },
  // { question: "What are promises and how do you use async/await?" },
  // { question: "Explain the difference between null and undefined." },
  // { question: "How does the browser rendering process work?" },
  // { question: "What is the difference between inline, block, and inline-block elements?" },
  // { question: "How would you implement responsive design?" },
  // { question: "What are semantic HTML tags and why are they important?" },
  // { question: "What is the difference between localStorage, sessionStorage, and cookies?" },
  // { question: "What is CORS and how do you handle it?" },
  // { question: "What is a Single Page Application (SPA)?" }
];

export async function GET() {
  return NextResponse.json(questions);
}