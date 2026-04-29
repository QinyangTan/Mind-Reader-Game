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

function setAttribute(
  attributes: MutableAttributes,
  key: AttributeKey,
  value: NormalizedAnswer,
) {
  if (attributes[key] === value) {
    return false;
  }

  attributes[key] = value;
  return true;
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
  const seating = [/chair|sofa|couch|stool|bench|seat|ottoman|gueridon|fauteuil/];
  const tableSurface = [/table|desk|counter|shelf|stand|surface|gueridon|nightstand|workbench/];
  const storageFurniture = [/cabinet|dresser|wardrobe|closet|hutch|chest|shelf|bookcase|drawer|rack|basket/];
  const wearable = [/glove|hat|helmet|shoe|boot|watch|mask|belt|coat|jacket|shirt|dress|ring|necklace|bracelet|wearable/];
  const personalAccessory = [/glove|hat|helmet|watch|mask|belt|ring|necklace|bracelet|wallet|purse|bag|backpack|sunglasses|umbrella/];
  const personalCare = [/comb|razor|toothbrush|soap|shampoo|towel|mirror|cosmetic|perfume|makeup|hairbrush/];
  const decorative = [/decor|ornament|vase|statue|figurine|frame|poster|painting|artwork|sculpture|tapestry|wall hanging/];
  const fastener = [/button|zipper|clip|pin|nail|screw|bolt|hook|lock|latch|buckle|clasp|staple/];
  const measuring = [/ruler|scale|thermometer|meter|gauge|measuring|compass|protractor|tape measure|caliper/];
  const textile = [/cloth|fabric|textile|towel|blanket|curtain|rug|carpet|shirt|dress|coat|jacket|scarf|linen/];
  const bladed = [/knife|blade|scissors|saw|axe|razor|cutter|scalpel|chisel|slicer/];
  const heating = [/oven|toaster|heater|stove|kettle|iron|candle|torch|fireplace|radiator|grill/];
  const imaging = [/camera|photo|lens|telescope|microscope|binocular|mirror|scanner|projector|printer/];
  const timekeeping = [/clock|watch|timer|calendar|sundial|hourglass|stopwatch/];
  const repair = [/hammer|screwdriver|wrench|drill|nail|screw|bolt|tape|glue|pliers|spanner|saw/];
  const writingTool = [/pen|pencil|marker|crayon|chalk|stylus|brush|typewriter|notebook|journal|clipboard/];
  const recreation = [/ball|game|toy|sport|skate|bicycle|helmet|racket|guitar|violin|drum|puzzle|cards|dice/];

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

  if (includesAny(text, seating)) {
    changed = setIfUnknown(attributes, "seating_item", "yes") || changed;
    changed = setIfUnknown(attributes, "furniture", "yes") || changed;
  }

  if (includesAny(text, tableSurface)) {
    changed = setIfUnknown(attributes, "table_or_surface", "yes") || changed;
    changed = setIfUnknown(attributes, "furniture", "probably") || changed;
  }

  if (includesAny(text, storageFurniture)) {
    changed = setIfUnknown(attributes, "storage_furniture", "yes") || changed;
    changed = setIfUnknown(attributes, "storage_item", "yes") || changed;
    changed = setIfUnknown(attributes, "furniture", "probably") || changed;
  }

  if (includesAny(text, wearable)) {
    changed = setIfUnknown(attributes, "wearable", "yes") || changed;
    changed = setIfUnknown(attributes, "body_worn_object", "yes") || changed;
    changed = setIfUnknown(attributes, "portable", "yes") || changed;
  }

  if (includesAny(text, personalAccessory)) {
    changed = setIfUnknown(attributes, "personal_accessory", "yes") || changed;
    changed = setIfUnknown(attributes, "portable", "yes") || changed;
  }

  if (includesAny(text, personalCare)) {
    changed = setIfUnknown(attributes, "personal_care_item", "yes") || changed;
    changed = setIfUnknown(attributes, "bathroom_related", "probably") || changed;
    changed = setIfUnknown(attributes, "household", "yes") || changed;
  }

  if (includesAny(text, decorative)) {
    changed = setIfUnknown(attributes, "decorative_item", "yes") || changed;
    changed = setIfUnknown(attributes, "indoor_use", "probably") || changed;
  }

  if (includesAny(text, fastener)) {
    changed = setIfUnknown(attributes, "fastener_or_closure", "yes") || changed;
    changed = setIfUnknown(attributes, "made_of_metal", "probably") || changed;
    changed = setIfUnknown(attributes, "small", "probably") || changed;
  }

  if (includesAny(text, measuring)) {
    changed = setIfUnknown(attributes, "measuring_item", "yes") || changed;
    changed = setIfUnknown(attributes, "tool", "probably") || changed;
  }

  if (includesAny(text, textile)) {
    changed = setIfUnknown(attributes, "textile_or_fabric", "yes") || changed;
    changed = setIfUnknown(attributes, "made_of_plastic", "probably_not") || changed;
  }

  if (includesAny(text, bladed)) {
    changed = setIfUnknown(attributes, "bladed_tool", "yes") || changed;
    changed = setIfUnknown(attributes, "sharp", "yes") || changed;
    changed = setIfUnknown(attributes, "tool", "yes") || changed;
  }

  if (includesAny(text, heating)) {
    changed = setIfUnknown(attributes, "heating_item", "yes") || changed;
    changed = setIfUnknown(attributes, "kitchen_related", "probably") || changed;
  }

  if (includesAny(text, imaging)) {
    changed = setIfUnknown(attributes, "imaging_item", "yes") || changed;
    changed = setIfUnknown(attributes, "tool", "probably") || changed;
  }

  if (includesAny(text, timekeeping)) {
    changed = setIfUnknown(attributes, "timekeeping_item", "yes") || changed;
    changed = setIfUnknown(attributes, "used_daily", "probably") || changed;
  }

  if (includesAny(text, repair)) {
    changed = setIfUnknown(attributes, "repair_or_maintenance", "yes") || changed;
    changed = setIfUnknown(attributes, "tool", "yes") || changed;
  }

  if (includesAny(text, writingTool)) {
    changed = setIfUnknown(attributes, "writing_or_drawing_tool", "yes") || changed;
    changed = setIfUnknown(attributes, "writes_or_records", "yes") || changed;
    changed = setIfUnknown(attributes, "desk_item", "probably") || changed;
  }

  if (includesAny(text, recreation)) {
    changed = setIfUnknown(attributes, "recreation_item", "yes") || changed;
    changed = setIfUnknown(attributes, "toy_or_game", "probably") || changed;
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

  if (includesAny(text, [/rice|arroz|polo|bariis|risotto|paella|biryani|pilaf|jollof|poha|nasi|khichuri|spanakorizo|mujaddara|htamin|reisfleisch|omo tuo/])) {
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
    changed = setIfUnknown(attributes, "bread_based", "probably") || changed;
  }
  if (includesAny(text, [/flatbread|wrap|taco|burrito|naan|pita|tortilla|lavash|roti|quesadilla/])) {
    changed = setIfUnknown(attributes, "flatbread_or_wrap", "yes") || changed;
    changed = setIfUnknown(attributes, "handheld", "probably") || changed;
    changed = setIfUnknown(attributes, "grain_based", "yes") || changed;
  }
  if (includesAny(text, [/dumpling|pierogi|samosa|ravioli|empanada|momo|gyoza|wonton|turnover/])) {
    changed = setIfUnknown(attributes, "dumpling_or_filled", "yes") || changed;
    changed = setIfUnknown(attributes, "stuffed_or_filled", "probably") || changed;
    changed = setIfUnknown(attributes, "handheld", "probably") || changed;
  }
  if (includesAny(text, [/porridge|oatmeal|congee|grits|polenta|kasha|cereal|gruel/])) {
    changed = setIfUnknown(attributes, "porridge_or_grain_bowl", "yes") || changed;
    changed = setIfUnknown(attributes, "grain_based", "yes") || changed;
    changed = setIfUnknown(attributes, "breakfast_food", "probably") || changed;
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
  if (includesAny(text, [/cake|cookie|brownie|torte|sfouf|meuseukat|biscuit|shortbread|madeleine|cupcake|muffin|ontbijtkoek|wuzetka|khanom farang/])) {
    changed = setIfUnknown(attributes, "cake_or_cookie", "yes") || changed;
    changed = setIfUnknown(attributes, "baked", "probably") || changed;
    changed = setIfUnknown(attributes, "dessert_pastry", "yes") || changed;
  }
  if (includesAny(text, [/ice cream|gelato|sorbet|popsicle|frozen|kulfi|granita|slush/])) {
    changed = setIfUnknown(attributes, "frozen_or_iced", "yes") || changed;
    changed = setIfUnknown(attributes, "served_cold", "yes") || changed;
    changed = setIfUnknown(attributes, "dessert", "probably") || changed;
  }
  if (includesAny(text, [/chocolate|cocoa|cacao|brownie|fudge|mole/])) {
    changed = setIfUnknown(attributes, "chocolate_or_cocoa", "yes") || changed;
    changed = setIfUnknown(attributes, "sweet", "probably") || changed;
  }
  if (includesAny(text, [/tomato|potato|pepper|onion|carrot|cabbage|spinach|vegetable|eggplant|okra|greens|mushroom/])) {
    changed = setIfUnknown(attributes, "vegetable_forward", "probably") || changed;
    changed = setIfUnknown(attributes, "vegetable", "probably") || changed;
  }
  if (includesAny(text, [/apple|banana|orange|berry|mango|fruit|lemon|lime|peach|pear|plum|cherry|melon/])) {
    changed = setIfUnknown(attributes, "fruit_forward", "probably") || changed;
    changed = setIfUnknown(attributes, "fruit", "probably") || changed;
  }
  if (includesAny(text, [/bean|lentil|pea|chickpea|falafel|hummus|dal|legume|soy/])) {
    changed = setIfUnknown(attributes, "legume_based", "yes") || changed;
    changed = setIfUnknown(attributes, "vegetable_forward", "probably") || changed;
  }
  if (includesAny(text, [/egg|omelet|omelette|custard|quiche|frittata/])) {
    changed = setIfUnknown(attributes, "egg_based", "yes") || changed;
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
  if (includesAny(text, [/harira|abgoosht|beyran|tharida|haneeth|kebab|falafel|tagine|couscous|injera|mandazi|sellou|gatsby|light soup/])) {
    changed = setIfUnknown(attributes, "cuisine_middle_eastern_or_african", "probably") || changed;
  }
  if (includesAny(text, [/fried|fritter|tempura|fries|donut|doughnut/])) {
    changed = setIfUnknown(attributes, "fried", "yes") || changed;
  }
  if (includesAny(text, [/donut|doughnut|fritter|churro|beignet|funnel cake/])) {
    changed = setIfUnknown(attributes, "fried_dough", "yes") || changed;
    changed = setIfUnknown(attributes, "sweet", "probably") || changed;
  }
  if (includesAny(text, [/baked|bread|cake|pie|cookie|pastry|pizza|bagel/])) {
    changed = setIfUnknown(attributes, "baked", "probably") || changed;
  }
  if (includesAny(text, [/grill|grilled|barbecue|bbq|kebab|satay|yakitori|broil|roast/])) {
    changed = setIfUnknown(attributes, "grilled", "yes") || changed;
  }
  if (includesAny(text, [/salad|sushi|sashimi|ceviche|raw|fresh|poke|tartare/])) {
    changed = setIfUnknown(attributes, "raw_or_fresh", "probably") || changed;
    changed = setIfUnknown(attributes, "served_cold", "probably") || changed;
  }
  if (includesAny(text, [/pickle|pickled|vinegar|lemon|lime|sour|tamarind|sauerkraut|kimchi/])) {
    changed = setIfUnknown(attributes, "sour_or_tangy", "probably") || changed;
  }
  if (includesAny(text, [/sauce|salsa|chutney|dip|condiment|mole|pesto|gravy|ketchup|mustard/])) {
    changed = setIfUnknown(attributes, "sauce_or_condiment", "yes") || changed;
  }
  if (includesAny(text, [/cheese|queso|paneer|feta|ricotta|mozzarella|parmesan/])) {
    changed = setIfUnknown(attributes, "cheese_forward", "yes") || changed;
    changed = setIfUnknown(attributes, "dairy_based", "yes") || changed;
  }
  if (includesAny(text, [/stuffed|filled|filling|stuffing|turnover|pie|dumpling|ravioli|samosa|empanada/])) {
    changed = setIfUnknown(attributes, "stuffed_or_filled", "probably") || changed;
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
  if (includesAny(text, [/roman|rome|byzantine|constantinople|caesar|augustus|theodosius|constantine|nikephoros|valentinian|romulus|zonaras/])) {
    changed = setIfUnknown(attributes, "roman_or_byzantine", "yes") || changed;
    changed = setIfUnknown(attributes, "from_europe", "probably") || changed;
  }
  if (includesAny(text, [/greek|roman|egypt|mesopotamia|classical|antiquity|ancient|caesar|cleopatra|aristotle|socrates|alexander/])) {
    changed = setIfUnknown(attributes, "classical_antiquity", "yes") || changed;
    changed = setIfUnknown(attributes, "ancient", "probably") || changed;
  }
  if (includesAny(text, [/ibn|al-|abu|muhammad|caliph|sultan|ottoman|islamic|baghdad|avicenna|khwarizmi|battuta|suleiman|saladin/])) {
    changed = setIfUnknown(attributes, "middle_eastern_or_islamic", "yes") || changed;
    changed = setIfUnknown(attributes, "from_asia", "probably") || changed;
  }
  if (includesAny(text, [/confucius|sun tzu|qin|wu zetian|zheng|murasaki|tokugawa|japan|china|chinese|japanese|korean|east asia/])) {
    changed = setIfUnknown(attributes, "east_asian", "yes") || changed;
    changed = setIfUnknown(attributes, "from_asia", "yes") || changed;
  }
  if (includesAny(text, [/gandhi|tagore|ramanujan|buddha|ashoka|india|indian|south asia|south asian/])) {
    changed = setIfUnknown(attributes, "south_asian", "yes") || changed;
    changed = setIfUnknown(attributes, "from_asia", "yes") || changed;
  }
  if (includesAny(text, [/washington|lincoln|jefferson|roosevelt|clinton|harding|kennedy|american|united states|u\.s\.|usa/])) {
    changed = setIfUnknown(attributes, "us_history", "yes") || changed;
    changed = setIfUnknown(attributes, "from_americas", "yes") || changed;
  }
  if (includesAny(text, [/independence|liberation|bolivar|washington|sun yat-sen|revolutionary|anti-colonial|self-rule/])) {
    changed = setIfUnknown(attributes, "independence_leader", "probably") || changed;
    changed = setIfUnknown(attributes, "revolutionary", "probably") || changed;
  }
  if (includesAny(text, [/king|queen|emperor|empress|pharaoh|czar|tsar|sultan|caliph|dynasty|mansa|khan|caesar|augustus/])) {
    changed = setIfUnknown(attributes, "dynastic_ruler", "yes") || changed;
    changed = setIfUnknown(attributes, "ruler_or_emperor", "probably") || changed;
  }
  if (includesAny(text, [/enlightenment|scientific revolution|galileo|newton|kepler|copernicus|descartes|francis bacon/])) {
    changed = setIfUnknown(attributes, "enlightenment_or_scientific_revolution", "yes") || changed;
    changed = setIfUnknown(attributes, "early_modern", "probably") || changed;
  }
  if (includesAny(text, [/renaissance|reformation|early modern|enlightenment|shakespeare|galileo|newton|da vinci|michelangelo/])) {
    changed = setIfUnknown(attributes, "early_modern", "yes") || changed;
    changed = setIfUnknown(attributes, "modern", "probably_not") || changed;
  }
  if (includesAny(text, [/20th century|twentieth|world war|civil rights|computing|telephone|radio|nuclear|space race|cold war/])) {
    changed = setIfUnknown(attributes, "twentieth_century", "probably") || changed;
    changed = setIfUnknown(attributes, "modern", "yes") || changed;
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
    changed = setIfUnknown(attributes, "space_or_astronomy", "yes") || changed;
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
    changed = setIfUnknown(attributes, "war_or_revolution", "probably") || changed;
  }
  if (includesAny(text, [/rights|abolition|suffrage|activist|civil rights/])) {
    changed = setIfUnknown(attributes, "rights_activist", "yes") || changed;
    changed = setIfUnknown(attributes, "civil_rights_leader", "yes") || changed;
    changed = setIfUnknown(attributes, "reformer", "probably") || changed;
  }
  if (includesAny(text, [/abolition|suffrage|suffragist|emancipation|anti-slavery/])) {
    changed = setIfUnknown(attributes, "abolition_or_suffrage", "yes") || changed;
    changed = setIfUnknown(attributes, "civil_rights_leader", "probably") || changed;
  }
  if (includesAny(text, [/invent|engineer|technology|technical|computer|telephone|electric|patent|breakthrough/])) {
    changed = setIfUnknown(attributes, "technology_innovator", "yes") || changed;
    changed = setIfUnknown(attributes, "inventor", "probably") || changed;
  }
  if (includesAny(text, [/empire|emperor|king|queen|pharaoh|conqueror|khan|mansa|caesar|napoleon/])) {
    changed = setIfUnknown(attributes, "empire_builder", "probably") || changed;
    changed = setIfUnknown(attributes, "ruler_or_emperor", "probably") || changed;
  }
  if (includesAny(text, [/king|queen|monarch|emperor|empress|pharaoh|czar|tsar|sultan|caliph|mansa/])) {
    changed = setIfUnknown(attributes, "monarch", "yes") || changed;
    changed = setIfUnknown(attributes, "royal", "probably") || changed;
  }
  if (includesAny(text, [/president|prime minister|chancellor|premier|governor/])) {
    changed = setIfUnknown(attributes, "president_or_prime_minister", "yes") || changed;
    changed = setIfUnknown(attributes, "political_leader", "yes") || changed;
  }
  if (includesAny(text, [/physicist|physics|relativity|quantum|radioactivity|nuclear|fission/])) {
    changed = setIfUnknown(attributes, "physicist", "yes") || changed;
    changed = setIfUnknown(attributes, "scientist", "yes") || changed;
  }
  if (includesAny(text, [/biology|biologist|naturalist|evolution|botanist|zoologist|genetics|microbiology/])) {
    changed = setIfUnknown(attributes, "biologist_or_naturalist", "yes") || changed;
    changed = setIfUnknown(attributes, "scientist", "yes") || changed;
  }
  if (includesAny(text, [/chemist|chemistry|chemical|periodic table|radium|polonium|laboratory/])) {
    changed = setIfUnknown(attributes, "chemist", "yes") || changed;
    changed = setIfUnknown(attributes, "scientist", "yes") || changed;
  }
  if (includesAny(text, [/poet|poetry|playwright|dramatist|theatre|theater|shakespeare/])) {
    changed = setIfUnknown(attributes, "poet_or_playwright", "yes") || changed;
    changed = setIfUnknown(attributes, "writer", "probably") || changed;
    changed = setIfUnknown(attributes, "arts_or_literature", "yes") || changed;
  }
  if (includesAny(text, [/painter|painting|sculptor|sculpture|renaissance artist|artist/])) {
    changed = setIfUnknown(attributes, "painter_or_sculptor", "yes") || changed;
    changed = setIfUnknown(attributes, "artist", "probably") || changed;
    changed = setIfUnknown(attributes, "arts_or_literature", "yes") || changed;
  }
  if (includesAny(text, [/religious reform|reformation|protestant|theologian|religion|spiritual|buddha|confucius|guru/])) {
    changed = setIfUnknown(attributes, "religious_reformer", "probably") || changed;
    changed = setIfUnknown(attributes, "religious_figure", "probably") || changed;
  }
  if (includesAny(text, [/war|battle|general|commander|conquest|conqueror|military|army|navy|admiral/])) {
    changed = setIfUnknown(attributes, "war_or_revolution", "yes") || changed;
    changed = setIfUnknown(attributes, "military_leader", "probably") || changed;
  }
  if (includesAny(text, [/industry|industrial|business|economist|economic|factory|railroad|steel|oil|finance/])) {
    changed = setIfUnknown(attributes, "economic_or_industrial", "yes") || changed;
  }
  if (includesAny(text, [/artist|writer|poet|novel|playwright|literature|painting|sculptor|philosopher/])) {
    changed = setIfUnknown(attributes, "arts_or_literature", "yes") || changed;
  }

  changed = setComplement(attributes, "male", "female") || changed;
  return changed;
}

type AttributePatch = Partial<Record<AttributeKey, NormalizedAnswer>>;

const curatedAttributePatches: Record<string, AttributePatch> = {
  "historical-joannes-zonaras": {
    male: "yes",
    from_europe: "yes",
    medieval: "yes",
    roman_or_byzantine: "yes",
    writer: "yes",
    philosopher: "probably",
    political_leader: "no",
    military_leader: "no",
  },
  "historical-constantine-xi": {
    male: "yes",
    medieval: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    war_or_revolution: "probably",
    from_europe: "yes",
  },
  "historical-zoe-porphyrogenita": {
    female: "yes",
    medieval: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    political_leader: "probably",
    from_europe: "yes",
  },
  "historical-valentinian-iii": {
    male: "yes",
    ancient: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    classical_antiquity: "yes",
    from_europe: "yes",
  },
  "historical-tiberius-ii-constantine": {
    male: "yes",
    medieval: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    from_europe: "yes",
  },
  "historical-theodosius-i": {
    male: "yes",
    ancient: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    religious_figure: "probably",
    classical_antiquity: "yes",
  },
  "historical-romulus-augustulus": {
    male: "yes",
    ancient: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    from_europe: "yes",
  },
  "historical-pescennius-niger": {
    male: "yes",
    ancient: "yes",
    military_leader: "yes",
    political_leader: "probably",
    roman_or_byzantine: "yes",
    classical_antiquity: "yes",
  },
  "historical-nikephoros-iii-botaneiates": {
    male: "yes",
    medieval: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    military_leader: "probably",
  },
  "historical-leo-vi-the-wise": {
    male: "yes",
    medieval: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    writer: "probably",
  },
  "historical-quintus-aemilius-laetus": {
    male: "yes",
    ancient: "yes",
    military_leader: "yes",
    roman_or_byzantine: "yes",
    classical_antiquity: "yes",
    political_leader: "probably_not",
  },
  "historical-philip-grierson": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    writer: "probably",
    educator: "yes",
    from_europe: "yes",
    scientist: "no",
  },
  "historical-mason-hammond": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    educator: "yes",
    writer: "probably",
    us_history: "yes",
    from_americas: "yes",
  },
  "historical-warren-treadgold": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    writer: "yes",
    educator: "yes",
    roman_or_byzantine: "probably",
    from_americas: "probably",
  },
  "historical-alben-w-barkley": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    political_leader: "yes",
    president_or_prime_minister: "probably",
    us_history: "yes",
    from_americas: "yes",
  },
  "historical-bill-clinton": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    political_leader: "yes",
    president_or_prime_minister: "yes",
    us_history: "yes",
    from_americas: "yes",
  },
  "historical-dan-quayle": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    political_leader: "yes",
    president_or_prime_minister: "probably",
    us_history: "yes",
    from_americas: "yes",
  },
  "historical-camillo-golgi": {
    male: "yes",
    modern: "yes",
    scientist: "yes",
    physician: "yes",
    medical_figure: "yes",
    biologist_or_naturalist: "probably",
    from_europe: "yes",
  },
  "historical-emil-artin": {
    male: "yes",
    modern: "yes",
    mathematician: "yes",
    math_or_computing: "yes",
    scientist: "probably",
    from_europe: "yes",
  },
  "historical-claude-chappe": {
    male: "yes",
    early_modern: "yes",
    inventor: "yes",
    technology_innovator: "yes",
    communication_device: "no",
    from_europe: "yes",
  },
  "historical-mark-antony": {
    male: "yes",
    ancient: "yes",
    classical_antiquity: "yes",
    roman_or_byzantine: "yes",
    military_leader: "yes",
    political_leader: "yes",
    war_or_revolution: "yes",
    from_europe: "probably",
  },
  "historical-benozzo-gozzoli": {
    male: "yes",
    early_modern: "yes",
    painter_or_sculptor: "yes",
    artist: "yes",
    arts_or_literature: "yes",
    from_europe: "yes",
  },
  "historical-timothy-barnes": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    writer: "yes",
    educator: "yes",
    roman_or_byzantine: "probably",
    from_europe: "probably",
  },
  "historical-werner-eck": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    writer: "yes",
    educator: "yes",
    roman_or_byzantine: "probably",
    from_europe: "yes",
  },
  "historical-shapur-i": {
    male: "yes",
    ancient: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    middle_eastern_or_islamic: "probably",
    from_asia: "yes",
    war_or_revolution: "yes",
    empire_builder: "yes",
  },
  "historical-pope-leo-iii": {
    male: "yes",
    medieval: "yes",
    religious_figure: "yes",
    religious_reformer: "probably",
    political_leader: "probably",
    from_europe: "yes",
  },
  "historical-theodore-ii-laskaris": {
    male: "yes",
    medieval: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    from_europe: "yes",
  },
  "historical-maximinus-daza": {
    male: "yes",
    ancient: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    classical_antiquity: "yes",
    military_leader: "probably",
  },
  "historical-manuel-ii-palaiologos": {
    male: "yes",
    medieval: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    writer: "probably",
    from_europe: "yes",
  },
  "historical-lucius-verus": {
    male: "yes",
    ancient: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    classical_antiquity: "yes",
    military_leader: "probably",
  },
  "historical-leo-v-the-armenian": {
    male: "yes",
    medieval: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    roman_or_byzantine: "yes",
    military_leader: "probably",
    from_europe: "yes",
  },
  "historical-magnus-maximus": {
    male: "yes",
    ancient: "yes",
    monarch: "yes",
    military_leader: "yes",
    roman_or_byzantine: "yes",
    classical_antiquity: "yes",
    from_europe: "yes",
  },
  "historical-marcus-aemilius-lepidus": {
    male: "yes",
    ancient: "yes",
    classical_antiquity: "yes",
    roman_or_byzantine: "yes",
    political_leader: "yes",
    military_leader: "probably",
    war_or_revolution: "yes",
    from_europe: "probably",
  },
  "historical-publius-cornelius-tacitus": {
    male: "yes",
    ancient: "yes",
    classical_antiquity: "yes",
    roman_or_byzantine: "yes",
    writer: "yes",
    political_leader: "probably",
    from_europe: "probably",
  },
  "historical-ruth-macrides": {
    female: "yes",
    modern: "yes",
    twentieth_century: "yes",
    writer: "yes",
    educator: "yes",
    roman_or_byzantine: "probably",
    from_europe: "yes",
  },
  "historical-mehmed-ii": {
    male: "yes",
    medieval: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    middle_eastern_or_islamic: "yes",
    military_leader: "yes",
    empire_builder: "yes",
    war_or_revolution: "yes",
  },
  "historical-severus-ii": {
    male: "yes",
    ancient: "yes",
    classical_antiquity: "yes",
    roman_or_byzantine: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
  },
  "historical-petronius-maximus": {
    male: "yes",
    ancient: "yes",
    classical_antiquity: "yes",
    roman_or_byzantine: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    political_leader: "yes",
  },
  "historical-libius-severus": {
    male: "yes",
    ancient: "yes",
    classical_antiquity: "yes",
    roman_or_byzantine: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
  },
  "historical-leo-iv-the-khazar": {
    male: "yes",
    medieval: "yes",
    roman_or_byzantine: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    from_europe: "probably",
  },
  "historical-leo-diogenes": {
    male: "yes",
    medieval: "yes",
    roman_or_byzantine: "yes",
    dynastic_ruler: "yes",
    military_leader: "probably",
    from_europe: "probably",
  },
  "historical-justinian-i": {
    male: "yes",
    medieval: "yes",
    roman_or_byzantine: "yes",
    monarch: "yes",
    dynastic_ruler: "yes",
    empire_builder: "yes",
    political_leader: "yes",
    from_europe: "probably",
  },
  "historical-raymond-of-poitiers": {
    male: "yes",
    medieval: "yes",
    from_europe: "yes",
    military_leader: "probably",
    monarch: "probably",
    war_or_revolution: "probably",
  },
  "historical-felix-hoffmann": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    chemist: "yes",
    scientist: "yes",
    inventor: "probably",
    from_europe: "yes",
  },
  "historical-ernst-abbe": {
    male: "yes",
    modern: "yes",
    physicist: "yes",
    scientist: "yes",
    economic_or_industrial: "probably",
    technology_innovator: "probably",
    from_europe: "yes",
  },
  "historical-emile-berliner": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    inventor: "yes",
    technology_innovator: "yes",
    economic_or_industrial: "probably",
    from_europe: "yes",
  },
  "historical-claude-shannon": {
    male: "yes",
    modern: "yes",
    twentieth_century: "yes",
    mathematician: "yes",
    math_or_computing: "yes",
    scientist: "yes",
    technology_innovator: "probably",
    us_history: "yes",
    from_americas: "yes",
  },
  "historical-anders-celsius": {
    male: "yes",
    early_modern: "yes",
    astronomer: "yes",
    space_or_astronomy: "yes",
    physicist: "probably",
    scientist: "yes",
    from_europe: "yes",
  },
  "object-wine-rack": {
    storage_item: "yes",
    storage_furniture: "yes",
    kitchen_related: "probably",
    household: "yes",
    made_of_wood: "probably",
    container: "probably",
  },
  "object-upholstery": {
    textile_or_fabric: "yes",
    furniture: "probably",
    household: "yes",
    decorative_item: "probably",
    made_of_plastic: "probably_not",
    portable: "no",
  },
  "object-tallboy": {
    furniture: "yes",
    storage_item: "yes",
    storage_furniture: "yes",
    made_of_wood: "probably",
    large: "yes",
    portable: "no",
  },
  "object-spindle": {
    tool: "probably",
    small: "probably",
    made_of_wood: "probably",
    made_of_metal: "probably",
    repair_or_maintenance: "probably",
  },
  "object-sling": {
    textile_or_fabric: "yes",
    portable: "yes",
    personal_accessory: "probably",
    tool: "probably",
    wearable: "probably_not",
  },
  "object-laundry-basket": {
    container: "yes",
    storage_item: "yes",
    cleaning_related: "probably",
    household: "yes",
    bathroom_related: "probably",
    portable: "probably",
  },
  "object-hutch": {
    furniture: "yes",
    storage_item: "yes",
    storage_furniture: "yes",
    made_of_wood: "probably",
    made_of_glass: "probably",
    large: "yes",
  },
  "object-gueridon": {
    furniture: "yes",
    table_or_surface: "yes",
    decorative_item: "probably",
    made_of_wood: "probably",
    large: "probably",
  },
  "object-curio-cabinet": {
    furniture: "yes",
    storage_item: "yes",
    storage_furniture: "yes",
    decorative_item: "probably",
    made_of_glass: "probably",
    made_of_wood: "probably",
  },
  "object-floating-shelf": {
    furniture: "probably",
    storage_item: "yes",
    storage_furniture: "yes",
    table_or_surface: "probably",
    made_of_wood: "probably",
  },
  "object-brush": {
    tool: "yes",
    personal_care_item: "probably",
    cleaning_related: "probably",
    writing_or_drawing_tool: "probably",
    portable: "yes",
  },
  bicycle: {
    has_wheels: "yes",
    outdoor_use: "yes",
    sports_related: "probably",
    recreation_item: "yes",
    made_of_metal: "probably",
    portable: "probably_not",
  },
  smartphone: {
    electronic: "yes",
    powered: "yes",
    has_screen: "yes",
    communication_device: "yes",
    portable: "yes",
    used_daily: "yes",
  },
  "vacuum-cleaner": {
    cleaning_related: "yes",
    household: "yes",
    powered: "yes",
    electronic: "probably",
    indoor_use: "yes",
    tool: "probably",
  },
  "frying-pan": {
    kitchen_related: "yes",
    cooking_item: "yes",
    made_of_metal: "yes",
    tool: "probably",
    portable: "probably",
  },
  pillow: {
    textile_or_fabric: "yes",
    household: "yes",
    furniture: "probably_not",
    decorative_item: "probably",
    portable: "yes",
  },
  violin: {
    musical_item: "yes",
    audio_item: "yes",
    made_of_wood: "yes",
    portable: "yes",
    recreation_item: "probably",
  },
  paintbrush: {
    tool: "yes",
    writing_or_drawing_tool: "yes",
    portable: "yes",
    made_of_wood: "probably",
    sharp: "no",
  },
  toothbrush: {
    personal_care_item: "yes",
    bathroom_related: "yes",
    used_daily: "yes",
    portable: "yes",
    made_of_plastic: "probably",
  },
  toaster: {
    kitchen_related: "yes",
    cooking_item: "yes",
    electronic: "yes",
    powered: "yes",
    heating_item: "yes",
  },
  "object-automatic-document-feeder": {
    office_related: "yes",
    paper_based: "probably",
    electronic: "probably",
    powered: "probably",
    desk_item: "probably",
  },
  "object-butler-s-desk": {
    furniture: "yes",
    desk_item: "yes",
    office_related: "probably",
    storage_furniture: "probably",
    made_of_wood: "probably",
  },
  "object-hush-a-phone": {
    communication_device: "yes",
    audio_item: "probably",
    electronic: "probably",
    portable: "yes",
    used_daily: "probably_not",
  },
  "object-what-not": {
    furniture: "yes",
    storage_item: "yes",
    storage_furniture: "yes",
    table_or_surface: "probably",
    decorative_item: "probably",
    made_of_wood: "probably",
    large: "probably",
  },
  "object-tambour": {
    furniture: "probably",
    storage_item: "probably",
    storage_furniture: "probably",
    made_of_wood: "probably",
    decorative_item: "probably",
  },
  "object-sideboard": {
    furniture: "yes",
    storage_item: "yes",
    storage_furniture: "yes",
    table_or_surface: "probably",
    household: "yes",
    made_of_wood: "probably",
    large: "yes",
  },
  "object-tansu": {
    furniture: "yes",
    storage_item: "yes",
    storage_furniture: "yes",
    made_of_wood: "probably",
    large: "yes",
    portable: "no",
  },
  "object-taboret": {
    furniture: "yes",
    seating_item: "probably",
    table_or_surface: "probably",
    storage_item: "probably",
    made_of_wood: "probably",
    portable: "probably_not",
  },
  "object-soban": {
    furniture: "yes",
    table_or_surface: "yes",
    kitchen_related: "probably",
    household: "yes",
    made_of_wood: "probably",
    portable: "probably_not",
  },
  "object-shoe-rack": {
    furniture: "yes",
    storage_item: "yes",
    storage_furniture: "yes",
    household: "yes",
    made_of_wood: "probably",
    made_of_metal: "probably",
  },
  "object-pie-safe": {
    furniture: "yes",
    storage_item: "yes",
    storage_furniture: "yes",
    kitchen_related: "probably",
    household: "yes",
    made_of_wood: "probably",
  },
  "object-modesty-panel": {
    furniture: "probably",
    desk_item: "probably",
    office_related: "probably",
    made_of_wood: "probably",
    table_or_surface: "probably_not",
  },
  "object-lusterweibchen": {
    decorative_item: "yes",
    lighting_item: "probably",
    household: "probably",
    indoor_use: "yes",
    made_of_metal: "probably",
    made_of_wood: "probably",
  },
  "object-umbrella-stand": {
    container: "yes",
    storage_item: "yes",
    storage_furniture: "probably",
    household: "yes",
    made_of_metal: "probably",
    portable: "probably_not",
  },
  "food-zuger-kirschtorte": {
    cake_or_cookie: "yes",
    dessert_pastry: "yes",
    baked: "probably",
    sweet: "yes",
    cuisine_european: "yes",
    served_cold: "probably",
  },
  "food-wedding-cake": {
    cake_or_cookie: "yes",
    dessert_pastry: "yes",
    baked: "probably",
    sweet: "yes",
    dairy_based: "probably",
    served_cold: "probably",
  },
  "food-torte": {
    cake_or_cookie: "yes",
    dessert_pastry: "yes",
    baked: "probably",
    sweet: "yes",
    cuisine_european: "probably",
  },
  "food-sugee-cake": {
    cake_or_cookie: "yes",
    dessert_pastry: "yes",
    baked: "yes",
    sweet: "yes",
    grain_based: "yes",
  },
  "food-sfouf": {
    cake_or_cookie: "yes",
    dessert_pastry: "yes",
    baked: "yes",
    sweet: "yes",
    cuisine_middle_eastern_or_african: "probably",
  },
  "food-rab-cake": {
    cake_or_cookie: "yes",
    dessert_pastry: "yes",
    baked: "probably",
    sweet: "yes",
    cuisine_european: "probably",
  },
  "food-paski-baskotin": {
    bread_based: "yes",
    baked: "yes",
    grain_based: "yes",
    cuisine_european: "probably",
    sweet: "probably_not",
  },
  "food-meuseukat": {
    cake_or_cookie: "probably",
    dessert_pastry: "yes",
    sweet: "yes",
    cuisine_asian: "probably",
    grain_based: "probably",
  },
  "food-pop-tarts": {
    stuffed_or_filled: "yes",
    dessert_pastry: "yes",
    baked: "probably",
    sweet: "yes",
    portable: "yes",
  },
  "food-straight-dough": {
    bread_based: "probably",
    grain_based: "yes",
    baked: "probably_not",
    sweet: "probably_not",
    savory: "probably",
  },
  "food-pretzel": {
    bread_based: "yes",
    baked: "yes",
    grain_based: "yes",
    handheld: "yes",
    savory: "probably",
  },
  "food-maqluba": {
    rice_based: "yes",
    rice_dish: "yes",
    savory: "yes",
    served_hot: "yes",
    cuisine_middle_eastern_or_african: "yes",
  },
  "food-mombar": {
    meat_based: "yes",
    stuffed_or_filled: "yes",
    savory: "yes",
    served_hot: "probably",
    cuisine_middle_eastern_or_african: "yes",
  },
  "food-orez-shu-it": {
    rice_based: "yes",
    rice_dish: "yes",
    legume_based: "yes",
    savory: "yes",
    cuisine_middle_eastern_or_african: "probably",
  },
  "food-kusksu": {
    soup_or_stew: "yes",
    served_hot: "yes",
    savory: "yes",
    egg_based: "probably",
    cuisine_european: "probably",
  },
  "food-sciusceddu": {
    soup_or_stew: "yes",
    served_hot: "yes",
    savory: "yes",
    egg_based: "probably",
    dairy_based: "probably",
    cuisine_european: "probably",
  },
  "food-soupe-aux-gourganes": {
    soup_or_stew: "yes",
    served_hot: "yes",
    legume_based: "yes",
    savory: "yes",
    cuisine_american: "probably",
  },
  "food-koliva": {
    grain_based: "yes",
    sweet: "probably",
    served_cold: "probably",
    cuisine_european: "probably",
    fruit_forward: "probably",
  },
  "food-manjar-blanco": {
    dairy_based: "yes",
    sweet: "yes",
    dessert: "yes",
    served_cold: "probably",
    cuisine_american: "probably",
  },
  "food-patay": {
    fruit_forward: "probably",
    sweet: "probably",
    grain_based: "probably",
    cuisine_american: "probably",
  },
  "food-gallo-pinto": {
    rice_based: "yes",
    rice_dish: "yes",
    legume_based: "yes",
    savory: "yes",
    cuisine_american: "probably",
    breakfast_food: "probably",
  },
  "food-khao-chae": {
    rice_based: "yes",
    rice_dish: "yes",
    served_cold: "yes",
    cuisine_asian: "yes",
    savory: "probably",
  },
  "food-harira": {
    soup_or_stew: "yes",
    legume_based: "yes",
    served_hot: "yes",
    savory: "yes",
    cuisine_middle_eastern_or_african: "yes",
  },
  "food-bisque": {
    soup_or_stew: "yes",
    seafood: "probably",
    dairy_based: "probably",
    served_hot: "yes",
    cuisine_european: "probably",
  },
  "food-oxtail-soup": {
    soup_or_stew: "yes",
    meat_based: "yes",
    served_hot: "yes",
    savory: "yes",
    cuisine_american: "probably",
  },
  "food-wotou": {
    bread_based: "yes",
    grain_based: "yes",
    savory: "probably",
    served_hot: "probably",
    cuisine_asian: "yes",
    handheld: "probably",
  },
  "food-ttongppang": {
    cake_or_cookie: "probably",
    stuffed_or_filled: "yes",
    dessert_pastry: "yes",
    sweet: "yes",
    baked: "yes",
    cuisine_asian: "yes",
    handheld: "yes",
  },
  "food-soft-khichuri": {
    rice_based: "yes",
    rice_dish: "yes",
    legume_based: "yes",
    savory: "yes",
    served_hot: "yes",
    cuisine_asian: "yes",
  },
  "food-reisfleisch": {
    rice_based: "yes",
    rice_dish: "yes",
    meat_based: "yes",
    savory: "yes",
    served_hot: "yes",
    cuisine_european: "probably",
  },
  "food-pundut-nasi": {
    rice_based: "yes",
    rice_dish: "yes",
    savory: "yes",
    served_hot: "probably",
    cuisine_asian: "yes",
    handheld: "probably",
  },
  "food-pe-htaw-bhut-htamin": {
    rice_based: "yes",
    rice_dish: "yes",
    legume_based: "yes",
    savory: "yes",
    cuisine_asian: "yes",
    served_hot: "probably",
  },
  "food-wuzetka": {
    cake_or_cookie: "yes",
    dessert_pastry: "yes",
    chocolate_or_cocoa: "yes",
    sweet: "yes",
    baked: "yes",
    cuisine_european: "yes",
  },
  "food-tart": {
    dessert_pastry: "yes",
    stuffed_or_filled: "probably",
    sweet: "yes",
    baked: "yes",
    fruit_forward: "probably",
    cuisine_european: "probably",
  },
  "food-seffa": {
    noodle_based: "probably",
    grain_based: "yes",
    sweet: "probably",
    served_hot: "probably",
    cuisine_middle_eastern_or_african: "yes",
  },
  "food-omo-tuo": {
    rice_based: "yes",
    rice_dish: "yes",
    grain_based: "yes",
    savory: "yes",
    served_hot: "yes",
    cuisine_middle_eastern_or_african: "yes",
  },
  "food-pa-de-pages": {
    bread_based: "yes",
    grain_based: "yes",
    baked: "yes",
    savory: "probably",
    cuisine_european: "yes",
  },
  "food-mujaddara": {
    rice_based: "yes",
    rice_dish: "yes",
    legume_based: "yes",
    savory: "yes",
    served_hot: "yes",
    cuisine_middle_eastern_or_african: "yes",
  },
  "food-mutschel": {
    bread_based: "yes",
    grain_based: "yes",
    baked: "yes",
    savory: "probably",
    cuisine_european: "yes",
  },
  "food-pate-lorrain": {
    stuffed_or_filled: "yes",
    meat_based: "yes",
    savory: "yes",
    baked: "yes",
    cuisine_european: "yes",
    handheld: "probably",
  },
  "food-smorgastarta": {
    bread_based: "yes",
    stuffed_or_filled: "probably",
    savory: "yes",
    seafood: "probably",
    dairy_based: "probably",
    served_cold: "yes",
    cuisine_european: "yes",
  },
  "food-spanakorizo": {
    rice_based: "yes",
    rice_dish: "yes",
    vegetable_forward: "yes",
    savory: "yes",
    served_hot: "yes",
    cuisine_european: "yes",
  },
  "food-soldiers": {
    bread_based: "yes",
    grain_based: "yes",
    breakfast_food: "probably",
    handheld: "yes",
    savory: "probably",
    cuisine_european: "probably",
  },
  "food-upside-down-cake": {
    cake_or_cookie: "yes",
    dessert_pastry: "yes",
    fruit_forward: "probably",
    sweet: "yes",
    baked: "yes",
    cuisine_american: "probably",
  },
  "food-wagafi-bread": {
    bread_based: "yes",
    grain_based: "yes",
    baked: "yes",
    savory: "probably",
    cuisine_middle_eastern_or_african: "probably",
  },
  "food-pastel": {
    stuffed_or_filled: "yes",
    fried: "probably",
    savory: "probably",
    handheld: "yes",
    cuisine_american: "probably",
  },
  "food-sellou": {
    grain_based: "yes",
    sweet: "yes",
    dessert: "probably",
    served_cold: "probably",
    cuisine_middle_eastern_or_african: "yes",
  },
  "food-mandazi": {
    fried_dough: "yes",
    fried: "yes",
    bread_based: "probably",
    sweet: "probably",
    handheld: "yes",
    cuisine_middle_eastern_or_african: "yes",
  },
  "food-ontbijtkoek": {
    cake_or_cookie: "yes",
    dessert_pastry: "probably",
    breakfast_food: "probably",
    baked: "yes",
    sweet: "probably",
    cuisine_european: "yes",
  },
  "food-light-soup": {
    soup_or_stew: "yes",
    soup_dish: "yes",
    served_hot: "yes",
    savory: "yes",
    cuisine_middle_eastern_or_african: "yes",
  },
  "food-gatsby": {
    bread_based: "yes",
    sandwich_like: "yes",
    handheld: "yes",
    savory: "yes",
    meat_based: "probably",
    cuisine_middle_eastern_or_african: "yes",
  },
  "food-indori-poha": {
    rice_based: "yes",
    rice_dish: "yes",
    breakfast_food: "probably",
    savory: "yes",
    cuisine_asian: "yes",
    served_hot: "probably",
  },
  "food-khanom-farang-kudi-chin": {
    cake_or_cookie: "yes",
    dessert_pastry: "yes",
    baked: "yes",
    sweet: "yes",
    cuisine_asian: "yes",
  },
  "food-bey-s-soup": {
    soup_or_stew: "yes",
    soup_dish: "yes",
    savory: "yes",
    served_hot: "yes",
    cuisine_middle_eastern_or_african: "probably",
  },
};

function applyCuratedPatch(entity: GameEntity, attributes: MutableAttributes) {
  const patch = curatedAttributePatches[entity.id];
  if (!patch) {
    return false;
  }

  let changed = false;
  for (const [key, value] of Object.entries(patch) as [AttributeKey, NormalizedAnswer][]) {
    changed = setAttribute(attributes, key, value) || changed;
  }

  changed = setComplement(attributes, "male", "female") || changed;
  changed = setComplement(attributes, "large", "small") || changed;
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

  changed = applyCuratedPatch(entity, attributes) || changed;

  if (!changed) {
    return entity;
  }

  return Object.freeze({
    ...entity,
    attributes: Object.freeze(attributes),
  }) as GameEntity;
}
