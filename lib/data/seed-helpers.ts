import { attributeKeys, type AttributeKey, type EntityCategory, type GameEntity } from "@/types/game";

interface EntitySeedInput {
  id: string;
  name: string;
  shortDescription: string;
  imageEmoji: string;
  aliases?: string[];
  subcategory?: string;
  sourceType?: string;
  rarityWeight?: number;
  popularityWeight?: number;
  category: EntityCategory;
}

export interface AttributeSeed {
  yes?: readonly AttributeKey[];
  no?: readonly AttributeKey[];
  probably?: readonly AttributeKey[];
  probably_not?: readonly AttributeKey[];
}

function buildAttributeRecord(seed: AttributeSeed) {
  const record = Object.fromEntries(
    attributeKeys.map((key) => [key, "unknown"]),
  ) as GameEntity["attributes"];

  for (const key of seed.no ?? []) {
    record[key] = "no";
  }

  for (const key of seed.yes ?? []) {
    record[key] = "yes";
  }

  for (const key of seed.probably ?? []) {
    record[key] = "probably";
  }

  for (const key of seed.probably_not ?? []) {
    record[key] = "probably_not";
  }

  if (record.male === "yes" && record.female === "unknown") {
    record.female = "no";
  }

  if (record.female === "yes" && record.male === "unknown") {
    record.male = "no";
  }

  if (record.human === "yes" && record.animal_like === "unknown") {
    record.animal_like = "no";
  }

  if (record.animal_like === "yes" && record.human === "unknown") {
    record.human = "no";
  }

  if (record.child === "yes" && record.adult === "unknown") {
    record.adult = "probably_not";
  }

  if (record.adult === "yes" && record.child === "unknown") {
    record.child = "probably_not";
  }

  if (record.mammal === "yes") {
    record.bird = "no";
    record.reptile = "no";
    record.insect = "no";
  }

  if (record.bird === "yes") {
    record.mammal = "no";
    record.reptile = "no";
    record.insect = "no";
  }

  if (record.reptile === "yes") {
    record.mammal = "no";
    record.bird = "no";
    record.insect = "no";
  }

  if (record.insect === "yes") {
    record.mammal = "no";
    record.bird = "no";
    record.reptile = "no";
  }

  if (record.large === "yes" && record.small === "unknown") {
    record.small = "no";
  }

  if (record.small === "yes" && record.large === "unknown") {
    record.large = "no";
  }

  if (record.herbivore === "yes" && record.carnivore === "unknown") {
    record.carnivore = "probably_not";
  }

  if (record.carnivore === "yes" && record.herbivore === "unknown") {
    record.herbivore = "probably_not";
  }

  if (record.living === "yes") {
    if (record.object === "unknown") {
      record.object = "no";
    }
    if (record.food === "unknown") {
      record.food = "no";
    }
    if (record.historical_figure === "unknown") {
      record.historical_figure = "no";
    }
  }

  if (record.object === "yes") {
    record.living = "no";
    record.food = "no";
    record.historical_figure = "no";
  }

  if (record.food === "yes") {
    record.living = "no";
    record.object = "no";
    record.historical_figure = "no";
  }

  if (record.historical_figure === "yes") {
    record.living = "no";
    record.object = "no";
    record.food = "no";
    record.real = "yes";
    record.human = record.human === "unknown" ? "yes" : record.human;
    record.deceased = record.deceased === "unknown" ? "yes" : record.deceased;
  }

  if (record.electronic === "yes" && record.powered === "unknown") {
    record.powered = "probably";
  }

  if (record.has_screen === "yes") {
    record.electronic = "yes";
  }

  if (record.ancient === "yes") {
    record.medieval = record.medieval === "unknown" ? "no" : record.medieval;
    record.modern = record.modern === "unknown" ? "no" : record.modern;
  }

  if (record.medieval === "yes") {
    record.ancient = record.ancient === "unknown" ? "no" : record.ancient;
    record.modern = record.modern === "unknown" ? "no" : record.modern;
  }

  if (record.modern === "yes") {
    record.ancient = record.ancient === "unknown" ? "no" : record.ancient;
    record.medieval = record.medieval === "unknown" ? "no" : record.medieval;
  }

  return record;
}

function createEntity(input: EntitySeedInput, seed: AttributeSeed): GameEntity {
  const attributes = Object.freeze(buildAttributeRecord(seed)) as GameEntity["attributes"];

  return Object.freeze({
    ...input,
    attributes,
  }) as GameEntity;
}

export function createCharacter(
  input: Omit<EntitySeedInput, "category">,
  seed: AttributeSeed,
) {
  return createEntity(
    {
      ...input,
      category: "fictional_characters",
    },
    {
      yes: ["fictional", "living", ...(seed.yes ?? [])],
      no: ["real", "object", "food", "historical_figure", ...(seed.no ?? [])],
      probably: seed.probably,
      probably_not: seed.probably_not,
    },
  );
}

export function createAnimal(input: Omit<EntitySeedInput, "category">, seed: AttributeSeed) {
  return createEntity(
    {
      ...input,
      category: "animals",
    },
    {
      yes: ["real", "living", ...(seed.yes ?? [])],
      no: ["fictional", "object", "food", "historical_figure", ...(seed.no ?? [])],
      probably: seed.probably,
      probably_not: seed.probably_not,
    },
  );
}

export function createObject(input: Omit<EntitySeedInput, "category">, seed: AttributeSeed) {
  return createEntity(
    {
      ...input,
      category: "objects",
    },
    {
      yes: ["real", "object", ...(seed.yes ?? [])],
      no: ["fictional", "living", "food", "historical_figure", "human", "animal_like", ...(seed.no ?? [])],
      probably: seed.probably,
      probably_not: seed.probably_not,
    },
  );
}

export function createFood(input: Omit<EntitySeedInput, "category">, seed: AttributeSeed) {
  return createEntity(
    {
      ...input,
      category: "foods",
    },
    {
      yes: ["real", "food", ...(seed.yes ?? [])],
      no: ["fictional", "living", "object", "historical_figure", "human", "animal_like", ...(seed.no ?? [])],
      probably: seed.probably,
      probably_not: seed.probably_not,
    },
  );
}

export function createHistoricalFigure(input: Omit<EntitySeedInput, "category">, seed: AttributeSeed) {
  return createEntity(
    {
      ...input,
      category: "historical_figures",
    },
    {
      yes: ["real", "historical_figure", "human", "adult", "deceased", "famous_worldwide", ...(seed.yes ?? [])],
      no: ["fictional", "living", "object", "food", "animal_like", ...(seed.no ?? [])],
      probably: seed.probably,
      probably_not: seed.probably_not,
    },
  );
}
