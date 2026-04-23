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
  "living",
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
  "robot_or_ai",
  "pirate_or_sailor",
  "alien_or_otherworldly",
  "from_book",
  "from_comic",
  "detective_or_solver",
  "monster_or_creature",
  "fire_themed",
  "water_themed",
  "electric_themed",
  "nature_themed",
  "leader_or_mentor",
  "sci_fi_setting",
  "fantasy_setting",
  "mammal",
  "bird",
  "reptile",
  "insect",
  "amphibian",
  "fish",
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
  "nocturnal",
  "lives_in_trees",
  "has_shell",
  "venomous",
  "cold_climate",
  "freshwater",
  "desert_habitat",
  "forest_habitat",
  "primate",
  "marsupial",
  "hoofed",
  "pack_hunter",
  "has_horns_or_antlers",
  "camouflaged",
  "object",
  "food",
  "historical_figure",
  "portable",
  "electronic",
  "household",
  "kitchen_related",
  "office_related",
  "wearable",
  "used_daily",
  "indoor_use",
  "outdoor_use",
  "made_of_metal",
  "made_of_wood",
  "made_of_glass",
  "made_of_plastic",
  "powered",
  "has_screen",
  "has_wheels",
  "container",
  "sharp",
  "writes_or_records",
  "furniture",
  "tool",
  "bathroom_related",
  "cleaning_related",
  "toy_or_game",
  "musical_item",
  "storage_item",
  "lighting_item",
  "communication_device",
  "paper_based",
  "sports_related",
  "sweet",
  "savory",
  "served_hot",
  "served_cold",
  "baked",
  "fried",
  "fruit",
  "vegetable",
  "meat_based",
  "dairy_based",
  "drinkable",
  "dessert",
  "spicy",
  "grain_based",
  "seafood",
  "breakfast_food",
  "rice_based",
  "noodle_based",
  "handheld",
  "street_food",
  "soup_or_stew",
  "fermented",
  "snack_food",
  "cuisine_asian",
  "cuisine_european",
  "cuisine_american",
  "cuisine_middle_eastern_or_african",
  "deceased",
  "ancient",
  "medieval",
  "modern",
  "from_europe",
  "from_asia",
  "from_africa",
  "from_americas",
  "political_leader",
  "military_leader",
  "scientist",
  "artist",
  "writer",
  "philosopher",
  "religious_figure",
  "explorer",
  "inventor",
  "reformer",
  "rights_activist",
  "astronomer",
  "ruler_or_emperor",
  "revolutionary",
  "educator",
  "mathematician",
  "physician",
  "architect",
  "composer_or_musician",
  "jurist_or_lawyer",
  "diplomat",
] as const;

export type AttributeKey = (typeof attributeKeys)[number];

export const fictionalAttributeKeys: AttributeKey[] = [
  "fictional",
  "living",
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
  "robot_or_ai",
  "pirate_or_sailor",
  "alien_or_otherworldly",
  "from_book",
  "from_comic",
  "detective_or_solver",
  "monster_or_creature",
  "fire_themed",
  "water_themed",
  "electric_themed",
  "nature_themed",
  "leader_or_mentor",
  "sci_fi_setting",
  "fantasy_setting",
];

export const animalAttributeKeys: AttributeKey[] = [
  "real",
  "living",
  "mammal",
  "bird",
  "reptile",
  "insect",
  "amphibian",
  "fish",
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
  "nocturnal",
  "lives_in_trees",
  "has_shell",
  "venomous",
  "cold_climate",
  "freshwater",
  "desert_habitat",
  "forest_habitat",
  "primate",
  "marsupial",
  "hoofed",
  "pack_hunter",
  "has_horns_or_antlers",
  "camouflaged",
];

export const objectAttributeKeys: AttributeKey[] = [
  "real",
  "object",
  "portable",
  "electronic",
  "household",
  "kitchen_related",
  "office_related",
  "wearable",
  "used_daily",
  "indoor_use",
  "outdoor_use",
  "made_of_metal",
  "made_of_wood",
  "made_of_glass",
  "made_of_plastic",
  "powered",
  "has_screen",
  "has_wheels",
  "container",
  "sharp",
  "writes_or_records",
  "furniture",
  "tool",
  "bathroom_related",
  "cleaning_related",
  "toy_or_game",
  "musical_item",
  "storage_item",
  "lighting_item",
  "communication_device",
  "paper_based",
  "sports_related",
  "large",
  "small",
];

