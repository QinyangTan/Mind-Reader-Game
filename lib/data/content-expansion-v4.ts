import { animalExpansionV4 as rawAnimalExpansionV4 } from "@/lib/data/bulk/animals-v4";
import { fictionalCharactersExpansionV4 as rawFictionalCharactersExpansionV4 } from "@/lib/data/bulk/fictional-v4";
import { foodExpansionV4 as rawFoodExpansionV4 } from "@/lib/data/bulk/foods-v4";
import { historicalFiguresExpansionV4 as rawHistoricalFiguresExpansionV4 } from "@/lib/data/bulk/historical-v4";
import { objectExpansionV4 as rawObjectExpansionV4 } from "@/lib/data/bulk/objects-v4";
import { createAnimal, createHistoricalFigure } from "@/lib/data/seed-helpers";
import type { GameEntity } from "@/types/game";

const a = createAnimal;
const h = createHistoricalFigure;

function normalizeEntityName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function finalizeExpansion(
  rawEntities: readonly GameEntity[],
  options: {
    blockedNames?: readonly string[];
    blockedNamePatterns?: readonly RegExp[];
    blockedIds?: readonly string[];
    extras?: readonly GameEntity[];
  } = {},
) {
  const blockedNames = new Set((options.blockedNames ?? []).map(normalizeEntityName));
  const blockedIds = new Set(options.blockedIds ?? []);
  const blockedNamePatterns = options.blockedNamePatterns ?? [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const cleaned: GameEntity[] = [];

  for (const entity of [...rawEntities, ...(options.extras ?? [])]) {
    const normalizedName = normalizeEntityName(entity.name);
    if (blockedIds.has(entity.id) || blockedNames.has(normalizedName)) {
      continue;
    }

    if (blockedNamePatterns.some((pattern) => pattern.test(entity.name))) {
      continue;
    }

    if (seenIds.has(entity.id) || seenNames.has(normalizedName)) {
      continue;
    }

    seenIds.add(entity.id);
    seenNames.add(normalizedName);
    cleaned.push(entity);
  }

  return Object.freeze(cleaned) as readonly GameEntity[];
}

const fictionalBlockedNames = [
  "Magikarp and Gyarados",
  "Caulifla and Kale",
  "Fred and George Weasley",
  "Bulletman and Bulletgirl",
  "Black and White Bandit",
  "Blaze and Satanus",
  "Anju and Kafei",
  "Kang and Kodos",
  "Patty and Selma",
  "Comparison of Star Trek and Star Wars",
];

const animalBlockedNames = [
  "Lineage",
  "South African National Biodiversity Institute",
  "Dipodoidea",
  "Echimys",
  "Ecuador",
  "Edward Blyth",
];

const objectBlockedNames = [
  "Stone and muller",
  "Furniture & Home Improvement Ombudsman",
  "Gordion Furniture and Wooden Artifacts",
  "Pritam & Eames",
  "Gunn & Moore",
  "Carpet hanger",
  "Carpet sweeper",
  "Cleret",
  "Continuous motion pot washing",
  "Dry-ice blasting",
  "Holy Sponge",
  "Ice blasting",
  "Laundroid",
];

const foodBlockedNames = [
  "Rice and beans",
  "Soup and sandwich",
  "Bagel and cream cheese",
  "The Oxford Companion to Sugar and Sweets",
  "You can't have your cake and eat it",
  "Hot and spicy cheese bread",
  "Sponge and dough",
  "Outline of kadayif",
  "Eggplant salads and appetizers",
];

const historicalBlockedNames = [
  "White House",
  "Council of Florence",
  "Fedorov Avtomat",
  "Genko's Forest Belt",
];

const historicalBlockedNamePatterns = [
  /^Presidency of /i,
  /^Mayor of /i,
  /^Battle of /i,
  /^Year of /i,
  /^War of /i,
  /^History of /i,
  /^List of /i,
  /^Governor of /i,
  /^Office of /i,
  /Review/i,
  /Quarterly/i,
  /Institute/i,
  /Publications/i,
  /Society/i,
  /Journal/i,
  /Studies/i,
  /Affairs/i,
  /Biography/i,
];

const animalBlockedNamePatterns = [/(idae|inae)$/i];

const curatedAnimalTopUps = [
  a(
    {
      id: "animal-quokka",
      name: "Quokka",
      shortDescription: "Small marsupial known for a bright expression and herbivorous island life.",
      imageEmoji: "🦘",
      aliases: ["Setonix brachyurus"],
      subcategory: "marsupial",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "small", "wild", "marsupial", "forest_habitat"],
      probably: ["herbivore", "camouflaged"],
      no: ["aquatic", "can_fly", "dangerous"],
    },
  ),
  a(
    {
      id: "animal-numbat",
      name: "Numbat",
      shortDescription: "Striped Australian marsupial that hunts termites by day.",
      imageEmoji: "🦴",
      aliases: ["Banded Anteater"],
      subcategory: "marsupial",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "small", "wild", "marsupial", "striped", "forest_habitat"],
      probably: ["camouflaged"],
      no: ["aquatic", "can_fly", "farm_animal"],
    },
  ),
  a(
    {
      id: "animal-aye-aye",
      name: "Aye-Aye",
      shortDescription: "Nocturnal lemur with a striking finger and tree-dwelling habits.",
      imageEmoji: "🌙",
      subcategory: "primate",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "small", "wild", "nocturnal", "lives_in_trees", "primate", "forest_habitat"],
      probably: ["camouflaged"],
      no: ["aquatic", "farm_animal", "can_fly"],
    },
  ),
  a(
    {
      id: "animal-dugong",
      name: "Dugong",
      shortDescription: "Gentle marine mammal grazing seagrass in warm coastal water.",
      imageEmoji: "🌊",
      subcategory: "marine mammal",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "aquatic", "wild", "large", "lives_in_ocean"],
      probably: ["herbivore"],
      no: ["can_fly", "pet", "farm_animal"],
    },
  ),
  a(
    {
      id: "animal-pangolin",
      name: "Pangolin",
      shortDescription: "Scaled mammal known for rolling into armor-like defense.",
      imageEmoji: "🛡️",
      subcategory: "scaly mammal",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "wild", "small", "forest_habitat"],
      probably: ["camouflaged", "nocturnal"],
      no: ["aquatic", "can_fly", "farm_animal"],
    },
  ),
  a(
    {
      id: "animal-narwhal",
      name: "Narwhal",
      shortDescription: "Arctic whale famous for its long spiral tusk.",
      imageEmoji: "🦄",
      subcategory: "cetacean",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "aquatic", "wild", "large", "lives_in_ocean", "cold_climate"],
      probably: ["dangerous"],
      no: ["can_fly", "pet", "farm_animal"],
    },
  ),
  a(
    {
      id: "animal-shoebill",
      name: "Shoebill",
      shortDescription: "Towering swamp bird with a heavy bill and ancient look.",
      imageEmoji: "🪶",
      subcategory: "bird",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["bird", "wild", "large", "freshwater", "forest_habitat"],
      probably: ["can_fly", "dangerous", "carnivore"],
      no: ["mammal", "pet"],
    },
  ),
  a(
    {
      id: "animal-quoll",
      name: "Quoll",
      shortDescription: "Spotted Australian marsupial predator active after dark.",
      imageEmoji: "🌌",
      subcategory: "marsupial",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "small", "wild", "marsupial", "carnivore", "spotted", "nocturnal", "forest_habitat"],
      no: ["aquatic", "farm_animal"],
    },
  ),
  a(
    {
      id: "animal-saiga",
      name: "Saiga Antelope",
      shortDescription: "Distinctive antelope with a bulbous nose and steppe migrations.",
      imageEmoji: "🦌",
      aliases: ["Saiga"],
      subcategory: "hoofed mammal",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "wild", "large", "herbivore", "hoofed", "has_horns_or_antlers", "desert_habitat"],
      probably: ["camouflaged"],
      no: ["aquatic", "can_fly", "pet"],
    },
  ),
  a(
    {
      id: "animal-markhor",
      name: "Markhor",
      shortDescription: "Mountain goat with dramatic spiral horns.",
      imageEmoji: "⛰️",
      subcategory: "hoofed mammal",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "wild", "large", "herbivore", "hoofed", "has_horns_or_antlers"],
      probably: ["cold_climate"],
      no: ["aquatic", "can_fly", "pet"],
    },
  ),
  a(
    {
      id: "animal-takin",
      name: "Takin",
      shortDescription: "Heavy mountain herbivore with shaggy coat and unusual build.",
      imageEmoji: "🐂",
      subcategory: "hoofed mammal",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "wild", "large", "herbivore", "hoofed", "has_horns_or_antlers"],
      probably: ["cold_climate", "camouflaged"],
      no: ["aquatic", "can_fly", "pet"],
    },
  ),
  a(
    {
      id: "animal-binturong",
      name: "Binturong",
      shortDescription: "Tree-living mammal with a prehensile tail and nocturnal habits.",
      imageEmoji: "🌿",
      aliases: ["Bearcat"],
      subcategory: "arboreal mammal",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "wild", "small", "nocturnal", "lives_in_trees", "forest_habitat"],
      probably: ["carnivore", "camouflaged"],
      no: ["aquatic", "can_fly"],
    },
  ),
  a(
    {
      id: "animal-colugo",
      name: "Colugo",
      shortDescription: "Gliding mammal that lives in Southeast Asian forest canopies.",
      imageEmoji: "🪽",
      aliases: ["Flying Lemur"],
      subcategory: "arboreal mammal",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "wild", "small", "lives_in_trees", "forest_habitat"],
      probably: ["camouflaged", "herbivore"],
      no: ["aquatic", "pet", "can_fly"],
    },
  ),
  a(
    {
      id: "animal-fossa",
      name: "Fossa",
      shortDescription: "Madagascan predator that climbs trees and hunts with stealth.",
      imageEmoji: "🌘",
      subcategory: "predator",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "wild", "large", "carnivore", "forest_habitat", "lives_in_trees"],
      probably: ["camouflaged", "dangerous"],
      no: ["aquatic", "farm_animal"],
    },
  ),
  a(
    {
      id: "animal-kakapo",
      name: "Kakapo",
      shortDescription: "Heavy nocturnal parrot that cannot truly fly.",
      imageEmoji: "🦜",
      subcategory: "bird",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["bird", "wild", "large", "forest_habitat", "nocturnal"],
      probably: ["herbivore", "camouflaged"],
      no: ["can_fly", "aquatic", "pet"],
    },
  ),
  a(
    {
      id: "animal-jerboa",
      name: "Jerboa",
      shortDescription: "Tiny desert rodent with long hind legs and big hops.",
      imageEmoji: "🏜️",
      subcategory: "small mammal",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "small", "wild", "desert_habitat", "nocturnal"],
      probably: ["herbivore", "camouflaged"],
      no: ["aquatic", "can_fly", "farm_animal"],
    },
  ),
  a(
    {
      id: "animal-kinkajou",
      name: "Kinkajou",
      shortDescription: "Nocturnal rainforest mammal with a curled tail and climbing habits.",
      imageEmoji: "🌴",
      subcategory: "arboreal mammal",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "small", "wild", "nocturnal", "lives_in_trees", "forest_habitat"],
      probably: ["herbivore", "camouflaged"],
      no: ["aquatic", "can_fly"],
    },
  ),
  a(
    {
      id: "animal-caracal",
      name: "Caracal",
      shortDescription: "Desert-adapted wild cat with black ear tufts and explosive jumps.",
      imageEmoji: "🐈",
      subcategory: "predator",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "wild", "small", "carnivore", "desert_habitat"],
      probably: ["dangerous", "camouflaged"],
      no: ["aquatic", "farm_animal"],
    },
  ),
  a(
    {
      id: "animal-bonobo",
      name: "Bonobo",
      shortDescription: "Highly social great ape closely related to chimpanzees.",
      imageEmoji: "🦧",
      subcategory: "primate",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "wild", "large", "primate", "forest_habitat"],
      probably: ["herbivore"],
      no: ["aquatic", "can_fly", "farm_animal"],
    },
  ),
  a(
    {
      id: "animal-serval",
      name: "Serval",
      shortDescription: "Long-legged spotted cat known for high leaps in grassland hunts.",
      imageEmoji: "🐆",
      subcategory: "predator",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["mammal", "wild", "small", "carnivore", "spotted"],
      probably: ["dangerous", "camouflaged"],
      no: ["aquatic", "farm_animal"],
    },
  ),
  a(
    {
      id: "animal-axolotl",
      name: "Axolotl",
      shortDescription: "Aquatic salamander with feathery gills and regenerative fame.",
      imageEmoji: "🫧",
      subcategory: "amphibian",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["amphibian", "aquatic", "small", "freshwater"],
      probably: ["pet", "carnivore"],
      no: ["can_fly", "farm_animal", "large"],
    },
  ),
] as const;

