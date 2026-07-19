export type QuestionCategoryId =
  | "react"
  | "javascript"
  | "typescript"
  | "html_css"
  | "nextjs"
  | "nodejs"
  | "databases"
  | "system_behavioral";

export type BankQuestion = {
  question: string;
  category: QuestionCategoryId;
  type: "technical" | "debugging" | "scenario" | "system-design" | "behavioral";
};

export type QuestionCategory = {
  id: QuestionCategoryId;
  label: string;
  /** Normalized skill aliases that map to this category */
  aliases: string[];
  questions: BankQuestion[];
};

function q(
  category: QuestionCategoryId,
  question: string,
  type: BankQuestion["type"] = "technical"
): BankQuestion {
  return { category, question, type };
}

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    id: "react",
    label: "React",
    aliases: ["react", "react.js", "reactjs", "react native", "react-native"],
    questions: [
      q("react", "What is the Virtual DOM and how does React use it?"),
      q("react", "Explain the difference between props and state in React."),
      q("react", "What are React Hooks? Name some commonly used hooks."),
      q("react", "What is the difference between useMemo and useCallback?"),
      q("react", "Explain the React rendering lifecycle."),
      q("react", "How does useEffect work?"),
      q("react", "What is Context API?"),
      q("react", "How would you prevent unnecessary re-renders?"),
      q("react", "What are controlled and uncontrolled components?"),
      q("react", "What are Higher Order Components (HOC)?"),
      q("react", "Explain React.memo."),
      q("react", "What is reconciliation in React?"),
      q("react", "How do you handle forms in React?"),
      q("react", "What is code splitting?"),
      q("react", "What are Error Boundaries?"),
      q("react", "How does Suspense work?"),
      q("react", "What are custom hooks?"),
      q("react", "What is hydration in React?"),
      q("react", "How would you implement infinite scrolling?", "scenario"),
      q("react", "Explain the difference between CSR, SSR, and SSG."),
    ],
  },
  {
    id: "javascript",
    label: "JavaScript",
    aliases: ["javascript", "js", "es6", "ecmascript"],
    questions: [
      q("javascript", "What is hoisting in JavaScript?"),
      q("javascript", "Explain closures with an example."),
      q("javascript", "What is the difference between == and ===?"),
      q("javascript", "What is event delegation?"),
      q("javascript", "What are promises?"),
      q("javascript", "How does async/await work?"),
      q("javascript", "Explain the event loop."),
      q("javascript", "What are call, apply, and bind?"),
      q("javascript", "What is prototypal inheritance?"),
      q("javascript", "Explain debounce and throttle."),
      q("javascript", "What is a shallow copy vs deep copy?"),
      q("javascript", "Explain currying in JavaScript."),
      q("javascript", "What are generators?"),
      q("javascript", "What are modules in JavaScript?"),
      q("javascript", "Explain memory leaks in JavaScript.", "debugging"),
    ],
  },
  {
    id: "typescript",
    label: "TypeScript",
    aliases: ["typescript", "ts"],
    questions: [
      q("typescript", "Why do we use TypeScript?"),
      q("typescript", "What are interfaces?"),
      q("typescript", "What is the difference between type and interface?"),
      q("typescript", "What are generics?"),
      q("typescript", "What are utility types?"),
      q("typescript", "Explain Partial, Pick, and Omit."),
      q("typescript", "What are enums?"),
      q("typescript", "What is type inference?"),
      q("typescript", "What are union and intersection types?"),
      q("typescript", "How do you type React props?"),
    ],
  },
  {
    id: "html_css",
    label: "HTML/CSS",
    aliases: ["html", "css", "html5", "css3", "tailwind", "tailwind css", "sass", "scss"],
    questions: [
      q("html_css", "Explain the CSS Box Model."),
      q("html_css", "What are semantic HTML tags?"),
      q("html_css", "What is Flexbox?"),
      q("html_css", "What is CSS Grid?"),
      q("html_css", "Difference between inline, block, and inline-block?"),
      q("html_css", "How would you implement responsive design?", "scenario"),
      q("html_css", "What is accessibility (A11Y)?"),
      q("html_css", "What is the difference between rem, em, and px?"),
      q("html_css", "What is z-index?"),
      q("html_css", "How does the browser rendering process work?"),
    ],
  },
  {
    id: "nextjs",
    label: "Next.js",
    aliases: ["next", "next.js", "nextjs"],
    questions: [
      q("nextjs", "What is Next.js?"),
      q("nextjs", "What is App Router?"),
      q("nextjs", "Difference between Pages Router and App Router?"),
      q("nextjs", "What are Server Components?"),
      q("nextjs", "What are Client Components?"),
      q("nextjs", "What is ISR?"),
      q("nextjs", "What is middleware in Next.js?"),
      q("nextjs", "How does Next.js handle image optimization?"),
      q("nextjs", "What are Server Actions?"),
      q("nextjs", "How do you implement authentication in Next.js?", "scenario"),
    ],
  },
  {
    id: "nodejs",
    label: "Node.js & Express",
    aliases: ["node", "node.js", "nodejs", "express", "express.js", "nest", "nestjs"],
    questions: [
      q("nodejs", "What is Node.js?"),
      q("nodejs", "How does the Node.js event loop work?"),
      q("nodejs", "What is Express.js?"),
      q("nodejs", "How do you create REST APIs?", "scenario"),
      q("nodejs", "What is middleware in Express?"),
      q("nodejs", "How do you handle authentication?", "scenario"),
      q("nodejs", "What is JWT?"),
      q("nodejs", "How do you upload files in Node.js?"),
      q("nodejs", "What is rate limiting?"),
      q("nodejs", "How do you handle errors in Express?", "debugging"),
    ],
  },
  {
    id: "databases",
    label: "Databases",
    aliases: [
      "sql",
      "nosql",
      "mongodb",
      "mongo",
      "postgresql",
      "postgres",
      "mysql",
      "prisma",
      "supabase",
      "database",
      "databases",
    ],
    questions: [
      q("databases", "What is SQL?"),
      q("databases", "Difference between SQL and NoSQL?"),
      q("databases", "What is MongoDB?"),
      q("databases", "What is PostgreSQL?"),
      q("databases", "What is MySQL?"),
      q("databases", "Explain primary and foreign keys."),
      q("databases", "What are joins?"),
      q("databases", "Difference between INNER JOIN and LEFT JOIN?"),
      q("databases", "What is normalization?"),
      q("databases", "What is denormalization?"),
      q("databases", "What are indexes?"),
      q("databases", "What is Prisma?"),
      q("databases", "What is Supabase?"),
      q("databases", "What are transactions?"),
      q("databases", "Explain ACID properties."),
    ],
  },
  {
    id: "system_behavioral",
    label: "System Design & Behavioral",
    aliases: ["system design", "behavioral", "soft skills"],
    questions: [
      q("system_behavioral", "How would you design a URL shortener?", "system-design"),
      q("system_behavioral", "How would you build a chat application?", "system-design"),
      q("system_behavioral", "Tell me about yourself.", "behavioral"),
      q("system_behavioral", "Describe a challenging bug you solved.", "behavioral"),
      q("system_behavioral", "How do you handle deadlines?", "behavioral"),
      q("system_behavioral", "Explain a project you are proud of.", "behavioral"),
      q("system_behavioral", "How do you approach debugging?", "debugging"),
      q("system_behavioral", "How do you handle code reviews?", "behavioral"),
      q(
        "system_behavioral",
        "How would you design a scalable notification system?",
        "system-design"
      ),
      q("system_behavioral", "Where do you see yourself in 5 years?", "behavioral"),
    ],
  },
];

export const ALL_BANK_QUESTIONS: BankQuestion[] = QUESTION_CATEGORIES.flatMap(
  (category) => category.questions
);

export function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/[._]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