export const foodAttributeKeys: AttributeKey[] = [
  "real",
  "food",
  "portable",
  "sweet",
  "savory",
  "served_hot",
  "served_cold",
  "baked",
  "fried",
  "fruit",
  "vegetable",
  "meat_based",
  "dairy_based",
  "drinkable",
  "dessert",
  "spicy",
  "grain_based",
  "seafood",
  "breakfast_food",
  "rice_based",
  "noodle_based",
  "handheld",
  "street_food",
  "soup_or_stew",
  "fermented",
  "snack_food",
  "cuisine_asian",
  "cuisine_european",
  "cuisine_american",
  "cuisine_middle_eastern_or_african",
  "used_daily",
];

export const historicalFigureAttributeKeys: AttributeKey[] = [
  "real",
  "historical_figure",
  "human",
  "male",
  "female",
  "adult",
  "deceased",
  "ancient",
  "medieval",
  "modern",
  "from_europe",
  "from_asia",
  "from_africa",
  "from_americas",
  "political_leader",
  "military_leader",
  "scientist",
  "artist",
  "writer",
  "philosopher",
  "religious_figure",
  "explorer",
  "inventor",
  "reformer",
  "rights_activist",
  "astronomer",
  "ruler_or_emperor",
  "revolutionary",
  "educator",
  "mathematician",
  "physician",
  "architect",
  "composer_or_musician",
  "jurist_or_lawyer",
  "diplomat",
  "royal",
  "famous_worldwide",
];

export const entityCategories = [
  "fictional_characters",
  "animals",
  "objects",
  "foods",
  "historical_figures",
] as const;

export type EntityCategory = (typeof entityCategories)[number];

export const questionStages = [
  "broad",
  "category",
  "profile",
  "specialist",
  "fine",
] as const;

export type QuestionStage = (typeof questionStages)[number];

export const questionGroups = [
  "identity",
  "origin",
  "role",
  "powers",
  "body",
  "habitat",
  "diet",
  "size",
  "pattern",
  "behavior",
  "usage",
  "material",
  "technology",
  "mobility",
  "taste",
  "serving",
  "era",
  "region",
  "legacy",
] as const;

export type QuestionGroup = (typeof questionGroups)[number];

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
  aliases?: string[];
  subcategory?: string;
  sourceType?: string;
  rarityWeight?: number;
  popularityWeight?: number;
  attributes: Record<AttributeKey, NormalizedAnswer>;
}

export interface QuestionDefinition {
  id: string;
  label: string;
  question: string;
  supportedCategories: EntityCategory[];
  attributeKey: AttributeKey;
  group: QuestionGroup;
  stage: QuestionStage;
  family: string;
  discriminatorFor?: AttributeKey[];
  requiredBefore?: string[];
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

export interface CandidateUncertaintyMetrics {
  entropy: number;
  normalizedEntropy: number;
  effectiveCandidateCount: number;
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
  score: number;
  scoreBreakdown: ScoreBreakdown;
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
  totalScore: number;
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
  scoreByMode: Record<GameMode, number>;
  bestScoreByMode: Record<GameMode, number>;
  fastestSolveByMode: Record<GameMode, number | null>;
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
  score: number;
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
  version: 2;
  entries: TeachCase[];
  model: LearnedInferenceModel;
}

export interface LegacyLearnedEntityStoreV1 {
  version: 1;
  entries: TeachCase[];
}

export interface LearnedQuestionStat {
  askedCount: number;
  totalEntropyDrop: number;
}

export interface LearnedInferenceModel {
  version: 1;
  attributeAnswerCounts: Record<string, number>;
  questionStats: Record<string, LearnedQuestionStat>;
  readEntityCounts: Record<string, number>;
}

export interface ScoreBreakdown {
  total: number;
  base: number;
  difficultyBonus: number;
  successBonus: number;
  questionBonus: number;
  efficiencyBonus: number;
  rarityBonus: number;
  contradictionPenalty: number;
  guessPenalty: number;
  cap: number;
}

export interface PlayerProfile {
  version: 1;
  id: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  mode: GameMode;
  totalScore: number;
  gamesPlayed: number;
  wins: number;
  bestStreak: number;
  averageScore: number;
  updatedAt: string;
}

export interface LeaderboardSnapshot {
  mode: GameMode;
  entries: LeaderboardEntry[];
  generatedAt: string;
  source: "local" | "remote";
}
