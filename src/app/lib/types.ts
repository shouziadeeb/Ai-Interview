export type UserProfile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

export type ResumeRecord = {
  id?: string;
  user_id?: string;
  file_name?: string;
  file_url?: string;
  extracted_text?: string;
  analysis?: ResumeAnalysis | null;
  created_at?: string;
};

export type ResumeAnalysis = {
  name: string;
  experience: string;
  skills: string[];
  technologies: string[];
  projects: string[];
  education: string;
};

export type InterviewQuestion = {
  id: number;
  type: string;
  question: string;
};

export type InterviewAnswer = {
  question: string;
  answer: string;
  transcript: string;
  timeTaken: number;
};

export type InterviewEvaluation = {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  questions: Array<{
    question: string;
    score: number;
    feedback: string;
  }>;
};
