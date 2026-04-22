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
  vehicles: {
    label: "Vehicles",
    icon: "⟡",
    synopsis: "Road, rail, air, and water machines built to move people, cargo, or urgency.",
    flavor: "Power source, terrain, and transport role.",
    accent: "from-sky-300 via-cyan-300 to-indigo-400",
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
      maxQuestions: 12,
      maxGuesses: 3,
      minQuestionsBeforeGuess: 5,
      guessConfidence: 0.36,
      guessMargin: 0.08,
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
      maxQuestions: 15,
      maxGuesses: 2,
      minQuestionsBeforeGuess: 6,
      guessConfidence: 0.43,
      guessMargin: 0.1,
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
      maxQuestions: 20,
      maxGuesses: 2,
      minQuestionsBeforeGuess: 7,
      guessConfidence: 0.52,
      guessMargin: 0.13,
    },
    guessMyMind: {
      maxQuestions: 10,
      maxGuesses: 3,
    },
  },
};
