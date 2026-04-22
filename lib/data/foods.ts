import { createFood } from "@/lib/data/seed-helpers";

const f = createFood;

export const foods = [
  f(
    {
      id: "pizza",
      name: "Pizza",
      shortDescription: "Round, sliceable crowd favorite with near-universal bargaining power.",
      imageEmoji: "🍕",
    },
    {
      yes: ["savory", "served_hot", "baked", "used_daily"],
      probably: ["portable", "dairy_based", "meat_based"],
    },
  ),
  f(
    {
      id: "burger",
      name: "Burger",
      shortDescription: "Handheld stack designed for appetite and poor elegance.",
      imageEmoji: "🍔",
    },
    {
      yes: ["savory", "served_hot", "portable", "meat_based"],
      probably: ["used_daily", "dairy_based"],
    },
  ),
  f(
    {
      id: "sushi",
      name: "Sushi",
      shortDescription: "Rice-based dish that can look delicate while being very specific.",
      imageEmoji: "🍣",
    },
    {
      yes: ["savory", "served_cold", "portable"],
      probably: ["meat_based"],
      probably_not: ["dairy_based", "baked", "fried"],
    },
  ),
  f(
    {
      id: "salad",
      name: "Salad",
      shortDescription: "Cold dish built from leaves, crunch, and dressing negotiations.",
      imageEmoji: "🥗",
    },
    {
      yes: ["savory", "served_cold", "vegetable"],
      probably: ["used_daily"],
      probably_not: ["dessert", "fried", "baked"],
    },
  ),
  f(
    {
      id: "ice-cream",
      name: "Ice Cream",
      shortDescription: "Cold dessert that melts on a timer and still wins.",
      imageEmoji: "🍨",
    },
    {
      yes: ["sweet", "served_cold", "dessert", "dairy_based"],
      probably_not: ["savory", "served_hot"],
    },
  ),
  f(
    {
      id: "cake",
      name: "Cake",
      shortDescription: "Celebration dessert that usually arrives with ceremony.",
      imageEmoji: "🍰",
    },
    {
      yes: ["sweet", "dessert", "baked"],
      probably: ["dairy_based", "served_cold"],
      probably_not: ["savory"],
    },
  ),
  f(
    {
      id: "cookie",
      name: "Cookie",
      shortDescription: "Small baked treat built for hands and vanishing quickly.",
      imageEmoji: "🍪",
    },
    {
      yes: ["sweet", "dessert", "baked", "portable"],
      probably: ["served_cold"],
      probably_not: ["savory"],
    },
  ),
  f(
    {
      id: "bread",
      name: "Bread",
      shortDescription: "Basic baked staple that quietly supports half the menu.",
      imageEmoji: "🍞",
    },
    {
      yes: ["baked", "used_daily"],
      probably: ["savory", "portable"],
      probably_not: ["dessert", "spicy"],
    },
  ),
  f(
    {
      id: "donut",
      name: "Donut",
      shortDescription: "Round fried dessert with a sugar-forward argument.",
      imageEmoji: "🍩",
    },
    {
      yes: ["sweet", "dessert", "fried", "portable"],
      probably_not: ["savory", "served_hot"],
    },
  ),
  f(
    {
      id: "apple",
      name: "Apple",
      shortDescription: "Portable fruit with crisp reliability and a very strong silhouette.",
      imageEmoji: "🍎",
    },
    {
      yes: ["fruit", "portable", "served_cold", "used_daily"],
      probably: ["sweet"],
      probably_not: ["savory", "baked", "fried"],
    },
  ),
  f(
    {
      id: "banana",
      name: "Banana",
      shortDescription: "Soft fruit with built-in packaging and a strong yellow identity.",
      imageEmoji: "🍌",
    },
    {
      yes: ["fruit", "portable", "served_cold", "used_daily"],
      probably: ["sweet"],
      probably_not: ["savory", "baked", "fried"],
    },
  ),
  f(
    {
      id: "orange-juice",
      name: "Orange Juice",
      shortDescription: "Breakfast-adjacent drink built from citrus optimism.",
      imageEmoji: "🍊",
    },
    {
      yes: ["drinkable", "served_cold", "fruit"],
      probably: ["sweet", "used_daily"],
      probably_not: ["savory", "dessert"],
    },
  ),
  f(
    {
      id: "coffee",
      name: "Coffee",
      shortDescription: "Daily stimulant with cult-level routine status.",
      imageEmoji: "☕",
    },
    {
      yes: ["drinkable", "served_hot", "used_daily"],
      probably: ["savory"],
      probably_not: ["dessert", "fruit"],
    },
  ),
  f(
    {
      id: "tea",
      name: "Tea",
      shortDescription: "Steeped drink that can feel ceremonial or routine depending on the day.",
      imageEmoji: "🍵",
    },
    {
      yes: ["drinkable", "used_daily"],
      probably: ["served_hot"],
      probably_not: ["dessert", "fried"],
    },
  ),
  f(
    {
      id: "soup",
      name: "Soup",
      shortDescription: "Bowl-based food where temperature and comfort do most of the work.",
      imageEmoji: "🥣",
    },
    {
      yes: ["savory", "served_hot"],
      probably: ["vegetable", "used_daily"],
      probably_not: ["portable", "dessert"],
    },
  ),
  f(
    {
      id: "steak",
      name: "Steak",
      shortDescription: "Meat-centered main dish that arrives with expectations.",
      imageEmoji: "🥩",
    },
    {
      yes: ["savory", "served_hot", "meat_based"],
      probably_not: ["dessert", "portable", "drinkable"],
    },
  ),
  f(
    {
      id: "fried-rice",
      name: "Fried Rice",
      shortDescription: "Fast, savory dish that turns leftovers into credibility.",
      imageEmoji: "🍚",
    },
    {
      yes: ["savory", "served_hot", "fried"],
      probably: ["portable", "used_daily"],
      probably_not: ["dessert"],
    },
  ),
  f(
    {
      id: "taco",
      name: "Taco",
      shortDescription: "Folded handheld food where structure is always temporary.",
      imageEmoji: "🌮",
    },
    {
      yes: ["savory", "portable"],
      probably: ["meat_based", "spicy", "served_hot"],
      probably_not: ["dessert"],
    },
  ),
  f(
    {
      id: "french-fries",
      name: "French Fries",
      shortDescription: "Fried side dish with far more influence than it should have.",
      imageEmoji: "🍟",
    },
    {
      yes: ["savory", "fried", "portable"],
      probably: ["served_hot"],
      probably_not: ["dessert", "drinkable"],
    },
  ),
  f(
    {
      id: "cheese",
      name: "Cheese",
      shortDescription: "Dairy food that can act like an ingredient or a full personality.",
      imageEmoji: "🧀",
    },
    {
      yes: ["dairy_based"],
      probably: ["savory", "served_cold"],
      probably_not: ["drinkable", "dessert"],
    },
  ),
  f(
    {
      id: "yogurt",
      name: "Yogurt",
      shortDescription: "Cultured dairy food that lives between breakfast and snack.",
      imageEmoji: "🥛",
    },
    {
      yes: ["dairy_based", "served_cold"],
      probably: ["sweet", "used_daily"],
      probably_not: ["savory", "served_hot"],
    },
  ),
  f(
    {
      id: "chocolate",
      name: "Chocolate",
      shortDescription: "Sweet favorite that can show up as snack, gift, or weakness.",
      imageEmoji: "🍫",
    },
    {
      yes: ["sweet", "dessert", "portable"],
      probably: ["served_cold"],
      probably_not: ["savory", "served_hot"],
    },
  ),
  f(
    {
      id: "hot-dog",
      name: "Hot Dog",
      shortDescription: "Portable savory food with a bun-based delivery system.",
      imageEmoji: "🌭",
    },
    {
      yes: ["savory", "portable", "served_hot", "meat_based"],
      probably_not: ["dessert", "drinkable"],
    },
  ),
  f(
    {
      id: "pancake",
      name: "Pancake",
      shortDescription: "Flat breakfast classic that gets better with syrup and stacks.",
      imageEmoji: "🥞",
    },
    {
      yes: ["sweet", "served_hot", "dessert"],
      probably: ["baked", "used_daily", "dairy_based"],
      probably_not: ["savory"],
    },
  ),
] as const;

