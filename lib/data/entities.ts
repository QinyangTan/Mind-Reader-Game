import { animals } from "@/lib/data/animals";
import { fictionalCharacters } from "@/lib/data/fictional-characters";
import { allQuestions } from "@/lib/data/questions";
import type { EntityCategory, GameEntity, QuestionDefinition } from "@/types/game";

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
]);

export const entityById: ReadonlyMap<string, GameEntity> = freezeMapMutation(
  new Map(entities.map((entity) => [entity.id, entity])),
);

const fictionalEntities: readonly GameEntity[] = Object.freeze(
  entities.filter((entity) => entity.category === "fictional_characters"),
);

const animalEntities: readonly GameEntity[] = Object.freeze(
  entities.filter((entity) => entity.category === "animals"),
);

export const entitiesByCategory: ReadonlyMap<EntityCategory, readonly GameEntity[]> =
  freezeMapMutation(
    new Map<EntityCategory, readonly GameEntity[]>([
      ["fictional_characters", fictionalEntities],
      ["animals", animalEntities],
    ]),
  );

const fictionalQuestions: readonly QuestionDefinition[] = Object.freeze(
  allQuestions.filter((question) => question.supportedCategories.includes("fictional_characters")),
);

const animalQuestions: readonly QuestionDefinition[] = Object.freeze(
  allQuestions.filter((question) => question.supportedCategories.includes("animals")),
);

export const questionsByCategory: ReadonlyMap<EntityCategory, readonly QuestionDefinition[]> =
  freezeMapMutation(
    new Map<EntityCategory, readonly QuestionDefinition[]>([
      ["fictional_characters", fictionalQuestions],
      ["animals", animalQuestions],
    ]),
  );

const EMPTY_ENTITIES: readonly GameEntity[] = Object.freeze([]);
const EMPTY_QUESTIONS: readonly QuestionDefinition[] = Object.freeze([]);

export function getEntitiesForCategory(category: EntityCategory): readonly GameEntity[] {
  return entitiesByCategory.get(category) ?? EMPTY_ENTITIES;
}

export function getQuestionsForCategory(category: EntityCategory): readonly QuestionDefinition[] {
  return questionsByCategory.get(category) ?? EMPTY_QUESTIONS;
}
