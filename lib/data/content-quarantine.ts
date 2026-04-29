import type { EntityCategory } from "@/types/game";

export interface QuarantinedEntityRecord {
  id: string;
  category: EntityCategory;
  reason: string;
}

export const quarantinedEntityRecords: readonly QuarantinedEntityRecord[] = Object.freeze([
  {
    id: "historical-byzantine-senate",
    category: "historical_figures",
    reason: "organization-like seed; not a single historical person",
  },
  {
    id: "historical-council-of-florence",
    category: "historical_figures",
    reason: "event/council seed; not a single historical person",
  },
  {
    id: "historical-demographics-of-belgium",
    category: "historical_figures",
    reason: "demographic topic seed; not a historical person",
  },
  {
    id: "historical-encyclopedia-britannica",
    category: "historical_figures",
    reason: "publication seed; not a single historical person",
  },
  {
    id: "historical-first-arab-siege-of-constantinople",
    category: "historical_figures",
    reason: "event seed; not a single historical person",
  },
  {
    id: "historical-latin-emperor",
    category: "historical_figures",
    reason: "title/office seed; not a canonical individual",
  },
  {
    id: "historical-madrid-skylitzes",
    category: "historical_figures",
    reason: "manuscript seed; not a single historical person",
  },
  {
    id: "historical-manasses-chronicle",
    category: "historical_figures",
    reason: "chronicle/manuscript seed; not a single historical person",
  },
  {
    id: "historical-martinus-nijhoff-publishers",
    category: "historical_figures",
    reason: "publisher/organization seed; not a single historical person",
  },
  {
    id: "historical-middle-east",
    category: "historical_figures",
    reason: "region seed; not a historical person",
  },
  {
    id: "historical-pannonia-superior",
    category: "historical_figures",
    reason: "province/place seed; not a historical person",
  },
  {
    id: "historical-plague-of-cyprian",
    category: "historical_figures",
    reason: "event/disease seed; not a historical person",
  },
  {
    id: "historical-praetorian-guard",
    category: "historical_figures",
    reason: "organization-like seed; not a single historical person",
  },
  {
    id: "historical-presidency-of-warren-g-harding",
    category: "historical_figures",
    reason: "office-period seed; canonical person already exists separately",
  },
  {
    id: "historical-roman-senate",
    category: "historical_figures",
    reason: "institution seed; not a single historical person",
  },
  {
    id: "historical-sea-of-marmara",
    category: "historical_figures",
    reason: "place seed; not a historical person",
  },
  {
    id: "historical-second-triumvirate",
    category: "historical_figures",
    reason: "group/event seed; not a single historical person",
  },
  {
    id: "historical-spread-of-islam",
    category: "historical_figures",
    reason: "historical process seed; not a single historical person",
  },
  {
    id: "historical-siege-of-alexandria",
    category: "historical_figures",
    reason: "event seed; not a single historical person",
  },
  {
    id: "historical-siege-of-aquileia",
    category: "historical_figures",
    reason: "event seed; not a single historical person",
  },
  {
    id: "historical-siege-of-bari",
    category: "historical_figures",
    reason: "event seed; not a single historical person",
  },
  {
    id: "historical-siege-of-chandax",
    category: "historical_figures",
    reason: "event seed; not a single historical person",
  },
  {
    id: "historical-siege-of-constantinople",
    category: "historical_figures",
    reason: "event seed; not a single historical person",
  },
  {
    id: "historical-siege-of-trebizond",
    category: "historical_figures",
    reason: "event seed; not a single historical person",
  },
  {
    id: "historical-the-twelve-caesars",
    category: "historical_figures",
    reason: "book/group seed; not a single historical person",
  },
  {
    id: "historical-the-annals",
    category: "historical_figures",
    reason: "book/work seed; not a single historical person",
  },
  {
    id: "historical-theodosian-code",
    category: "historical_figures",
    reason: "legal-code seed; not a single historical person",
  },
  {
    id: "historical-theodosian-walls",
    category: "historical_figures",
    reason: "structure seed; not a historical person",
  },
  {
    id: "historical-trapezuntine-civil-wars",
    category: "historical_figures",
    reason: "event cluster seed; not a single historical person",
  },
  {
    id: "historical-varangian-guard",
    category: "historical_figures",
    reason: "organization-like seed; not a single historical person",
  },
  {
    id: "historical-war-democrat",
    category: "historical_figures",
    reason: "political label seed; not a single historical person",
  },
  {
    id: "food-bread-price-fixing-in-canada",
    category: "foods",
    reason: "event/legal topic seed; not a playable food",
  },
  {
    id: "food-eid-al-fitr",
    category: "foods",
    reason: "holiday seed; not a playable food",
  },
  {
    id: "food-haribo",
    category: "foods",
    reason: "brand/company seed; use concrete candies as playable foods instead",
  },
  {
    id: "food-soup-kitchen",
    category: "foods",
    reason: "institution seed; not a playable food",
  },
  {
    id: "food-staling",
    category: "foods",
    reason: "food-aging process seed; not a playable food",
  },
  {
    id: "food-soup-spoon",
    category: "foods",
    reason: "utensil seed; belongs in objects, not active foods",
  },
  {
    id: "animal-angel-cabrera",
    category: "animals",
    reason: "person seed; not a playable animal",
  },
  {
    id: "animal-coast",
    category: "animals",
    reason: "place/ecosystem seed; not a playable animal",
  },
  {
    id: "animal-constantine-samuel-rafinesque",
    category: "animals",
    reason: "person seed; not a playable animal",
  },
  {
    id: "animal-corm",
    category: "animals",
    reason: "plant anatomy seed; not a playable animal",
  },
  {
    id: "animal-just-leopold-frisch",
    category: "animals",
    reason: "person seed; not a playable animal",
  },
  {
    id: "animal-not-evaluated",
    category: "animals",
    reason: "metadata/status seed; not a playable animal",
  },
  {
    id: "object-live-edge",
    category: "objects",
    reason: "woodworking style seed; not a discrete playable object",
  },
  {
    id: "object-metal-furniture",
    category: "objects",
    reason: "broad material category seed; too generic for active object play",
  },
  {
    id: "object-modern-furniture",
    category: "objects",
    reason: "broad furniture style/category seed; not a specific playable object",
  },
  {
    id: "object-noble-households",
    category: "objects",
    reason: "social group/topic seed; not a playable object",
  },
  {
    id: "object-occasional-furniture",
    category: "objects",
    reason: "broad furniture category seed; not a specific playable object",
  },
  {
    id: "object-park-furniture",
    category: "objects",
    reason: "broad furniture category seed; not a specific playable object",
  },
  {
    id: "object-multifunctional-furniture",
    category: "objects",
    reason: "broad furniture category seed; not a specific playable object",
  },
  {
    id: "object-ready-to-assemble-furniture",
    category: "objects",
    reason: "broad furniture category seed; not a specific playable object",
  },
  {
    id: "object-salone-del-mobile",
    category: "objects",
    reason: "event seed; not a playable object",
  },
  {
    id: "object-sex-swing",
    category: "objects",
    reason: "adult-oriented object seed; unsuitable for general public gameplay",
  },
  {
    id: "object-tokyo-designers-week",
    category: "objects",
    reason: "event seed; not a playable object",
  },
  {
    id: "object-transitional-style",
    category: "objects",
    reason: "design-style seed; not a discrete playable object",
  },
  {
    id: "object-walk-in-closet",
    category: "objects",
    reason: "room/space seed; not a discrete playable object",
  },
]);

export const quarantinedEntityIds = new Set(
  quarantinedEntityRecords.map((record) => record.id),
);

export const quarantineReasonById = new Map(
  quarantinedEntityRecords.map((record) => [record.id, record.reason] as const),
);
