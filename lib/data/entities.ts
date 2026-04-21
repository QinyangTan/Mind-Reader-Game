import { animals } from "@/lib/data/animals";
import { fictionalCharacters } from "@/lib/data/fictional-characters";
import { allQuestions } from "@/lib/data/questions";
import type { EntityCategory, GameEntity, QuestionDefinition } from "@/types/game";

export const entities: GameEntity[] = [...fictionalCharacters, ...animals];

export const entityById = new Map(entities.map((entity) => [entity.id, entity]));

export const entitiesByCategory = new Map<EntityCategory, GameEntity[]>([
  ["fictional_characters", entities.filter((entity) => entity.category === "fictional_characters")],
  ["animals", entities.filter((entity) => entity.category === "animals")],
]);

export const questionsByCategory = new Map<EntityCategory, QuestionDefinition[]>([
  [
    "fictional_characters",
    allQuestions.filter((question) => question.supportedCategories.includes("fictional_characters")),
  ],
  ["animals", allQuestions.filter((question) => question.supportedCategories.includes("animals"))],
]);

export function getEntitiesForCategory(category: EntityCategory) {
  return entitiesByCategory.get(category) ?? [];
}

export function getQuestionsForCategory(category: EntityCategory) {
  return questionsByCategory.get(category) ?? [];
}
