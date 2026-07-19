"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Mic,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SiteShell from "./components/SiteShell";
import {
  hasUsefulAnalysis,
  mergeResumeAnalysis,
  parseResumeText,
  type ParsedResume,
} from "./lib/parseResumeText";

const features = [
  {
    title: "Structured interview flow",
    description:
      "Move through realistic questions with a calm, executive-style experience.",
    icon: Sparkles,
  },
  {
    title: "Voice-first responses",
    description:
      "Capture your answers naturally with one-click recording and editable transcripts.",
    icon: Mic,
  },
  {
    title: "Actionable feedback",
    description:
      "Receive polished guidance that helps you refine your delivery and confidence.",
    icon: ShieldCheck,
  },
];

const RESUME_TEXT_KEY = "resumeText";
const RESUME_ANALYSIS_KEY = "resumeAnalysis";

function formatList(value?: string[]) {
  return Array.isArray(value) && value.length > 0 ? value.join(", ") : "N/A";
}

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ParsedResume | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const storedText = window.localStorage.getItem(RESUME_TEXT_KEY) || "";
      const storedAnalysisRaw = window.localStorage.getItem(RESUME_ANALYSIS_KEY);
      const storedAnalysis = storedAnalysisRaw
        ? (JSON.parse(storedAnalysisRaw) as ParsedResume)
        : null;

      if (!storedText) return;

      const localParsed = parseResumeText(storedText);
      const restored = hasUsefulAnalysis(storedAnalysis)
        ? mergeResumeAnalysis(storedAnalysis, localParsed)
        : localParsed;

      setExtractedText(storedText);
      setAnalysis(restored);
      window.localStorage.setItem(RESUME_ANALYSIS_KEY, JSON.stringify(restored));
      setMessage("Resume data restored from your browser.");
    } catch {
      // Ignore storage access issues.
    }
  }, []);

  const saveResumeData = (text: string, analysisData: ParsedResume) => {
    window.localStorage.setItem(RESUME_TEXT_KEY, text);
    window.localStorage.setItem(RESUME_ANALYSIS_KEY, JSON.stringify(analysisData));
    setExtractedText(text);
    setAnalysis(analysisData);
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      setMessage("Please choose a PDF resume first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", resumeFile);
    formData.append("userId", "demo-user");

    try {
      const uploadRes = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.details || uploadData.error || "Resume upload failed");
      }

      const nextExtractedText = uploadData.extractedText || "";
      if (!nextExtractedText) {
        throw new Error("No text could be extracted from this resume.");
      }

      const analysisRes = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nextExtractedText }),
      });
      const analysisData = await analysisRes.json();

      const localParsed = parseResumeText(nextExtractedText);
      const finalAnalysis = analysisRes.ok
        ? mergeResumeAnalysis(analysisData, localParsed)
        : localParsed;

      if (!hasUsefulAnalysis(finalAnalysis)) {
        throw new Error(analysisData.details || analysisData.error || "Resume analysis failed");
      }

      saveResumeData(nextExtractedText, finalAnalysis);
      setMessage("Resume uploaded and analyzed successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const hasResumeData = Boolean(extractedText || analysis);

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="rise-in">
              <p className="brand-font text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                MyInterview
              </p>
              <h1 className="brand-font mt-5 max-w-xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
                AI Mock Job Interview Practice
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-slate-600 sm:text-lg">
                Get ready for your next job interview with an AI coach that uses your resume
                to give tailored questions and clear feedback.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#resume"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[var(--brand-deep)]"
                >
                  Start a Free Mock Interview <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/interview"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/70 px-6 py-3 text-base font-semibold text-slate-800 transition hover:border-slate-400"
                >
                  Continue practice
                </Link>
              </div>
            </div>

            <div className="rise-in-delay relative mx-auto flex w-full max-w-md justify-center lg:max-w-none">
              <div className="hero-visual relative aspect-square w-full max-w-[420px] overflow-hidden rounded-full bg-[radial-gradient(circle_at_center,#bfdbfe_0%,#93c5fd_45%,#60a5fa_100%)]">
                <Image
                  src="/hero-coach.png"
                  alt="Candidate preparing for an AI mock interview"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 90vw, 420px"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="resume" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="soft-panel rounded-[28px] p-7 md:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Prepare
              </p>
              <h2 className="brand-font mt-3 text-3xl font-semibold text-slate-900">
                Upload your resume
              </h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                We extract your name, skills, and experience so the interview questions match
                your background.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                  />
                  <FileText className="mr-2 h-4 w-4" />
                  {resumeFile ? resumeFile.name : "Upload resume"}
                </label>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-60"
                >
                  {loading ? "Analyzing..." : "Analyze resume"}
                </button>
              </div>
              {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
            </div>

            <div className="soft-panel rounded-[28px] p-7 md:p-9">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Extracted resume
                  </p>
                  <h2 className="brand-font mt-2 text-2xl font-semibold text-slate-900">
                    Your profile data
                  </h2>
                </div>
                <span
                  className={`rounded-2xl px-3 py-1 text-sm font-medium ${
                    hasResumeData
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {hasResumeData ? "Loaded" : "Empty"}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {hasResumeData ? (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">Summary</p>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p>
                          <span className="text-slate-500">Name:</span> {analysis?.name || "N/A"}
                        </p>
                        <p>
                          <span className="text-slate-500">Skills:</span>{" "}
                          {formatList(analysis?.skills)}
                        </p>
                        <p>
                          <span className="text-slate-500">Experience:</span>{" "}
                          {analysis?.experience || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">Extracted text</p>
                      <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-slate-500">
                        {extractedText || "No extracted text saved yet."}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                    Upload a PDF resume to see your name, skills, and experience here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Features
            </p>
            <h2 className="brand-font mt-3 text-3xl font-semibold text-slate-900">
              Everything you need to practice with confidence
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="soft-panel rounded-[24px] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--mist)] text-[var(--brand)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="brand-font mt-4 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>
    </SiteShell>
  );
}
