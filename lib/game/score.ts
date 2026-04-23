import { difficultyConfig } from "@/lib/game/game-config";
import type {
  AnsweredQuestion,
  Difficulty,
  GameEntity,
  GameMode,
  GameWinner,
  ScoreBreakdown,
} from "@/types/game";

const difficultyMultiplier: Record<Difficulty, number> = {
  easy: 1,
  normal: 1.35,
  hard: 1.75,
};

const contradictionPairs = [
  ["male", "female"],
  ["child", "adult"],
  ["large", "small"],
  ["carnivore", "herbivore"],
  ["ancient", "modern"],
  ["medieval", "modern"],
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function estimateContradictionPenalty(answers: readonly AnsweredQuestion[]) {
  const answerByAttribute = new Map(answers.map((answer) => [answer.attributeKey, answer.answer]));
  let contradictions = 0;

  for (const [left, right] of contradictionPairs) {
    const leftAnswer = answerByAttribute.get(left);
    const rightAnswer = answerByAttribute.get(right);

    if (
      (leftAnswer === "yes" || leftAnswer === "probably") &&
      (rightAnswer === "yes" || rightAnswer === "probably")
    ) {
      contradictions += leftAnswer === "yes" && rightAnswer === "yes" ? 2 : 1;
    }
  }

  return Math.min(60, contradictions * 14);
}

export function entityRarityScore(entity?: GameEntity | null) {
  if (!entity) {
    return 0;
  }

  const rarity = clamp(entity.rarityWeight ?? 1, 0.5, 3.5);
  const popularity = clamp(entity.popularityWeight ?? 1, 0.5, 3.5);
  return Math.round(clamp((rarity - 1) * 18 + (popularity - 1) * 6, 0, 38));
}

export interface ScoreInput {
  mode: GameMode;
  difficulty: Difficulty;
  winner: GameWinner;
  questionsUsed: number;
  guessesUsed: number;
  answers?: readonly AnsweredQuestion[];
  entity?: GameEntity | null;
}

export function calculateGameScore(input: ScoreInput): ScoreBreakdown {
  const multiplier = difficultyMultiplier[input.difficulty];
  const modeConfig =
    input.mode === "read-my-mind"
      ? difficultyConfig[input.difficulty].readMyMind
      : difficultyConfig[input.difficulty].guessMyMind;
  const base = input.mode === "read-my-mind" ? 40 : 35;
  const difficultyBonus = Math.round(30 * multiplier);
  const rarityBonus = entityRarityScore(input.entity);
  const contradictionPenalty =
    input.mode === "read-my-mind" ? estimateContradictionPenalty(input.answers ?? []) : 0;

  if (input.mode === "read-my-mind") {
    const survivedRatio = modeConfig.maxQuestions > 0 ? input.questionsUsed / modeConfig.maxQuestions : 0;
    const questionBonus = Math.round(input.questionsUsed * 8 * multiplier);
    const successBonus = input.winner === "player" ? 135 : 24;
    const efficiencyBonus = Math.round(survivedRatio * 25);
    const guessPenalty = Math.max(0, input.guessesUsed - 1) * 10;
    const cap = 480;
    const total = clamp(
      base + difficultyBonus + successBonus + questionBonus + efficiencyBonus + rarityBonus - contradictionPenalty - guessPenalty,
      0,
      cap,
    );

    return {
      total: Math.round(total),
      base,
      difficultyBonus,
      successBonus,
      questionBonus,
      efficiencyBonus,
      rarityBonus,
      contradictionPenalty,
      guessPenalty,
      cap,
    };
  }

  const success = input.winner === "player";
  const remainingQuestions = Math.max(0, modeConfig.maxQuestions - input.questionsUsed);
  const questionBonus = success ? Math.round(remainingQuestions * 11 * multiplier) : 0;
  const efficiencyBonus = success ? Math.round((1 - input.questionsUsed / modeConfig.maxQuestions) * 55 * multiplier) : 0;
  const successBonus = success ? 185 : 16;
  const guessPenalty = Math.max(0, input.guessesUsed - 1) * 18;
  const cap = 500;
  const total = clamp(
    base + difficultyBonus + successBonus + questionBonus + efficiencyBonus + rarityBonus - guessPenalty,
    0,
    cap,
  );

  return {
    total: Math.round(total),
    base,
    difficultyBonus,
    successBonus,
    questionBonus,
    efficiencyBonus,
    rarityBonus,
    contradictionPenalty: 0,
    guessPenalty,
    cap,
  };
}
