export type ParsedResume = {
  name: string;
  experience: string;
  skills: string[];
  technologies: string[];
  projects: string[];
  education: string;
};

const SECTION_HEADERS =
  /^(SUMMARY|OBJECTIVE|SKILLS|TECHNICAL SKILLS|TECHNOLOGIES|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|PROJECTS|EDUCATION|CERTIFICATIONS|ACHIEVEMENTS|INTERESTS|LANGUAGES)\s*:?\s*$/i;

function splitSections(text: string): Record<string, string> {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sections: Record<string, string[]> = { HEADER: [] };
  let current = "HEADER";

  for (const line of lines) {
    if (SECTION_HEADERS.test(line)) {
      current = line.replace(/:$/, "").toUpperCase();
      if (!sections[current]) sections[current] = [];
      continue;
    }
    if (!sections[current]) sections[current] = [];
    sections[current].push(line);
  }

  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [key, value.join("\n")])
  );
}

function extractName(header: string, fullText: string): string {
  const headerLines = header
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of headerLines.slice(0, 4)) {
    const looksLikeContact =
      /@|https?:\/\/|\d{10}|\|/.test(line) ||
      /linkedin|github|portfolio|gmail|email/i.test(line);
    const looksLikeName =
      /^[A-Za-z][A-Za-z .'-]{2,60}$/.test(line) &&
      line.split(/\s+/).length <= 5 &&
      !SECTION_HEADERS.test(line);

    if (!looksLikeContact && looksLikeName) {
      return line;
    }
  }

  const firstLine = fullText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (firstLine && /^[A-Za-z][A-Za-z .'-]{2,60}$/.test(firstLine)) {
    return firstLine;
  }

  return "";
}

function extractSkills(sections: Record<string, string>, fullText: string): string[] {
  const skillBlock =
    sections.SKILLS ||
    sections["TECHNICAL SKILLS"] ||
    sections.TECHNOLOGIES ||
    "";

  const source = skillBlock || fullText;
  const chunks = source
    .split(/[\n,|/•·]/)
    .map((item) => item.replace(/^[\-\*\d.\s]+/, "").replace(/^[A-Za-z ]+:\s*/, "").trim())
    .filter((item) => item.length >= 2 && item.length <= 40)
    .filter((item) => !SECTION_HEADERS.test(item))
    .filter((item) => !/^\d+$/.test(item));

  const unique = Array.from(new Set(chunks.map((item) => item.replace(/\s+/g, " "))));
  return unique.slice(0, 30);
}

function extractExperience(sections: Record<string, string>): string {
  const experience =
    sections.EXPERIENCE ||
    sections["WORK EXPERIENCE"] ||
    sections["PROFESSIONAL EXPERIENCE"] ||
    "";

  if (!experience) return "";

  const firstJobs = experience
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);

  return firstJobs.join(" | ");
}

function extractEducation(sections: Record<string, string>): string {
  const education = sections.EDUCATION || "";
  if (!education) return "";
  return education
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(" | ");
}

function extractProjects(sections: Record<string, string>): string[] {
  const projects = sections.PROJECTS || "";
  if (!projects) return [];
  return projects
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function parseResumeText(text: string): ParsedResume {
  const normalized = (text || "").trim();
  if (!normalized) {
    return {
      name: "",
      experience: "",
      skills: [],
      technologies: [],
      projects: [],
      education: "",
    };
  }

  const sections = splitSections(normalized);
  const skills = extractSkills(sections, normalized);

  return {
    name: extractName(sections.HEADER || "", normalized),
    experience: extractExperience(sections),
    skills,
    technologies: skills.slice(0, 15),
    projects: extractProjects(sections),
    education: extractEducation(sections),
  };
}

export function hasUsefulAnalysis(analysis?: Partial<ParsedResume> | null): boolean {
  if (!analysis) return false;
  return Boolean(
    analysis.name ||
      analysis.experience ||
      (Array.isArray(analysis.skills) && analysis.skills.length > 0)
  );
}

export function mergeResumeAnalysis(
  primary?: Partial<ParsedResume> | null,
  fallback?: Partial<ParsedResume> | null
): ParsedResume {
  const local = fallback || parseResumeText("");
  return {
    name: primary?.name || local.name || "",
    experience: primary?.experience || local.experience || "",
    skills:
      Array.isArray(primary?.skills) && primary.skills.length > 0
        ? primary.skills
        : local.skills || [],
    technologies:
      Array.isArray(primary?.technologies) && primary.technologies.length > 0
        ? primary.technologies
        : local.technologies || [],
    projects:
      Array.isArray(primary?.projects) && primary.projects.length > 0
        ? primary.projects
        : local.projects || [],
    education: primary?.education || local.education || "",
  };
}
