import { animals } from "@/lib/data/animals";
import { foods } from "@/lib/data/foods";
import { fictionalCharacters } from "@/lib/data/fictional-characters";
import { objects } from "@/lib/data/objects";
import { allQuestions } from "@/lib/data/questions";
import { vehicles } from "@/lib/data/vehicles";
import { entityCategories, type EntityCategory, type GameEntity, type QuestionDefinition } from "@/types/game";

function freezeMapMutation<K, V>(map: Map<K, V>): ReadonlyMap<K, V> {
  const block = () => {
    throw new Error("Seeded data is immutable");
  };
  map.set = block as Map<K, V>["set"];
  map.delete = block as Map<K, V>["delete"];
  map.clear = block as Map<K, V>["clear"];
  return map;
}

export const entities: readonly GameEntity[] = Object.freeze([
  ...fictionalCharacters,
  ...animals,
  ...objects,
  ...foods,
  ...vehicles,
]);

export const entityById: ReadonlyMap<string, GameEntity> = freezeMapMutation(
  new Map(entities.map((entity) => [entity.id, entity])),
);

export const entitiesByCategory: ReadonlyMap<EntityCategory, readonly GameEntity[]> =
  freezeMapMutation(
    new Map<EntityCategory, readonly GameEntity[]>(
      entityCategories.map((category) => [
        category,
        Object.freeze(entities.filter((entity) => entity.category === category)),
      ]),
    ),
  );

export const questionsByCategory: ReadonlyMap<EntityCategory, readonly QuestionDefinition[]> =
  freezeMapMutation(
    new Map<EntityCategory, readonly QuestionDefinition[]>(
      entityCategories.map((category) => [
        category,
        Object.freeze(allQuestions.filter((question) => question.supportedCategories.includes(category))),
      ]),
    ),
  );

const EMPTY_ENTITIES: readonly GameEntity[] = Object.freeze([]);
const EMPTY_QUESTIONS: readonly QuestionDefinition[] = Object.freeze([]);

export function getEntitiesForCategory(category: EntityCategory): readonly GameEntity[] {
  return entitiesByCategory.get(category) ?? EMPTY_ENTITIES;
}

export function getQuestionsForCategory(category: EntityCategory): readonly QuestionDefinition[] {
  return questionsByCategory.get(category) ?? EMPTY_QUESTIONS;
}

export function normalizeEntityLookupText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getEntityLookupTerms(entity: GameEntity) {
  return [
    entity.name,
    ...(entity.aliases ?? []),
    entity.shortDescription,
    entity.subcategory ?? "",
    entity.sourceType ?? "",
  ].filter(Boolean);
}

export function entityMatchesLookup(entity: GameEntity, query: string) {
  const normalizedQuery = normalizeEntityLookupText(query);
  if (!normalizedQuery) {
    return true;
  }

  return getEntityLookupTerms(entity).some((term) =>
    normalizeEntityLookupText(term).includes(normalizedQuery),
  );
}

export function findEntityByNameOrAlias(
  category: EntityCategory,
  value: string,
  extraEntities: GameEntity[] = [],
) {
  const normalizedValue = normalizeEntityLookupText(value);
  if (!normalizedValue) {
    return null;
  }

  const seeded = getEntitiesForCategory(category);
  const seededIds = new Set(seeded.map((entity) => entity.id));
  const pool = [
    ...seeded,
    ...extraEntities.filter((entity) => entity.category === category && !seededIds.has(entity.id)),
  ];

  return (
    pool.find((entity) =>
      [entity.name, ...(entity.aliases ?? [])].some(
        (term) => normalizeEntityLookupText(term) === normalizedValue,
      ),
    ) ?? null
  );
}
