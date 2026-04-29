import type { AttributeKey, GameEntity, NormalizedAnswer } from "@/types/game";

type MutableAttributes = GameEntity["attributes"];

function includesAny(text: string, patterns: readonly RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function entityText(entity: GameEntity) {
  return [
    entity.name,
    entity.shortDescription,
    entity.subcategory ?? "",
    entity.sourceType ?? "",
    ...(entity.aliases ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function setIfUnknown(
  attributes: MutableAttributes,
  key: AttributeKey,
  value: NormalizedAnswer,
) {
  if (attributes[key] === "unknown") {
    attributes[key] = value;
    return true;
  }

  return false;
}

function setComplement(
  attributes: MutableAttributes,
  positive: AttributeKey,
  negative: AttributeKey,
) {
  let changed = false;
  if (attributes[positive] === "yes") {
    changed = setIfUnknown(attributes, negative, "no") || changed;
  }
  if (attributes[negative] === "yes") {
    changed = setIfUnknown(attributes, positive, "no") || changed;
  }
  return changed;
}

function refineObjectAttributes(entity: GameEntity, attributes: MutableAttributes) {
  const text = entityText(entity);
  let changed = false;

  const kitchen = [
    /kitchen|cooker|cookware|utensil|pan|pot|bowl|plate|dish|cup|mug|jar|carafe|decanter/,
    /knife|opener|pitter|peeler|grater|slicer|juicer|mixer|toaster|grill|oven|spoon|fork/,
  ];
  const container = [/bowl|plate|cup|mug|jar|bottle|box|case|bag|basket|bin|chest|carafe|decanter|dish|pan|pot/];
  const tool = [/tool|hammer|screwdriver|wrench|drill|opener|knife|blade|slicer|pitter|peeler|grater|brush|mop|broom|vacuum/];
  const electronics = [/electric|electronic|computer|phone|camera|radio|speaker|keyboard|printer|monitor|screen|television|tv|charger|battery|organ|eyeharp/];
  const display = [/phone|computer|tablet|monitor|screen|television|tv|laptop|display|watch/];
  const furniture = [/chair|table|desk|bed|sofa|couch|shelf|cabinet|dresser|stool|bench|wardrobe/];
  const wearable = [/glove|hat|helmet|shoe|boot|watch|mask|belt|coat|jacket|shirt|dress|ring|necklace|bracelet|wearable/];

  if (includesAny(text, kitchen)) {
    changed = setIfUnknown(attributes, "household", "yes") || changed;
    changed = setIfUnknown(attributes, "kitchen_related", "yes") || changed;
    changed = setIfUnknown(attributes, "cooking_item", "probably") || changed;
    changed = setIfUnknown(attributes, "indoor_use", "yes") || changed;
  }

  if (includesAny(text, container)) {
    changed = setIfUnknown(attributes, "container", "yes") || changed;
    changed = setIfUnknown(attributes, "storage_item", "probably") || changed;
  }

  if (includesAny(text, tool)) {
    changed = setIfUnknown(attributes, "tool", "yes") || changed;
    changed = setIfUnknown(attributes, "portable", "probably") || changed;
  }

  if (includesAny(text, [/knife|blade|slicer|cutter|scissors|pitter|opener|needle|pin|saw|axe|chisel/])) {
    changed = setIfUnknown(attributes, "sharp", "probably") || changed;
  }

  if (includesAny(text, electronics)) {
    changed = setIfUnknown(attributes, "electronic", "yes") || changed;
    changed = setIfUnknown(attributes, "powered", "yes") || changed;
  } else if (includesAny(text, kitchen) || includesAny(text, tool) || includesAny(text, container)) {
    changed = setIfUnknown(attributes, "electronic", "no") || changed;
    changed = setIfUnknown(attributes, "powered", "probably_not") || changed;
  }

  if (includesAny(text, display)) {
    changed = setIfUnknown(attributes, "has_screen", "yes") || changed;
  }

  if (includesAny(text, [/music|instrument|speaker|radio|audio|organ|zither|drum|harp|piano|guitar|viola|dhol/])) {
    changed = setIfUnknown(attributes, "audio_item", "yes") || changed;
    changed = setIfUnknown(attributes, "musical_item", "yes") || changed;
  }

  if (includesAny(text, furniture)) {
    changed = setIfUnknown(attributes, "furniture", "yes") || changed;
    changed = setIfUnknown(attributes, "large", "probably") || changed;
    changed = setIfUnknown(attributes, "portable", "probably_not") || changed;
  }

  if (includesAny(text, wearable)) {
    changed = setIfUnknown(attributes, "wearable", "yes") || changed;
    changed = setIfUnknown(attributes, "body_worn_object", "yes") || changed;
    changed = setIfUnknown(attributes, "portable", "yes") || changed;
  }

  if (includesAny(text, [/clean|soap|sponge|brush|broom|mop|vacuum|duster|laundry/])) {
    changed = setIfUnknown(attributes, "cleaning_related", "yes") || changed;
    changed = setIfUnknown(attributes, "household", "yes") || changed;
  }

  if (includesAny(text, [/steel|metal|iron|copper|aluminum|bronze|brass/])) {
    changed = setIfUnknown(attributes, "made_of_metal", "yes") || changed;
  }
  if (includesAny(text, [/wood|wooden|timber/])) {
    changed = setIfUnknown(attributes, "made_of_wood", "yes") || changed;
  }
  if (includesAny(text, [/glass|crystal|pyrex|decanter/])) {
    changed = setIfUnknown(attributes, "made_of_glass", "yes") || changed;
  }
  if (includesAny(text, [/plastic|resin|melamine|rubber/])) {
    changed = setIfUnknown(attributes, "made_of_plastic", "yes") || changed;
  }
  if (includesAny(text, [/book|paper|card|notebook|label|poster|map|newspaper|magazine/])) {
    changed = setIfUnknown(attributes, "paper_based", "yes") || changed;
    changed = setIfUnknown(attributes, "writes_or_records", "probably") || changed;
    changed = setIfUnknown(attributes, "desk_item", "probably") || changed;
  }
  if (includesAny(text, [/desk|office|pen|pencil|notebook|stapler|printer|keyboard|mouse|folder|calculator/])) {
    changed = setIfUnknown(attributes, "desk_item", "yes") || changed;
    changed = setIfUnknown(attributes, "office_related", "yes") || changed;
  }
  if (includesAny(text, [/lamp|lantern|light|candle|flashlight|torch/])) {
    changed = setIfUnknown(attributes, "lighting_item", "yes") || changed;
  }

  changed = setComplement(attributes, "large", "small") || changed;
  return changed;
}

function refineFoodAttributes(entity: GameEntity, attributes: MutableAttributes) {
  const text = entityText(entity);
  let changed = false;

  if (includesAny(text, [/rice|arroz|polo|bariis|risotto|paella|biryani|pilaf|jollof/])) {
    changed = setIfUnknown(attributes, "rice_based", "yes") || changed;
    changed = setIfUnknown(attributes, "rice_dish", "yes") || changed;
    changed = setIfUnknown(attributes, "grain_based", "yes") || changed;
  }
  if (includesAny(text, [/noodle|pasta|ramen|soba|udon|spaghetti|macaroni|kugel|csusza/])) {
    changed = setIfUnknown(attributes, "noodle_based", "yes") || changed;
    changed = setIfUnknown(attributes, "noodle_dish", "yes") || changed;
    changed = setIfUnknown(attributes, "grain_based", "yes") || changed;
  }
  if (includesAny(text, [/bread|bagel|sandwich|burger|taco|burrito|naan|pita|pizza|dumpling|bun|pastry/])) {
    changed = setIfUnknown(attributes, "grain_based", "yes") || changed;
    changed = setIfUnknown(attributes, "handheld", "probably") || changed;
    changed = setIfUnknown(attributes, "portable", "probably") || changed;
    changed = setIfUnknown(attributes, "sandwich_like", "probably") || changed;
  }
  if (includesAny(text, [/soup|stew|broth|bisque|bouillon|pottage|harira|avgolemono/])) {
    changed = setIfUnknown(attributes, "soup_or_stew", "yes") || changed;
    changed = setIfUnknown(attributes, "soup_dish", "yes") || changed;
    changed = setIfUnknown(attributes, "served_hot", "probably") || changed;
    changed = setIfUnknown(attributes, "savory", "probably") || changed;
  }
  if (includesAny(text, [/cake|cookie|pie|pudding|ice cream|gelato|sweet|dessert|chocolate|candy|pastry|kugel/])) {
    changed = setIfUnknown(attributes, "sweet", "yes") || changed;
    changed = setIfUnknown(attributes, "dessert", "probably") || changed;
    changed = setIfUnknown(attributes, "dessert_pastry", "probably") || changed;
  }
  if (includesAny(text, [/coffee|tea|juice|beer|wine|milkshake|smoothie|soda|cocoa|drink/])) {
    changed = setIfUnknown(attributes, "drinkable", "yes") || changed;
    changed = setIfUnknown(attributes, "beverage", "yes") || changed;
  }
  if (includesAny(text, [/fish|crab|shrimp|prawn|oyster|clam|lobster|salmon|tuna|seafood/])) {
    changed = setIfUnknown(attributes, "seafood", "yes") || changed;
    changed = setIfUnknown(attributes, "meat_based", "probably") || changed;
  }
  if (includesAny(text, [/chicken|beef|pork|bacon|lamb|mutton|meat|sausage|oxtail|liver/])) {
    changed = setIfUnknown(attributes, "meat_based", "yes") || changed;
  }
  if (includesAny(text, [/cheese|cream|milk|yogurt|butter|dairy|curd/])) {
    changed = setIfUnknown(attributes, "dairy_based", "yes") || changed;
  }
  if (includesAny(text, [/kimchi|miso|sauerkraut|pickle|pickled|kefir|yogurt|fermented/])) {
    changed = setIfUnknown(attributes, "fermented", "yes") || changed;
  }
  if (includesAny(text, [/chili|chilli|curry|salsa|pepper|spicy|hot sauce|harissa|berbere/])) {
    changed = setIfUnknown(attributes, "spicy", "probably") || changed;
  }
  if (includesAny(text, [/sushi|ramen|udon|soba|kimchi|miso|pho|banh|biryani|curry|naan|mochi|tsuivan|kugel/])) {
    changed = setIfUnknown(attributes, "cuisine_asian", "yes") || changed;
  }
  if (includesAny(text, [/pasta|pizza|risotto|paella|bagel|kugel|csusza|bisque|bouillon|kulajda|pierogi/])) {
    changed = setIfUnknown(attributes, "cuisine_european", "probably") || changed;
  }
  if (includesAny(text, [/burger|barbecue|maryland|clam chowder|jambalaya|cornbread|sandwich/])) {
    changed = setIfUnknown(attributes, "cuisine_american", "probably") || changed;
  }
  if (includesAny(text, [/harira|abgoosht|beyran|tharida|haneeth|kebab|falafel|tagine|couscous|injera/])) {
    changed = setIfUnknown(attributes, "cuisine_middle_eastern_or_african", "probably") || changed;
  }
  if (includesAny(text, [/fried|fritter|tempura|fries|donut|doughnut/])) {
    changed = setIfUnknown(attributes, "fried", "yes") || changed;
  }
  if (includesAny(text, [/baked|bread|cake|pie|cookie|pastry|pizza|bagel/])) {
    changed = setIfUnknown(attributes, "baked", "probably") || changed;
  }
  if (includesAny(text, [/breakfast|bagel|pancake|waffle|cereal|omelet|porridge/])) {
    changed = setIfUnknown(attributes, "breakfast_food", "probably") || changed;
  }

  return changed;
}

function refineHistoricalAttributes(entity: GameEntity, attributes: MutableAttributes) {
  const text = entityText(entity);
  let changed = false;

  if (
    includesAny(text, [
      /\b(mary|maria|marie|anna|anne|elizabeth|catherine|katherine|ada|grace|rosalind|florence|edith|ellen|emily|eunice|fe del mundo|hatshepsut|joan|cleopatra|wu zetian|murasaki|sojourner|wangari)\b/,
    ])
  ) {
    changed = setIfUnknown(attributes, "female", "yes") || changed;
    changed = setIfUnknown(attributes, "male", "no") || changed;
  } else if (
    includesAny(text, [
      /\b(abbas|abram|adolf|alan|albert|alexander|alfred|andrew|anthony|archimedes|aristotle|charles|david|edward|enrico|francis|frank|frederick|friedrich|george|henry|isaac|james|john|joseph|leonardo|louis|michael|nikola|paul|peter|robert|thomas|william)\b/,
    ])
  ) {
    changed = setIfUnknown(attributes, "male", "yes") || changed;
    changed = setIfUnknown(attributes, "female", "no") || changed;
  }

  if (includesAny(text, [/\b(ibn|al-|abu|muhammad|avicenna|khwarizmi|zheng|sun|wu|wang|li |liu|chen|tagore|ramanujan|rizal|battuta|confucius|buddha|genghis)\b/])) {
    changed = setIfUnknown(attributes, "from_asia", "probably") || changed;
  }
  if (includesAny(text, [/\b(mansa|maathai|cleopatra|hatshepsut|egypt|mali|ethiopia|africa|mandela|tutu|nkrumah)\b/])) {
    changed = setIfUnknown(attributes, "from_africa", "probably") || changed;
  }
  if (includesAny(text, [/\b(washington|lincoln|jefferson|franklin|douglass|truth|rizal|havel|bolivar|americas|american)\b/])) {
    changed = setIfUnknown(attributes, "from_americas", "probably") || changed;
  }
  if (
    includesAny(text, [
      /\b(von|van|da vinci|michelangelo|shakespeare|newton|darwin|tesla|curie|galileo|napoleon|charlemagne|joan|europe|italy|france|german|british|english|russian|spanish|greek|roman)\b/,
    ])
  ) {
    changed = setIfUnknown(attributes, "from_europe", "probably") || changed;
  }

  if (includesAny(text, [/architect|architecture|building|dushkin/])) {
    changed = setIfUnknown(attributes, "architect", "yes") || changed;
  }
  if (includesAny(text, [/lawyer|jurist|judge|law/])) {
    changed = setIfUnknown(attributes, "jurist_or_lawyer", "yes") || changed;
  }
  if (includesAny(text, [/doctor|physician|medicine|medical|surgeon|insulin|vaccine|public health/])) {
    changed = setIfUnknown(attributes, "physician", "probably") || changed;
    changed = setIfUnknown(attributes, "medical_figure", "probably") || changed;
  }
  if (includesAny(text, [/mathematician|math|algebra|calculus|ramanujan|turing/])) {
    changed = setIfUnknown(attributes, "mathematician", "yes") || changed;
    changed = setIfUnknown(attributes, "math_or_computing", "yes") || changed;
  }
  if (includesAny(text, [/astronomer|astronomy|space|cosmos|telescope|gabor|galileo|kepler|copernicus/])) {
    changed = setIfUnknown(attributes, "astronomer", "probably") || changed;
  }
  if (includesAny(text, [/composer|musician|music|symphony|song/])) {
    changed = setIfUnknown(attributes, "composer_or_musician", "yes") || changed;
    changed = setIfUnknown(attributes, "arts_or_literature", "probably") || changed;
  }
  if (includesAny(text, [/diplomat|ambassador|treaty|foreign minister/])) {
    changed = setIfUnknown(attributes, "diplomat", "yes") || changed;
  }
  if (includesAny(text, [/revolution|revolutionary|independence|resistance/])) {
    changed = setIfUnknown(attributes, "revolutionary", "yes") || changed;
  }
  if (includesAny(text, [/rights|abolition|suffrage|activist|civil rights/])) {
    changed = setIfUnknown(attributes, "rights_activist", "yes") || changed;
    changed = setIfUnknown(attributes, "civil_rights_leader", "yes") || changed;
    changed = setIfUnknown(attributes, "reformer", "probably") || changed;
  }
  if (includesAny(text, [/invent|engineer|technology|technical|computer|telephone|electric|patent|breakthrough/])) {
    changed = setIfUnknown(attributes, "technology_innovator", "yes") || changed;
    changed = setIfUnknown(attributes, "inventor", "probably") || changed;
  }
  if (includesAny(text, [/empire|emperor|king|queen|pharaoh|conqueror|khan|mansa|caesar|napoleon/])) {
    changed = setIfUnknown(attributes, "empire_builder", "probably") || changed;
    changed = setIfUnknown(attributes, "ruler_or_emperor", "probably") || changed;
  }
  if (includesAny(text, [/artist|writer|poet|novel|playwright|literature|painting|sculptor|philosopher/])) {
    changed = setIfUnknown(attributes, "arts_or_literature", "yes") || changed;
  }

  changed = setComplement(attributes, "male", "female") || changed;
  return changed;
}

export function refineEntityAttributes(entity: GameEntity): GameEntity {
  const attributes = { ...entity.attributes };
  let changed = false;

  if (entity.category === "objects") {
    changed = refineObjectAttributes(entity, attributes) || changed;
  } else if (entity.category === "foods") {
    changed = refineFoodAttributes(entity, attributes) || changed;
  } else if (entity.category === "historical_figures") {
    changed = refineHistoricalAttributes(entity, attributes) || changed;
  }

  if (!changed) {
    return entity;
  }

  return Object.freeze({
    ...entity,
    attributes: Object.freeze(attributes),
  }) as GameEntity;
}
