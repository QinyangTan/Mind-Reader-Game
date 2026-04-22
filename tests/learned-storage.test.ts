import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  defaultLearnedStore,
  loadLearnedEntities,
  mergeLegacyTeachCases,
  prependLearnedEntity,
  saveLearnedEntities,
} from "@/lib/game/learned-storage";
import type { TeachCase } from "@/types/game";

const KEY = "mind-reader.learned.v1";

function makeCase(id: string, partial: Partial<TeachCase> = {}): TeachCase {
  return {
    id,
    createdAt: "2024-01-01T00:00:00.000Z",
    category: "animals",
    difficulty: "easy",
    entityName: id,
    note: "",
    answers: [],
    ...partial,
  };
}

function stubLocalStorage() {
  const store: Record<string, string> = {};
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) {
          delete store[k];
        }
      },
    },
  });
  return store;
}

describe("loadLearnedEntities", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = stubLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the default store when storage is empty", () => {
    expect(loadLearnedEntities()).toEqual(defaultLearnedStore);
  });

  it("drops entries missing required fields", () => {
    store[KEY] = JSON.stringify({
      version: 2,
      entries: [
        makeCase("ok"),
        {
          // missing createdAt
          id: "bad-no-createdAt",
          category: "animals",
          difficulty: "easy",
          entityName: "X",
          note: "",
          answers: [],
        },
        { foo: "bar" },
      ],
    });

    const loaded = loadLearnedEntities();
    expect(loaded.entries).toHaveLength(1);
    expect(loaded.entries[0].id).toBe("ok");
  });

  it("sanitizes extraAttributes: drops unknown keys and invalid values", () => {
    store[KEY] = JSON.stringify({
      version: 2,
      entries: [
        makeCase("e1", {
          extraAttributes: {
            magical: "yes",          // valid
            notARealKey: "yes",      // drop: unknown key
            human: "maybe",          // drop: invalid NormalizedAnswer
          } as unknown as TeachCase["extraAttributes"],
        }),
      ],
    });

    const loaded = loadLearnedEntities();
    expect(loaded.entries[0].extraAttributes).toEqual({ magical: "yes" });
  });

  it("omits extraAttributes entirely when sanitization leaves nothing", () => {
    store[KEY] = JSON.stringify({
      version: 2,
      entries: [
        makeCase("e1", {
          extraAttributes: {
            notARealKey: "yes",
          } as unknown as TeachCase["extraAttributes"],
        }),
      ],
    });

    const loaded = loadLearnedEntities();
    expect(loaded.entries[0].extraAttributes).toBeUndefined();
  });

  it("tolerates a corrupt payload by returning the default store", () => {
    store[KEY] = "{{ not json";
    expect(loadLearnedEntities()).toEqual(defaultLearnedStore);
  });
});

describe("mergeLegacyTeachCases", () => {
  it("dedupes by id when merging", () => {
    const existing = { ...defaultLearnedStore, entries: [makeCase("a")] };
    const legacy = [makeCase("a"), makeCase("b")];
    const merged = mergeLegacyTeachCases(existing, legacy);
    const ids = merged.entries.map((e) => e.id).sort();
    expect(ids).toEqual(["a", "b"]);
  });

  it("is a no-op when legacy is empty", () => {
    const existing = { ...defaultLearnedStore, entries: [makeCase("a")] };
    expect(mergeLegacyTeachCases(existing, [])).toBe(existing);
  });
});

describe("prependLearnedEntity + saveLearnedEntities cap", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = stubLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prepends the new entry at the front of the list", () => {
    const base = { ...defaultLearnedStore, entries: [makeCase("old")] };
    const next = prependLearnedEntity(base, makeCase("new"));
    expect(next.entries[0].id).toBe("new");
    expect(next.entries[1].id).toBe("old");
  });

  it("caps persisted entries at the store's maximum", () => {
    const huge = Array.from({ length: 200 }, (_, i) => makeCase(`c-${i}`));
    saveLearnedEntities({ ...defaultLearnedStore, entries: huge });

    const loaded = loadLearnedEntities();
    // Exact cap is an internal constant; we just assert it's bounded and
    // significantly below the raw input size.
    expect(loaded.entries.length).toBeLessThan(huge.length);
    expect(loaded.entries.length).toBeGreaterThan(0);
    expect(store[KEY]).toBeDefined();
  });

  it("migrates a v1 learned store into the v2 shape with a default model", () => {
    store[KEY] = JSON.stringify({
      version: 1,
      entries: [makeCase("legacy")],
    });

    const loaded = loadLearnedEntities();
    expect(loaded.version).toBe(2);
    expect(loaded.entries).toHaveLength(1);
    expect(loaded.model.attributeAnswerCounts).toEqual({});
  });
});
