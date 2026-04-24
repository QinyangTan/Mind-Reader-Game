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
  questionGroups,
  questionStages,
  type EntityCategory,
  type GameEntity,
  type QuestionStage,
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
  summaries: ContentCoverageSummary[];
}

export interface ContentCoverageSummary {
  category: EntityCategory;
  entityCount: number;
  questionCount: number;
  questionsPer100Entities: number;
  weakEntityCount: number;
  stageCounts: Record<QuestionStage, number>;
  groupCount: number;
  familyCount: number;
  largestFamily: {
    family: string;
    count: number;
  };
}

const attributeKeySet = new Set<string>(attributeKeys);
const categorySet = new Set<string>(entityCategories);
const answerSet = new Set<string>(normalizedAnswers);
const questionGroupSet = new Set<string>(questionGroups);
const questionStageSet = new Set<string>(questionStages);

const SPARSE_ATTRIBUTE_WARN_THRESHOLD = 2;
const MIN_GROUPS_PER_CATEGORY = 4;
const WEAK_ENTITY_ATTRIBUTE_THRESHOLD = 10;

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function countKnownAttributes(entity: GameEntity) {
  return attributeKeys.filter((key) => entity.attributes[key] !== "unknown").length;
}

function buildCoverageSummaries(
  entityList: readonly GameEntity[],
  questionList: readonly QuestionDefinition[],
): ContentCoverageSummary[] {
  return entityCategories.map((category) => {
    const categoryEntities = entityList.filter((entity) => entity.category === category);
    const categoryQuestions = questionList.filter((question) =>
      question.supportedCategories.includes(category),
    );
    const familyCounts = new Map<string, number>();

    for (const question of categoryQuestions) {
      familyCounts.set(question.family, (familyCounts.get(question.family) ?? 0) + 1);
    }

    const largestFamily = [...familyCounts.entries()].toSorted(
      (left, right) => right[1] - left[1],
    )[0] ?? ["none", 0];

    return {
      category,
      entityCount: categoryEntities.length,
      questionCount: categoryQuestions.length,
      questionsPer100Entities:
        categoryEntities.length > 0
          ? (categoryQuestions.length / categoryEntities.length) * 100
          : 0,
      weakEntityCount: categoryEntities.filter(
        (entity) => countKnownAttributes(entity) < WEAK_ENTITY_ATTRIBUTE_THRESHOLD,
      ).length,
      stageCounts: Object.fromEntries(
        questionStages.map((stage) => [
          stage,
          categoryQuestions.filter((question) => question.stage === stage).length,
        ]),
      ) as Record<QuestionStage, number>,
      groupCount: new Set(categoryQuestions.map((question) => question.group)).size,
      familyCount: familyCounts.size,
      largestFamily: {
        family: largestFamily[0],
        count: largestFamily[1],
      },
    };
  });
}

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
  const summaries = buildCoverageSummaries(entityList, questionList);

  const seenEntityIds = new Set<string>();
  const seenEntityNames = new Map<string, string>();
  const seenAliases = new Map<string, string>();
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

    for (const [field, value] of [
      ["rarityWeight", entity.rarityWeight],
      ["popularityWeight", entity.popularityWeight],
    ] as const) {
      if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
        errors.push({
          scope: "entities",
          code: "invalid_entity_weight",
          message: `Entity ${entity.id} has invalid ${field} (${String(value)}); expected a finite number > 0`,
        });
      }
    }

    if (seenEntityIds.has(entity.id)) {
      errors.push({
        scope: "entities",
        code: "duplicate_id",
        message: `Duplicate entity id: ${entity.id}`,
      });
    }
    seenEntityIds.add(entity.id);

    const normalizedName = `${entity.category}:${normalizeText(entity.name)}`;
    if (seenEntityNames.has(normalizedName)) {
      errors.push({
        scope: "entities",
        code: "duplicate_name",
        message: `Duplicate entity name in ${entity.category}: ${entity.name}`,
      });
    }
    seenEntityNames.set(normalizedName, entity.id);

    if (!categorySet.has(entity.category)) {
      errors.push({
        scope: "entities",
        code: "invalid_category",
        message: `Entity ${entity.id} has unknown category '${entity.category}'`,
      });
    }

    if (entity.aliases) {
      for (const alias of entity.aliases) {
        if (!alias.trim()) {
          errors.push({
            scope: "entities",
            code: "empty_alias",
            message: `Entity ${entity.id} has an empty alias entry`,
          });
          continue;
        }

        const normalizedAlias = `${entity.category}:${normalizeText(alias)}`;
        if (seenAliases.has(normalizedAlias)) {
          warnings.push({
            scope: "entities",
            code: "duplicate_alias",
            message: `Alias '${alias}' is shared by ${seenAliases.get(normalizedAlias)} and ${entity.id}`,
          });
        }
        seenAliases.set(normalizedAlias, entity.id);
      }
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

  for (const entity of entityList) {
    for (const alias of entity.aliases ?? []) {
      const normalizedAlias = `${entity.category}:${normalizeText(alias)}`;
      const matchingNameOwner = seenEntityNames.get(normalizedAlias);
      if (matchingNameOwner && matchingNameOwner !== entity.id) {
        warnings.push({
          scope: "entities",
          code: "alias_conflicts_with_name",
          message: `Alias '${alias}' on ${entity.id} matches canonical name for ${matchingNameOwner}`,
        });
      }
    }
  }

  const seenQuestionIds = new Set<string>();
  const seenQuestionPrompts = new Map<string, string>();
  const allQuestionIdSet = new Set(questionList.map((question) => question.id));
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

    if (!questionGroupSet.has(question.group)) {
      errors.push({
        scope: "questions",
        code: "invalid_question_group",
        message: `Question ${question.id} references unknown group '${question.group}'`,
      });
    }

    if (!questionStageSet.has(question.stage)) {
      errors.push({
        scope: "questions",
        code: "invalid_question_stage",
        message: `Question ${question.id} references unknown stage '${question.stage}'`,
      });
    }

    if (!question.family.trim()) {
      errors.push({
        scope: "questions",
        code: "empty_question_family",
        message: `Question ${question.id} has an empty family`,
      });
    }

    for (const attributeKey of question.discriminatorFor ?? []) {
      if (!attributeKeySet.has(attributeKey)) {
        errors.push({
          scope: "questions",
          code: "invalid_discriminator_attribute",
          message: `Question ${question.id} has invalid discriminator attribute '${attributeKey}'`,
        });
      }
    }

    for (const requiredQuestionId of question.requiredBefore ?? []) {
      if (!requiredQuestionId.trim()) {
        errors.push({
          scope: "questions",
          code: "empty_question_prerequisite",
          message: `Question ${question.id} has an empty requiredBefore entry`,
        });
      } else if (!allQuestionIdSet.has(requiredQuestionId)) {
        errors.push({
          scope: "questions",
          code: "unknown_question_prerequisite",
          message: `Question ${question.id} requires unknown question '${requiredQuestionId}'`,
        });
      }
    }

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

      const promptKey = `${category}:${normalizeText(question.question)}`;
      if (seenQuestionPrompts.has(promptKey)) {
        warnings.push({
          scope: "questions",
          code: "duplicate_prompt",
          message: `Question prompt is duplicated within ${category}: '${question.question}'`,
        });
      }
      seenQuestionPrompts.set(promptKey, question.id);
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

    const categoryQuestions = questionList.filter((q) => q.supportedCategories.includes(category));
    const broadCount = categoryQuestions.filter((q) => q.stage === "broad").length;
    if (broadCount === 0) {
      errors.push({
        scope: "questions",
        code: "no_broad_questions_for_category",
        message: `Category '${category}' has no broad-stage questions`,
      });
    }

    const groupCount = new Set(categoryQuestions.map((q) => q.group)).size;
    if (groupCount < MIN_GROUPS_PER_CATEGORY) {
      warnings.push({
        scope: "questions",
        code: "low_group_diversity",
        message: `Category '${category}' only spans ${groupCount} question groups`,
      });
    }
  }

  return { errors, warnings, summaries };
}

export function formatCoverageSummary(summaries: readonly ContentCoverageSummary[]) {
  return summaries
    .map(
      (summary) =>
        [
          `${summary.category}: ${summary.entityCount} entities, ${summary.questionCount} questions`,
          `${summary.questionsPer100Entities.toFixed(1)} questions / 100 entities`,
          `${summary.weakEntityCount} weak profiles`,
          `${summary.groupCount} groups`,
          `${summary.familyCount} families`,
          `largest family ${summary.largestFamily.family} (${summary.largestFamily.count})`,
        ].join(" | "),
    )
    .join("\n");
}