const curatedHistoricalTopUps = [
  h(
    {
      id: "historical-hatshepsut",
      name: "Hatshepsut",
      shortDescription: "Powerful pharaoh who ruled Egypt and expanded its prestige.",
      imageEmoji: "👑",
      subcategory: "monarchy",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["female", "ancient", "from_africa", "political_leader", "royal", "ruler_or_emperor"],
      no: ["male", "scientist", "artist"],
    },
  ),
  h(
    {
      id: "historical-hammurabi",
      name: "Hammurabi",
      shortDescription: "Babylonian king remembered for law, rule, and statecraft.",
      imageEmoji: "⚖️",
      subcategory: "law",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "ancient", "from_asia", "political_leader", "royal", "ruler_or_emperor", "jurist_or_lawyer"],
      probably: ["writer"],
      no: ["female", "scientist"],
    },
  ),
  h(
    {
      id: "historical-pericles",
      name: "Pericles",
      shortDescription: "Athenian statesman tied to classical democracy and war.",
      imageEmoji: "🏛️",
      subcategory: "politics",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "ancient", "from_europe", "political_leader"],
      probably: ["military_leader", "writer"],
      no: ["female", "scientist", "royal"],
    },
  ),
  h(
    {
      id: "historical-sun-tzu",
      name: "Sun Tzu",
      shortDescription: "Military strategist whose writing still shapes discussions of war.",
      imageEmoji: "📘",
      subcategory: "strategy",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "ancient", "from_asia", "military_leader", "writer", "philosopher"],
      no: ["female", "royal", "scientist"],
    },
  ),
  h(
    {
      id: "historical-ibn-sina",
      name: "Ibn Sina",
      shortDescription: "Persian polymath known in the West as Avicenna.",
      imageEmoji: "🧠",
      aliases: ["Avicenna"],
      subcategory: "science",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "medieval", "from_asia", "scientist", "physician", "philosopher", "writer"],
      probably: ["educator"],
      no: ["female", "military_leader"],
    },
  ),
  h(
    {
      id: "historical-al-khwarizmi",
      name: "Al-Khwarizmi",
      shortDescription: "Scholar whose mathematical work helped define algebra.",
      imageEmoji: "➗",
      subcategory: "mathematics",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "medieval", "from_asia", "scientist", "mathematician", "writer"],
      probably: ["educator"],
      no: ["female", "military_leader", "royal"],
    },
  ),
  h(
    {
      id: "historical-zheng-he",
      name: "Zheng He",
      shortDescription: "Ming admiral known for major treasure voyages across the seas.",
      imageEmoji: "⛵",
      subcategory: "exploration",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "medieval", "from_asia", "explorer", "diplomat"],
      probably: ["military_leader"],
      no: ["female", "royal", "scientist"],
    },
  ),
  h(
    {
      id: "historical-wu-zetian",
      name: "Wu Zetian",
      shortDescription: "Only woman to rule China as emperor in her own right.",
      imageEmoji: "👸",
      subcategory: "monarchy",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["female", "medieval", "from_asia", "political_leader", "royal", "ruler_or_emperor"],
      probably: ["reformer"],
      no: ["male", "scientist"],
    },
  ),
  h(
    {
      id: "historical-murasaki-shikibu",
      name: "Murasaki Shikibu",
      shortDescription: "Japanese writer associated with The Tale of Genji.",
      imageEmoji: "🪶",
      subcategory: "literature",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["female", "medieval", "from_asia", "writer", "artist"],
      probably: ["educator"],
      no: ["male", "military_leader", "royal"],
    },
  ),
  h(
    {
      id: "historical-rumi",
      name: "Rumi",
      shortDescription: "Poet and mystic whose verses remained globally influential.",
      imageEmoji: "🕊️",
      subcategory: "poetry",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "medieval", "from_asia", "writer", "philosopher", "religious_figure"],
      probably: ["artist"],
      no: ["female", "military_leader"],
    },
  ),
  h(
    {
      id: "historical-thomas-more",
      name: "Thomas More",
      shortDescription: "English writer and statesman remembered for conscience and law.",
      imageEmoji: "📚",
      subcategory: "law",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "modern", "from_europe", "writer", "philosopher", "jurist_or_lawyer"],
      probably: ["reformer"],
      no: ["female", "scientist"],
    },
  ),
  h(
    {
      id: "historical-mary-wollstonecraft",
      name: "Mary Wollstonecraft",
      shortDescription: "Writer and philosopher tied to early feminist thought.",
      imageEmoji: "🕯️",
      subcategory: "philosophy",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["female", "modern", "from_europe", "writer", "philosopher", "reformer", "rights_activist"],
      no: ["male", "military_leader", "royal"],
    },
  ),
  h(
    {
      id: "historical-frederick-douglass",
      name: "Frederick Douglass",
      shortDescription: "Abolitionist orator and writer who reshaped public debate on freedom.",
      imageEmoji: "🗣️",
      subcategory: "reform",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "modern", "from_americas", "writer", "reformer", "rights_activist"],
      probably: ["political_leader", "diplomat"],
      no: ["female", "royal", "scientist"],
    },
  ),
  h(
    {
      id: "historical-sojourner-truth",
      name: "Sojourner Truth",
      shortDescription: "Abolitionist and activist remembered for moral force and speeches.",
      imageEmoji: "🕯️",
      subcategory: "reform",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["female", "modern", "from_americas", "reformer", "rights_activist", "writer"],
      no: ["male", "royal", "scientist"],
    },
  ),
  h(
    {
      id: "historical-sun-yat-sen",
      name: "Sun Yat-sen",
      shortDescription: "Revolutionary political leader central to modern Chinese state formation.",
      imageEmoji: "🌄",
      subcategory: "revolution",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "modern", "from_asia", "political_leader", "reformer", "revolutionary"],
      no: ["female", "royal", "scientist"],
    },
  ),
  h(
    {
      id: "historical-rabindranath-tagore",
      name: "Rabindranath Tagore",
      shortDescription: "Poet, writer, and educator whose work shaped modern Indian culture.",
      imageEmoji: "🎼",
      subcategory: "literature",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "modern", "from_asia", "writer", "artist", "educator"],
      probably: ["philosopher", "composer_or_musician"],
      no: ["female", "military_leader"],
    },
  ),
  h(
    {
      id: "historical-srinivasa-ramanujan",
      name: "Srinivasa Ramanujan",
      shortDescription: "Mathematician remembered for extraordinary intuition and formulas.",
      imageEmoji: "∞",
      subcategory: "mathematics",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "modern", "from_asia", "scientist", "mathematician"],
      no: ["female", "military_leader", "royal"],
    },
  ),
  h(
    {
      id: "historical-rosalind-franklin",
      name: "Rosalind Franklin",
      shortDescription: "Scientist whose imaging work became central to DNA history.",
      imageEmoji: "🧬",
      subcategory: "science",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["female", "modern", "from_europe", "scientist"],
      probably: ["physician"],
      no: ["male", "military_leader", "royal"],
    },
  ),
  h(
    {
      id: "historical-wangari-maathai",
      name: "Wangari Maathai",
      shortDescription: "Environmental activist and reformer from Kenya.",
      imageEmoji: "🌱",
      subcategory: "activism",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["female", "modern", "from_africa", "reformer", "rights_activist", "educator"],
      probably: ["political_leader", "scientist"],
      no: ["male", "royal"],
    },
  ),
  h(
    {
      id: "historical-vaclav-havel",
      name: "Václav Havel",
      shortDescription: "Playwright, dissident, and president tied to democratic transition.",
      imageEmoji: "🎭",
      aliases: ["Vaclav Havel"],
      subcategory: "politics",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "modern", "from_europe", "writer", "reformer", "political_leader"],
      no: ["female", "royal", "scientist"],
    },
  ),
  h(
    {
      id: "historical-jose-rizal",
      name: "José Rizal",
      shortDescription: "Filipino writer and reformer whose legacy fed nationalist change.",
      imageEmoji: "🪶",
      aliases: ["Jose Rizal"],
      subcategory: "reform",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "modern", "from_asia", "writer", "reformer", "revolutionary"],
      probably: ["physician"],
      no: ["female", "royal"],
    },
  ),
  h(
    {
      id: "historical-ibn-battuta",
      name: "Ibn Battuta",
      shortDescription: "Traveler whose journeys stretched across Africa, Asia, and beyond.",
      imageEmoji: "🧭",
      subcategory: "exploration",
      sourceType: "curated v4 top-up",
    },
    {
      yes: ["male", "medieval", "from_africa", "explorer", "writer", "diplomat"],
      no: ["female", "royal", "scientist"],
    },
  ),
] as const;

export const fictionalCharactersExpansionV4 = finalizeExpansion(
  rawFictionalCharactersExpansionV4,
  {
    blockedNames: fictionalBlockedNames,
  },
);

export const animalExpansionV4 = finalizeExpansion(rawAnimalExpansionV4, {
  blockedNames: animalBlockedNames,
  blockedNamePatterns: animalBlockedNamePatterns,
  extras: curatedAnimalTopUps,
});

export const objectExpansionV4 = finalizeExpansion(rawObjectExpansionV4, {
  blockedNames: objectBlockedNames,
});

export const foodExpansionV4 = finalizeExpansion(rawFoodExpansionV4, {
  blockedNames: foodBlockedNames,
});

export const historicalFiguresExpansionV4 = finalizeExpansion(
  rawHistoricalFiguresExpansionV4,
  {
    blockedNames: historicalBlockedNames,
    blockedNamePatterns: historicalBlockedNamePatterns,
    extras: curatedHistoricalTopUps,
  },
);
