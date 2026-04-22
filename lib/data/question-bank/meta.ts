import type { QuestionGroup, QuestionStage } from "@/types/game";

export const questionStageOrder: QuestionStage[] = [
  "broad",
  "category",
  "profile",
  "specialist",
  "fine",
];

export const questionStageMeta: Record<
  QuestionStage,
  {
    label: string;
    shortLabel: string;
    description: string;
    order: number;
  }
> = {
  broad: {
    label: "Layer 1 · Broad split",
    shortLabel: "Broad",
    description: "Use high-level questions that cut the field into large meaningful halves.",
    order: 1,
  },
  category: {
    label: "Layer 2 · Category split",
    shortLabel: "Category",
    description: "Use category-defining clues once the broad domain is mostly clear.",
    order: 2,
  },
  profile: {
    label: "Layer 3 · Profile",
    shortLabel: "Profile",
    description: "Use medium-detail clues about source, habitat, usage, or subtype.",
    order: 3,
  },
  specialist: {
    label: "Layer 4 · Specialist",
    shortLabel: "Specialist",
    description: "Use more specific distinguishing traits once the shortlist is small.",
    order: 4,
  },
  fine: {
    label: "Layer 5 · Fine detail",
    shortLabel: "Fine",
    description: "Use the sharpest disambiguators only when the final answer is close.",
    order: 5,
  },
};

export const questionGroupMeta: Record<
  QuestionGroup,
  {
    label: string;
    description: string;
    order: number;
  }
> = {
  identity: {
    label: "Identity",
    description: "Broad identity clues that split the field quickly.",
    order: 1,
  },
  origin: {
    label: "Origin",
    description: "Where it comes from or what world it belongs to.",
    order: 2,
  },
  role: {
    label: "Role",
    description: "Social role, alignment, or purpose.",
    order: 3,
  },
  powers: {
    label: "Powers & Abilities",
    description: "Magic, flight, weapons, and standout abilities.",
    order: 4,
  },
  body: {
    label: "Body & Form",
    description: "Physical form and anatomy.",
    order: 5,
  },
  habitat: {
    label: "Habitat",
    description: "Where it usually lives or belongs.",
    order: 6,
  },
  diet: {
    label: "Diet",
    description: "What it eats or is made to be eaten with.",
    order: 7,
  },
  size: {
    label: "Size",
    description: "Scale and physical footprint.",
    order: 8,
  },
  pattern: {
    label: "Pattern & Markings",
    description: "Notable surface patterns or visual markers.",
    order: 9,
  },
  behavior: {
    label: "Behavior",
    description: "Temperament, danger level, or common activity.",
    order: 10,
  },
  usage: {
    label: "Usage",
    description: "How people use it in everyday life.",
    order: 11,
  },
  material: {
    label: "Material",
    description: "What it is typically made from.",
    order: 12,
  },
  technology: {
    label: "Technology",
    description: "Power, screens, electronics, and controls.",
    order: 13,
  },
  mobility: {
    label: "Mobility",
    description: "How it moves, if at all.",
    order: 14,
  },
  transport: {
    label: "Transport Role",
    description: "What kind of transport job it is built for.",
    order: 15,
  },
  taste: {
    label: "Taste",
    description: "Flavor profile and palate clues.",
    order: 16,
  },
  serving: {
    label: "Serving Style",
    description: "How it is prepared, served, or consumed.",
    order: 17,
  },
};
