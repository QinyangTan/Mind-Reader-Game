import type { DifficultyConfig, Difficulty, EntityCategory, GameMode } from "@/types/game";

export const categoryMeta: Record<
  EntityCategory,
  {
    label: string;
    icon: string;
    synopsis: string;
    flavor: string;
    accent: string;
  }
> = {
  fictional_characters: {
    label: "Fictional Characters",
    icon: "🜁",
    synopsis: "Heroes, villains, legends, mascots, and icons from stories and games.",
    flavor: "Story residue, cinematic aura, and iconic silhouettes.",
    accent: "from-fuchsia-400 via-cyan-300 to-sky-500",
  },
  animals: {
    label: "Animals",
    icon: "◈",
    synopsis: "Wild creatures, pets, farm favorites, and ocean-born mysteries.",
    flavor: "Instinct patterns, natural traits, and primal tells.",
    accent: "from-emerald-300 via-cyan-300 to-blue-500",
  },
  objects: {
    label: "Objects",
    icon: "⌘",
    synopsis: "Everyday tools, devices, furniture, and familiar things with clear use patterns.",
    flavor: "Material clues, room context, and everyday utility.",
    accent: "from-amber-300 via-orange-300 to-rose-400",
  },
  foods: {
    label: "Foods",
    icon: "◌",
    synopsis: "Meals, snacks, drinks, desserts, and staple foods with flavor-based clues.",
    flavor: "Taste, serving style, and ingredient identity.",
    accent: "from-yellow-300 via-orange-300 to-red-400",
  },
  historical_figures: {
    label: "Historical Figures",
    icon: "♜",
    synopsis: "Real people from history: rulers, thinkers, artists, scientists, reformers, explorers, and commanders.",
    flavor: "Era, region, role, and the legacy they left behind.",
    accent: "from-stone-200 via-amber-200 to-rose-300",
  },
};

export const modeMeta: Record<
  GameMode,
  {
    label: string;
    eyebrow: string;
    description: string;
    cta: string;
  }
> = {
  "read-my-mind": {
    label: "Read My Mind",
    eyebrow: "Scanner Control",
    description:
      "You hold the secret. The chamber asks precision questions, then dares a dramatic guess.",
    cta: "Let the chamber probe",
  },
  "guess-my-mind": {
    label: "Guess My Mind",
    eyebrow: "Counter-Scan",
    description:
      "The machine locks onto an entity. You pull clues from the question bank and break the signal yourself.",
    cta: "Interrogate the chamber",
  },
};

export const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy",
    accent: "text-emerald-200",
    description: "Generous limits and more time before the pressure rises.",
    readMyMind: {
      maxQuestions: 16,
      maxGuesses: 3,
      minQuestionsBeforeGuess: 7,
      guessConfidence: 0.42,
      guessMargin: 0.12,
    },
    guessMyMind: {
      maxQuestions: 15,
      maxGuesses: 5,
    },
  },
  normal: {
    label: "Normal",
    accent: "text-cyan-200",
    description: "Balanced pressure with a healthy amount of suspense.",
    readMyMind: {
      maxQuestions: 20,
      maxGuesses: 2,
      minQuestionsBeforeGuess: 8,
      guessConfidence: 0.48,
      guessMargin: 0.14,
    },
    guessMyMind: {
      maxQuestions: 12,
      maxGuesses: 4,
    },
  },
  hard: {
    label: "Hard",
    accent: "text-rose-200",
    description: "Longer scan depth, fewer escapes, sharper intuition required.",
    readMyMind: {
      maxQuestions: 24,
      maxGuesses: 2,
      minQuestionsBeforeGuess: 10,
      guessConfidence: 0.56,
      guessMargin: 0.17,
    },
    guessMyMind: {
      maxQuestions: 10,
      maxGuesses: 3,
    },
  },
};
