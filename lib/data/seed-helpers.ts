import { attributeKeys, type AttributeKey, type EntityCategory, type GameEntity } from "@/types/game";

interface EntitySeedInput {
  id: string;
  name: string;
  shortDescription: string;
  imageEmoji: string;
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
  }

  if (record.bird === "yes") {
    record.mammal = "no";
    record.reptile = "no";
  }

  if (record.reptile === "yes") {
    record.mammal = "no";
    record.bird = "no";
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
      yes: ["fictional", ...(seed.yes ?? [])],
      no: ["real", ...(seed.no ?? [])],
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
      yes: ["real", ...(seed.yes ?? [])],
      no: ["fictional", ...(seed.no ?? [])],
      probably: seed.probably,
      probably_not: seed.probably_not,
    },
  );
}
