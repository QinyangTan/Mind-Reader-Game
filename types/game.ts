export const normalizedAnswers = [
  "yes",
  "no",
  "probably",
  "probably_not",
  "unknown",
] as const;

export type NormalizedAnswer = (typeof normalizedAnswers)[number];

export const attributeKeys = [
  "fictional",
  "real",
  "human",
  "male",
  "female",
  "magical",
  "superhero",
  "villain",
  "animal_like",
  "from_anime",
  "from_movie",
  "from_game",
  "uses_weapons",
  "wears_mask",
  "royal",
  "child",
  "adult",
  "can_fly",
  "associated_with_space",
  "associated_with_magic",
  "associated_with_school",
  "famous_worldwide",
  "mammal",
  "bird",
  "reptile",
  "aquatic",
  "pet",
  "wild",
  "carnivore",
  "herbivore",
  "striped",
  "spotted",
  "large",
  "small",
  "lives_in_ocean",
  "dangerous",
  "farm_animal",
] as const;

export type AttributeKey = (typeof attributeKeys)[number];

export const fictionalAttributeKeys: AttributeKey[] = [
  "fictional",
  "human",
  "male",
  "female",
  "magical",
  "superhero",
  "villain",
  "animal_like",
  "from_anime",
  "from_movie",
  "from_game",
  "uses_weapons",
  "wears_mask",
  "royal",
  "child",
  "adult",
  "can_fly",
  "associated_with_space",
  "associated_with_magic",
  "associated_with_school",
  "famous_worldwide",
];

export const animalAttributeKeys: AttributeKey[] = [
  "real",
  "mammal",
  "bird",
  "reptile",
  "aquatic",
  "can_fly",
  "pet",
  "wild",
  "carnivore",
  "herbivore",
  "striped",
  "spotted",
  "large",
  "small",
  "lives_in_ocean",
  "dangerous",
  "farm_animal",
];

export const entityCategories = [
  "fictional_characters",
  "animals",
] as const;

export type EntityCategory = (typeof entityCategories)[number];

export const gameModes = ["read-my-mind", "guess-my-mind"] as const;

export type GameMode = (typeof gameModes)[number];

export const difficulties = ["easy", "normal", "hard"] as const;

export type Difficulty = (typeof difficulties)[number];

export interface GameEntity {
  id: string;
  name: string;
  category: EntityCategory;
  shortDescription: string;
  imageEmoji: string;
  attributes: Record<AttributeKey, NormalizedAnswer>;
}

export interface QuestionDefinition {
  id: string;
  label: string;
  question: string;
  supportedCategories: EntityCategory[];
  attributeKey: AttributeKey;
  weight?: number;
}

export interface SetupSelection {
  mode: GameMode;
  category: EntityCategory;
  difficulty: Difficulty;
}

export interface AnsweredQuestion {
  questionId: string;
  attributeKey: AttributeKey;
  prompt: string;
  answer: NormalizedAnswer;
  askedAt: string;
}

export interface SystemAnsweredQuestion extends AnsweredQuestion {
  entityAnswer: NormalizedAnswer;
}

export interface RankedCandidate {
  entityId: string;
  score: number;
  confidence: number;
  matchedAnswers: number;
}

export interface ReadMyMindConfig {
  maxQuestions: number;
  maxGuesses: number;
  minQuestionsBeforeGuess: number;
  guessConfidence: number;
  guessMargin: number;
}

export interface GuessMyMindConfig {
  maxQuestions: number;
  maxGuesses: number;
}

export interface DifficultyConfig {
  label: string;
  accent: string;
  description: string;
  readMyMind: ReadMyMindConfig;
  guessMyMind: GuessMyMindConfig;
}

export interface ReadMyMindSession extends SetupSelection {
  mode: "read-my-mind";
  startedAt: string;
  currentQuestionId: string | null;
  asked: AnsweredQuestion[];
  rankings: RankedCandidate[];
  rejectedGuessIds: string[];
  guessAttemptsUsed: number;
  queuedGuessId: string | null;
  config: ReadMyMindConfig;
}

export interface GuessMyMindSession extends SetupSelection {
  mode: "guess-my-mind";
  startedAt: string;
  secretEntityId: string;
  asked: SystemAnsweredQuestion[];
  wrongGuessIds: string[];
  guessAttemptsUsed: number;
  config: GuessMyMindConfig;
}

export type GameWinner = "system" | "player";

export interface StrongestNarrowingQuestion {
  questionLabel: string;
  questionPrompt: string;
  answer: NormalizedAnswer;
}

export interface GameResult extends SetupSelection {
  id: string;
  winner: GameWinner;
  title: string;
  message: string;
  playedAt: string;
  questionsUsed: number;
  guessesUsed: number;
  revealedEntityId?: string;
  revealedEntityName?: string;
  teachable: boolean;
  strongestQuestion?: StrongestNarrowingQuestion;
}

export interface StoredSettings extends SetupSelection {
  soundEnabled: boolean;
  useTeachCases: boolean;
}

export interface GameStats {
  totalGames: number;
  systemWins: number;
  playerWins: number;
  currentStreak: number;
  bestStreak: number;
  lastMode: GameMode | null;
  lastCategory: EntityCategory | null;
  lastPlayedAt: string | null;
  byMode: Record<GameMode, number>;
  byCategory: Record<EntityCategory, number>;

  // Phase 3: expanded lifetime telemetry. All fields are cumulative counters;
  // derived metrics (rates, averages) are computed on read in `storage.ts`.
  winsByMode: Record<GameMode, number>;
  winsByCategory: Record<EntityCategory, number>;
  byDifficulty: Record<Difficulty, number>;
  winsByDifficulty: Record<Difficulty, number>;
  questionsByMode: Record<GameMode, number>;
  systemGuessAttempts: number;
  systemGuessHits: number;
  playerGuessAttempts: number;
  playerGuessHits: number;
}

export interface HistoryEntry {
  id: string;
  playedAt: string;
  mode: GameMode;
  category: EntityCategory;
  difficulty: Difficulty;
  winner: GameWinner;
  title: string;
  questionsUsed: number;
  guessesUsed: number;
  revealedEntityName?: string;
  strongestQuestion?: StrongestNarrowingQuestion;
}

export interface TeachCase {
  id: string;
  createdAt: string;
  category: EntityCategory;
  difficulty: Difficulty;
  entityName: string;
  note: string;
  answers: AnsweredQuestion[];
  extraAttributes?: Partial<Record<AttributeKey, NormalizedAnswer>>;
}

export interface PersistedVault {
  version: 2;
  settings: StoredSettings;
  stats: GameStats;
  history: HistoryEntry[];
}

export interface LegacyPersistedVaultV1 {
  version: 1;
  settings: StoredSettings;
  stats: GameStats;
  history: HistoryEntry[];
  teachCases: TeachCase[];
}

export interface LearnedEntityStore {
  version: 1;
  entries: TeachCase[];
}
