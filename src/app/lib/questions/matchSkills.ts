import {
  ALL_BANK_QUESTIONS,
  normalizeSkill,
  QUESTION_CATEGORIES,
  type BankQuestion,
  type QuestionCategory,
  type QuestionCategoryId,
} from "./questionBank";

export type SkillMatchResult = {
  matchedCategories: QuestionCategory[];
  matchedSkills: string[];
  unmatchedSkills: string[];
  bankQuestions: BankQuestion[];
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function findCategoryForSkill(skill: string): QuestionCategory | undefined {
  const normalized = normalizeSkill(skill);
  if (!normalized) return undefined;

  return QUESTION_CATEGORIES.find((category) =>
    category.aliases.some((alias) => {
      const normalizedAlias = normalizeSkill(alias);
      return (
        normalized === normalizedAlias ||
        normalized.includes(normalizedAlias) ||
        normalizedAlias.includes(normalized)
      );
    })
  );
}

export function matchSkillsToBank(skillsInput: unknown): SkillMatchResult {
  const skills = (Array.isArray(skillsInput) ? skillsInput : [])
    .map((skill) => String(skill || "").trim())
    .filter(Boolean);

  const matchedCategoryIds = new Set<QuestionCategoryId>();
  const matchedSkills: string[] = [];
  const unmatchedSkills: string[] = [];

  for (const skill of skills) {
    const category = findCategoryForSkill(skill);
    if (category) {
      matchedCategoryIds.add(category.id);
      matchedSkills.push(skill);
    } else {
      unmatchedSkills.push(skill);
    }
  }

  const matchedCategories = QUESTION_CATEGORIES.filter((category) =>
    matchedCategoryIds.has(category.id)
  );

  const bankQuestions = matchedCategories.flatMap((category) => category.questions);

  return {
    matchedCategories,
    matchedSkills,
    unmatchedSkills,
    bankQuestions,
  };
}

/**
 * Build a balanced interview set from matched bank categories.
 * Always mixes in a couple of behavioral questions when available.
 */
export function pickBankQuestions(
  match: SkillMatchResult,
  targetCount = 10
): BankQuestion[] {
  if (match.matchedCategories.length === 0) {
    return shuffle(ALL_BANK_QUESTIONS).slice(0, targetCount);
  }

  const perCategory = Math.max(
    2,
    Math.ceil(targetCount / Math.max(match.matchedCategories.length, 1))
  );

  const selected: BankQuestion[] = [];
  const seen = new Set<string>();

  for (const category of match.matchedCategories) {
    for (const item of shuffle(category.questions).slice(0, perCategory)) {
      if (seen.has(item.question)) continue;
      seen.add(item.question);
      selected.push(item);
    }
  }

  const behavioral = QUESTION_CATEGORIES.find((category) => category.id === "system_behavioral");
  if (behavioral) {
    for (const item of shuffle(behavioral.questions).slice(0, 2)) {
      if (seen.has(item.question)) continue;
      seen.add(item.question);
      selected.push(item);
    }
  }

  return shuffle(selected).slice(0, targetCount);
}
