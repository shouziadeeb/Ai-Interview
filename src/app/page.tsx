"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  Github,
  Linkedin,
  Mail,
  Mic,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import SiteShell from "./components/SiteShell";
import ReviewsMarquee from "./components/ReviewsMarquee";
import {
  hasUsefulAnalysis,
  mergeResumeAnalysis,
  parseResumeText,
  type ParsedResume,
} from "./lib/parseResumeText";

const features = [
  {
    title: "Resume-aware questions",
    description:
      "Upload your PDF and get interview prompts shaped around your skills, projects, and experience — not a generic quiz.",
    icon: FileText,
  },
  {
    title: "Voice-first practice",
    description:
      "Answer out loud with live recording cues, then edit the transcript before you move to the next question.",
    icon: Mic,
  },
  {
    title: "Actionable coaching",
    description:
      "Finish a session with clear feedback on what landed well and what to tighten for the real interview.",
    icon: ShieldCheck,
  },
];

const contactLinks = [
  {
    label: "Phone",
    value: "+91 97563 04445",
    href: "tel:+919756304445",
    icon: Phone,
    hint: "Call or WhatsApp",
  },
  {
    label: "Email",
    value: "shouziadeeb123@gmail.com",
    href: "mailto:shouziadeeb123@gmail.com",
    icon: Mail,
    hint: "Best for project inquiries",
  },
  {
    label: "GitHub",
    value: "github.com/shouziadeeb",
    href: "https://github.com/shouziadeeb",
    icon: Github,
    hint: "Open source & projects",
  },
  {
    label: "LinkedIn",
    value: "Shouzab Farooqui",
    href: "https://www.linkedin.com/in/shouzab-farooqui-1a0040298/",
    icon: Linkedin,
    hint: "Professional profile",
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
              <p className="brand-font text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
                MyInterview
              </p>
              <h1 className="brand-font mt-5 max-w-xl text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl lg:text-[2.75rem]">
                AI Mock Job Interview Practice
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-[var(--muted)] sm:text-lg">
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
                  className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-3 text-base font-semibold text-[var(--ink)] transition hover:border-[var(--brand)]"
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
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Prepare
              </p>
              <h2 className="brand-font mt-3 text-3xl font-semibold text-[var(--ink)]">
                Upload your resume
              </h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-[var(--muted)]">
                We extract your name, skills, and experience so the interview questions match
                your background.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)]">
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
              {message ? <p className="mt-4 text-sm text-[var(--muted)]">{message}</p> : null}
            </div>

            <div className="soft-panel rounded-[28px] p-7 md:p-9">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Extracted resume
                  </p>
                  <h2 className="brand-font mt-2 text-2xl font-semibold text-[var(--ink)]">
                    Your profile data
                  </h2>
                </div>
                <span
                  className={`rounded-2xl px-3 py-1 text-sm font-medium ${
                    hasResumeData
                      ? "bg-[var(--success-soft)] text-[var(--success)]"
                      : "bg-[var(--surface-muted)] text-[var(--muted)]"
                  }`}
                >
                  {hasResumeData ? "Loaded" : "Empty"}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {hasResumeData ? (
                  <>
                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-4">
                      <p className="font-semibold text-[var(--ink)]">Summary</p>
                      <div className="mt-3 space-y-2 text-sm text-[var(--ink)]">
                        <p>
                          <span className="text-[var(--muted)]">Name:</span> {analysis?.name || "N/A"}
                        </p>
                        <p>
                          <span className="text-[var(--muted)]">Skills:</span>{" "}
                          {formatList(analysis?.skills)}
                        </p>
                        <p>
                          <span className="text-[var(--muted)]">Experience:</span>{" "}
                          {analysis?.experience || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--ink)]">
                      <p className="font-semibold text-[var(--ink)]">Extracted text</p>
                      <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-[var(--muted)]">
                        {extractedText || "No extracted text saved yet."}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-muted)] p-5 text-sm leading-7 text-[var(--muted)]">
                    Upload a PDF resume to see your name, skills, and experience here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Features
              </p>
              <h2 className="brand-font mt-3 text-3xl font-semibold text-[var(--ink)]">
                Everything you need to practice with confidence
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                Product capabilities that make mock interviews feel closer to the
                real thing — from resume matching to spoken answers and coaching.
              </p>
            </div>
            <a
              href="#about"
              className="shrink-0 text-sm font-semibold text-[var(--brand)] hover:underline"
            >
              Meet the creator →
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="soft-panel rounded-[24px] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--mist)] text-[var(--brand)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="brand-font mt-4 text-lg font-semibold text-[var(--ink)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <ReviewsMarquee />

        <section
          id="about"
          className="scroll-mt-24 border-t border-[var(--line)] bg-[var(--surface-muted)]/50"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                About
              </p>
              <h2 className="brand-font mt-3 text-3xl font-semibold text-[var(--ink)]">
                Built by Shouzab Farooqui
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                MyInterview is an AI mock-interview platform I created to help
                candidates practice with resume-aware questions, voice answers,
                and clear feedback — without the pressure of a real interview room.
              </p>
            </div>

            <div className="panel overflow-hidden rounded-2xl">
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)] text-white">
                    <UserRound className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                    Creator
                  </p>
                  <h3 className="brand-font mt-2 text-2xl font-semibold text-[var(--ink)]">
                    Shouzab Farooqui
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    Developer and builder focused on practical products that help
                    people prepare for real careers. MyInterview is my project —
                    designed, built, and maintained by me.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a
                      href="https://github.com/shouziadeeb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--brand)]"
                    >
                      <Github className="h-3.5 w-3.5" />
                      GitHub
                      <ArrowUpRight className="h-3 w-3 opacity-60" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/shouzab-farooqui-1a0040298/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--brand)]"
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                      LinkedIn
                      <ArrowUpRight className="h-3 w-3 opacity-60" />
                    </a>
                  </div>
                </div>

                <div id="contact" className="scroll-mt-24 p-6 sm:p-8">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                    Contact
                  </p>
                  <h3 className="brand-font mt-2 text-xl font-semibold text-[var(--ink)]">
                    Let&apos;s connect
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Have feedback or a question about MyInterview? Reach out
                    directly — I read every message.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {contactLinks.map((item) => {
                      const Icon = item.icon;
                      const external = item.href.startsWith("http");
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          {...(external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="group flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3.5 transition hover:border-[var(--brand)]"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--mist)] text-[var(--brand)]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                                {item.label}
                              </span>
                              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--muted)] opacity-0 transition group-hover:opacity-100" />
                            </span>
                            <span className="mt-0.5 block truncate text-sm font-semibold text-[var(--ink)]">
                              {item.value}
                            </span>
                            <span className="mt-0.5 block text-xs text-[var(--muted)]">
                              {item.hint}
                            </span>
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    </SiteShell>
  );
}
