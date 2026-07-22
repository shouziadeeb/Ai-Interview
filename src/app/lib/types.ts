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

export type InterviewResultRecord = {
  id: string;
  title: string;
  overall_score: number | null;
  questions_answered: number;
  duration_seconds: number | null;
  strengths: string[];
  feedback_summary: string | null;
  qa_pairs: Array<{
    question: string;
    answer: string;
    feedback?: string;
  }>;
  created_at: string;
};

export type UserInterviewStats = {
  last_interview_at: string | null;
  last_score: number | null;
  best_score: number | null;
  interviews_completed: number;
  updated_at: string;
};
