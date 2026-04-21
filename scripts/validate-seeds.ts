/**
 * Seed-data integrity checks.
 *
 * Pure function — intentionally no CLI wrapper. Invoked via:
 *   - `tests/validation.test.ts`  (asserts zero errors on shipped data; fixtures for error codes)
 *   - `npm run validate`          (runs that test file through Vitest)
 *
 * Pass `{ entities, questions }` to validate alternate fixtures (defaults to
 * the bundled `entities` and `allQuestions` modules).
 *
 * Keeping validation in a test-runnable module means we don't need an extra
 * script runner dependency (tsx / ts-node) just to execute it.
 */

import { entities } from "@/lib/data/entities";
import { allQuestions } from "@/lib/data/questions";
import {
  attributeKeys,
  entityCategories,
  normalizedAnswers,
  type GameEntity,
  type QuestionDefinition,
} from "@/types/game";

export interface ValidationIssue {
  scope: "entities" | "questions";
  code: string;
  message: string;
}

export interface ValidationReport {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

const attributeKeySet = new Set<string>(attributeKeys);
const categorySet = new Set<string>(entityCategories);
const answerSet = new Set<string>(normalizedAnswers);

const SPARSE_ATTRIBUTE_WARN_THRESHOLD = 2;

export interface ValidateSeedsInput {
  entities: readonly GameEntity[];
  questions: readonly QuestionDefinition[];
}

export function validateSeeds(
  input: Partial<ValidateSeedsInput> = {},
): ValidationReport {
  const entityList = input.entities ?? entities;
  const questionList = input.questions ?? allQuestions;

  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const seenEntityIds = new Set<string>();
  for (const entity of entityList) {
    if (!entity.id.trim()) {
      errors.push({
        scope: "entities",
        code: "empty_entity_id",
        message: "Entity has an empty or whitespace-only id",
      });
    }

    if (!entity.name.trim()) {
      errors.push({
        scope: "entities",
        code: "empty_entity_name",
        message: `Entity ${entity.id || "(no id)"} has an empty or whitespace-only name`,
      });
    }

    if (!entity.shortDescription.trim()) {
      errors.push({
        scope: "entities",
        code: "empty_entity_description",
        message: `Entity ${entity.id || "(no id)"} has an empty or whitespace-only shortDescription`,
      });
    }

    if (!entity.imageEmoji.trim()) {
      errors.push({
        scope: "entities",
        code: "empty_entity_emoji",
        message: `Entity ${entity.id || "(no id)"} has an empty or whitespace-only imageEmoji`,
      });
    }

    if (seenEntityIds.has(entity.id)) {
      errors.push({
        scope: "entities",
        code: "duplicate_id",
        message: `Duplicate entity id: ${entity.id}`,
      });
    }
    seenEntityIds.add(entity.id);

    if (!categorySet.has(entity.category)) {
      errors.push({
        scope: "entities",
        code: "invalid_category",
        message: `Entity ${entity.id} has unknown category '${entity.category}'`,
      });
    }

    for (const key of attributeKeys) {
      const value = entity.attributes[key];
      if (value === undefined) {
        errors.push({
          scope: "entities",
          code: "missing_attribute",
          message: `Entity ${entity.id} is missing attribute '${key}'`,
        });
      } else if (!answerSet.has(value)) {
        errors.push({
          scope: "entities",
          code: "invalid_attribute_value",
          message: `Entity ${entity.id} has invalid value '${value}' for attribute '${key}'`,
        });
      }
    }

    const nonUnknownCount = attributeKeys.filter(
      (key) => entity.attributes[key] !== "unknown",
    ).length;
    if (nonUnknownCount <= SPARSE_ATTRIBUTE_WARN_THRESHOLD) {
      warnings.push({
        scope: "entities",
        code: "sparse_attributes",
        message: `Entity ${entity.id} has only ${nonUnknownCount} non-unknown attribute(s); ranking signal will be weak`,
      });
    }
  }

  const seenQuestionIds = new Set<string>();
  for (const question of questionList) {
    if (!question.id.trim()) {
      errors.push({
        scope: "questions",
        code: "empty_question_id",
        message: "Question has an empty or whitespace-only id",
      });
    }

    if (!question.label.trim()) {
      errors.push({
        scope: "questions",
        code: "empty_question_label",
        message: `Question ${question.id || "(no id)"} has an empty or whitespace-only label`,
      });
    }

    if (!question.question.trim()) {
      errors.push({
        scope: "questions",
        code: "empty_question_prompt",
        message: `Question ${question.id || "(no id)"} has an empty or whitespace-only question text`,
      });
    }

    if (question.weight !== undefined) {
      const w = question.weight;
      if (typeof w !== "number" || !Number.isFinite(w) || w <= 0) {
        errors.push({
          scope: "questions",
          code: "invalid_question_weight",
          message: `Question ${question.id} has invalid weight (${String(w)}); expected a finite number > 0`,
        });
      }
    }

    if (seenQuestionIds.has(question.id)) {
      errors.push({
        scope: "questions",
        code: "duplicate_id",
        message: `Duplicate question id: ${question.id}`,
      });
    }
    seenQuestionIds.add(question.id);

    if (!attributeKeySet.has(question.attributeKey)) {
      errors.push({
        scope: "questions",
        code: "invalid_attribute_key",
        message: `Question ${question.id} references unknown attribute '${question.attributeKey}'`,
      });
    }

    if (question.supportedCategories.length === 0) {
      errors.push({
        scope: "questions",
        code: "no_categories",
        message: `Question ${question.id} supports no categories`,
      });
    }

    for (const category of question.supportedCategories) {
      if (!categorySet.has(category)) {
        errors.push({
          scope: "questions",
          code: "invalid_category",
          message: `Question ${question.id} references unknown category '${category}'`,
        });
      }
    }
  }

  for (const category of entityCategories) {
    const hasQuestions = questionList.some((q) =>
      q.supportedCategories.includes(category),
    );
    if (!hasQuestions) {
      errors.push({
        scope: "questions",
        code: "no_questions_for_category",
        message: `No questions configured for category '${category}'`,
      });
    }

    const hasEntities = entityList.some((e) => e.category === category);
    if (!hasEntities) {
      errors.push({
        scope: "entities",
        code: "no_entities_for_category",
        message: `No entities configured for category '${category}'`,
      });
    }
  }

  return { errors, warnings };
}
