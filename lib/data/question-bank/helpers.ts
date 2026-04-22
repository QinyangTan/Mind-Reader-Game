import type {
  AttributeKey,
  EntityCategory,
  QuestionDefinition,
  QuestionGroup,
  QuestionStage,
} from "@/types/game";

interface QuestionSeedInput {
  id: string;
  label: string;
  question: string;
  supportedCategories: EntityCategory[];
  attributeKey: AttributeKey;
  group: QuestionGroup;
  stage: QuestionStage;
  family: string;
  weight?: number;
}

export function createQuestion(input: QuestionSeedInput): QuestionDefinition {
  return Object.freeze({
    ...input,
  });
}

