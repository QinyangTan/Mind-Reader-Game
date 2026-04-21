import { allQuestions } from "@/lib/data/questions";
import {
  animalAttributeKeys,
  attributeKeys,
  fictionalAttributeKeys,
  type AttributeKey,
  type EntityCategory,
  type GameEntity,
  type NormalizedAnswer,
  type TeachCase,
} from "@/types/game";

export const TEACH_ENTITY_ID_PREFIX = "teach:";

const CATEGORY_MARKER: Record<EntityCategory, AttributeKey> = {
  fictional_characters: "fictional",
  animals: "real",
};

export function isTeachEntityId(id: string) {
  return id.startsWith(TEACH_ENTITY_ID_PREFIX);
}

function categoryAttributeKeys(category: EntityCategory): readonly AttributeKey[] {
  switch (category) {
    case "fictional_characters":
      return fictionalAttributeKeys;
    case "animals":
      return animalAttributeKeys;
  }
}

/**
 * Category-relevant attributes a player can refine during the teach flow,
 * with the automatic marker (fictional/real) excluded since it's fixed
 * by category.
 */
export function getTeachableAttributeKeys(category: EntityCategory): readonly AttributeKey[] {
  const marker = CATEGORY_MARKER[category];
  return categoryAttributeKeys(category).filter((key) => key !== marker);
}

export function getAttributeLabel(
  attributeKey: AttributeKey,
  category: EntityCategory,
): string {
  const match = allQuestions.find(
    (question) =>
      question.attributeKey === attributeKey &&
      question.supportedCategories.includes(category),
  );

  if (match) {
    return match.label;
  }

  return attributeKey
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildAttributeMap(tc: TeachCase): Record<AttributeKey, NormalizedAnswer> {
  const attributes: Record<AttributeKey, NormalizedAnswer> = attributeKeys.reduce(
    (acc, key) => {
      acc[key] = "unknown";
      return acc;
    },
    {} as Record<AttributeKey, NormalizedAnswer>,
  );

  attributes[CATEGORY_MARKER[tc.category]] = "yes";

  for (const answer of tc.answers) {
    attributes[answer.attributeKey] = answer.answer;
  }

  if (tc.extraAttributes) {
    for (const [key, value] of Object.entries(tc.extraAttributes)) {
      if (value) {
        attributes[key as AttributeKey] = value;
      }
    }
  }

  return attributes;
}

export function teachCaseFillRate(tc: TeachCase) {
  const relevant = categoryAttributeKeys(tc.category);
  if (relevant.length === 0) {
    return 0;
  }

  const answered = new Set<AttributeKey>(tc.answers.map((answer) => answer.attributeKey));

  if (tc.extraAttributes) {
    for (const [key, value] of Object.entries(tc.extraAttributes)) {
      if (value) {
        answered.add(key as AttributeKey);
      }
    }
  }

  const covered = relevant.filter((key) => answered.has(key)).length;
  return covered / relevant.length;
}

export function teachCaseToEntity(tc: TeachCase): GameEntity {
  const name = tc.entityName.trim() || "Unnamed memory";

  return {
    id: `${TEACH_ENTITY_ID_PREFIX}${tc.id}`,
    name,
    category: tc.category,
    shortDescription: tc.note.trim() || "A memory you taught the chamber.",
    imageEmoji: "🧠",
    attributes: buildAttributeMap(tc),
  };
}

export function getTeachEntitiesForCategory(
  teachCases: TeachCase[],
  category: EntityCategory,
): GameEntity[] {
  return teachCases
    .filter((tc) => tc.category === category)
    .map((tc) => teachCaseToEntity(tc));
}
