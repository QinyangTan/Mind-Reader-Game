import { describe, expect, it } from "vitest";

import {
  TEACH_ENTITY_ID_PREFIX,
  getTeachEntitiesForCategory,
  getTeachableAttributeKeys,
  isTeachEntityId,
  teachCaseToEntity,
} from "@/lib/game/teach";
import type { TeachCase } from "@/types/game";

const sampleCase: TeachCase = {
  id: "sample",
  createdAt: "2024-01-01T00:00:00.000Z",
  category: "fictional_characters",
  difficulty: "normal",
  entityName: "Shadow Walker",
  note: "Silent cloak, never speaks",
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

describe("teachCaseToEntity", () => {
  it("prefixes the id with the teach marker", () => {
    const entity = teachCaseToEntity(sampleCase);
    expect(entity.id).toBe(`${TEACH_ENTITY_ID_PREFIX}${sampleCase.id}`);
    expect(isTeachEntityId(entity.id)).toBe(true);
  });

  it("sets the category-marker attribute to yes", () => {
    const entity = teachCaseToEntity(sampleCase);
    expect(entity.attributes.fictional).toBe("yes");
  });

  it("includes both answered attributes and extraAttributes in the attribute map", () => {
    const entity = teachCaseToEntity(sampleCase);
    expect(entity.attributes.magical).toBe("yes"); // from answers
    expect(entity.attributes.villain).toBe("yes"); // from extraAttributes
  });

  it("leaves unanswered attributes as unknown", () => {
    const entity = teachCaseToEntity(sampleCase);
    expect(entity.attributes.superhero).toBe("unknown");
    expect(entity.attributes.from_anime).toBe("unknown");
  });

  it("falls back to 'Unnamed memory' when the entity name is blank", () => {
    const entity = teachCaseToEntity({ ...sampleCase, entityName: "   " });
    expect(entity.name).toBe("Unnamed memory");
  });

  it("applies the teach emoji and category", () => {
    const entity = teachCaseToEntity(sampleCase);
    expect(entity.category).toBe("fictional_characters");
    expect(entity.imageEmoji).toBe("🧠");
  });
});

describe("getTeachableAttributeKeys", () => {
  it("excludes the fictional marker from the fictional_characters list", () => {
    const keys = getTeachableAttributeKeys("fictional_characters");
    expect(keys).not.toContain("fictional");
  });

  it("excludes the real marker from the animals list", () => {
    const keys = getTeachableAttributeKeys("animals");
    expect(keys).not.toContain("real");
  });
});

describe("getTeachEntitiesForCategory", () => {
  it("filters cases by category and converts each to a GameEntity", () => {
    const mixed: TeachCase[] = [
      sampleCase,
      { ...sampleCase, id: "animal-one", category: "animals", entityName: "Owl" },
    ];
    const fictional = getTeachEntitiesForCategory(mixed, "fictional_characters");
    expect(fictional).toHaveLength(1);
    expect(fictional[0].name).toBe("Shadow Walker");

    const animals = getTeachEntitiesForCategory(mixed, "animals");
    expect(animals).toHaveLength(1);
    expect(animals[0].name).toBe("Owl");
  });
});
