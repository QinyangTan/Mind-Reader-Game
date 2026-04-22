import { describe, expect, it } from "vitest";

import {
  applyResolvedEntityAnswers,
  applyTeachCaseLearning,
  defaultLearnedInferenceModel,
  getQuestionUsefulnessMultiplier,
  getSmoothedLikelihood,
  recordQuestionEntropyDrop,
  recordReadEntityConfirmation,
} from "@/lib/game/inference-model";
import { teachCaseToEntity } from "@/lib/game/teach";
import type { GameEntity, TeachCase } from "@/types/game";

const sampleEntity: GameEntity = teachCaseToEntity({
  id: "shadow",
  createdAt: "2024-01-01T00:00:00.000Z",
  category: "fictional_characters",
  difficulty: "normal",
  entityName: "Shadow Walker",
  note: "",
  answers: [
    {
      questionId: "fiction-magical",
      attributeKey: "magical",
      prompt: "Are they tied to magic?",
      answer: "yes",
      askedAt: "2024-01-01T00:00:00.000Z",
    },
  ],
  extraAttributes: {
    villain: "yes",
  },
});

describe("getSmoothedLikelihood", () => {
  it("never collapses a contradiction to zero thanks to additive smoothing", () => {
    const exact = getSmoothedLikelihood(
      defaultLearnedInferenceModel,
      "fictional_characters",
      "magical",
      "yes",
      "yes",
    );
    const contradiction = getSmoothedLikelihood(
      defaultLearnedInferenceModel,
      "fictional_characters",
      "magical",
      "yes",
      "no",
    );

    expect(exact).toBeGreaterThan(contradiction);
    expect(contradiction).toBeGreaterThan(0);
  });

  it("shifts upward when confirmed observations accumulate for that mapping", () => {
    let model = defaultLearnedInferenceModel;

    for (let i = 0; i < 6; i += 1) {
      model = applyResolvedEntityAnswers(
        recordReadEntityConfirmation(model, sampleEntity.id),
        "fictional_characters",
        sampleEntity,
        [
          {
            questionId: "fiction-magical",
            attributeKey: "magical",
            prompt: "Are they tied to magic?",
            answer: "yes",
            askedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      );
    }

    const base = getSmoothedLikelihood(
      defaultLearnedInferenceModel,
      "fictional_characters",
      "magical",
      "yes",
      "yes",
    );
    const learned = getSmoothedLikelihood(
      model,
      "fictional_characters",
      "magical",
      "yes",
      "yes",
    );

    expect(learned).toBeGreaterThan(base);
  });
});

describe("question utility learning", () => {
  it("raises the usefulness multiplier when a question repeatedly drops entropy", () => {
    let model = defaultLearnedInferenceModel;
    model = recordQuestionEntropyDrop(model, "fiction-human", 0.22);
    model = recordQuestionEntropyDrop(model, "fiction-human", 0.18);

    expect(getQuestionUsefulnessMultiplier(model, "fiction-human")).toBeGreaterThan(1);
  });
});

describe("applyTeachCaseLearning", () => {
  it("records both entity confirmation and attribute observations from a teach case", () => {
    const teachCase: TeachCase = {
      id: "teach-1",
      createdAt: "2024-01-01T00:00:00.000Z",
      category: "fictional_characters",
      difficulty: "normal",
      entityName: "Shadow Walker",
      note: "",
      answers: [
        {
          questionId: "fiction-magical",
          attributeKey: "magical",
          prompt: "Are they tied to magic?",
          answer: "yes",
          askedAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      extraAttributes: {
        villain: "yes",
      },
    };

    const learned = applyTeachCaseLearning(defaultLearnedInferenceModel, teachCase);
    const teachEntity = teachCaseToEntity(teachCase);

    expect(learned.readEntityCounts[teachEntity.id]).toBe(1);
    expect(
      getSmoothedLikelihood(
        learned,
        "fictional_characters",
        "magical",
        "yes",
        "yes",
      ),
    ).toBeGreaterThan(
      getSmoothedLikelihood(
        defaultLearnedInferenceModel,
        "fictional_characters",
        "magical",
        "yes",
        "yes",
      ),
    );
  });
});
