import { describe, expect, it } from "vitest";

import {
  entityMatchesLookup,
  findEntityByNameOrAlias,
  normalizeEntityLookupText,
} from "@/lib/data/entities";

describe("entity alias lookup", () => {
  it("normalizes punctuation and spacing for canonical lookup", () => {
    expect(normalizeEntityLookupText(" Spider-Man!! ")).toBe("spider man");
  });

  it("finds seeded entities by alias without needing duplicate entities", () => {
    const phone = findEntityByNameOrAlias("objects", "cell phone");
    expect(phone?.id).toBe("smartphone");
  });

  it("matches aliases during search filtering", () => {
    const phone = findEntityByNameOrAlias("objects", "phone");
    expect(phone).not.toBeNull();
    expect(entityMatchesLookup(phone!, "mobile")).toBe(true);
  });
});
