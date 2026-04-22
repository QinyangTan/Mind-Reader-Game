import { createObject } from "@/lib/data/seed-helpers";

const o = createObject;

export const objects = [
  o(
    {
      id: "smartphone",
      name: "Smartphone",
      shortDescription: "Pocket-sized screen that quietly swallowed half of modern life.",
      imageEmoji: "📱",
      aliases: ["phone", "cell phone", "mobile phone"],
    },
    {
      yes: ["portable", "electronic", "used_daily", "has_screen", "powered", "made_of_glass", "made_of_plastic"],
      probably: ["household", "indoor_use"],
    },
  ),
  o(
    {
      id: "laptop",
      name: "Laptop",
      shortDescription: "Foldable computer built for desks, bags, and deadlines.",
      imageEmoji: "💻",
    },
    {
      yes: ["portable", "electronic", "office_related", "used_daily", "has_screen", "powered"],
      probably: ["indoor_use", "made_of_metal", "made_of_plastic"],
    },
  ),
  o(
    {
      id: "television",
      name: "Television",
      shortDescription: "Living-room screen that turns walls into programming.",
      imageEmoji: "📺",
      aliases: ["tv"],
    },
    {
      yes: ["electronic", "household", "indoor_use", "has_screen", "powered", "used_daily", "large"],
      probably: ["made_of_plastic"],
      probably_not: ["portable"],
    },
  ),
  o(
    {
      id: "camera",
      name: "Camera",
      shortDescription: "Image-catching device built to preserve moments or proof.",
      imageEmoji: "📷",
    },
    {
      yes: ["portable", "electronic"],
      probably: ["used_daily", "made_of_metal", "made_of_plastic", "indoor_use", "outdoor_use", "powered"],
      probably_not: ["household"],
    },
  ),
  o(
    {
      id: "headphones",
      name: "Headphones",
      shortDescription: "Private sound tunnel for music, focus, or avoiding conversation.",
      imageEmoji: "🎧",
    },
    {
      yes: ["portable", "electronic", "wearable", "used_daily"],
      probably: ["indoor_use", "made_of_plastic", "powered"],
      probably_not: ["large"],
    },
  ),
  o(
    {
      id: "wristwatch",
      name: "Watch",
      shortDescription: "Timekeeping accessory that lives on a wrist.",
      imageEmoji: "⌚",
      aliases: ["wristwatch", "smartwatch"],
    },
    {
      yes: ["portable", "wearable", "used_daily", "small"],
      probably: ["electronic", "powered", "made_of_metal", "made_of_glass"],
      probably_not: ["large"],
    },
  ),
  o(
    {
      id: "sunglasses",
      name: "Sunglasses",
      shortDescription: "Face-worn shade gear with equal parts function and posture.",
      imageEmoji: "🕶️",
    },
    {
      yes: ["portable", "wearable", "outdoor_use", "small"],
      probably: ["made_of_glass", "made_of_plastic", "used_daily"],
      no: ["electronic", "powered"],
    },
  ),
  o(
    {
      id: "backpack",
      name: "Backpack",
      shortDescription: "Carried storage for school, travel, and too much optimism.",
      imageEmoji: "🎒",
    },
    {
      yes: ["portable", "wearable", "used_daily"],
      probably: ["outdoor_use", "made_of_plastic", "office_related"],
      no: ["electronic", "powered"],
    },
  ),
  o(
    {
      id: "umbrella",
      name: "Umbrella",
      shortDescription: "Weather shield that is either essential or forgotten.",
      imageEmoji: "☂️",
    },
    {
      yes: ["portable", "outdoor_use"],
      probably: ["small", "made_of_metal", "made_of_plastic", "used_daily"],
      no: ["electronic", "powered"],
    },
  ),
  o(
    {
      id: "lamp",
      name: "Lamp",
      shortDescription: "Artificial light source that reshapes a room with a switch.",
      imageEmoji: "💡",
    },
    {
      yes: ["household", "indoor_use", "powered"],
      probably: ["electronic", "used_daily", "made_of_metal", "made_of_glass"],
      probably_not: ["portable"],
    },
  ),
  o(
    {
      id: "mirror",
      name: "Mirror",
      shortDescription: "Reflective surface built for faces, angles, and self-checks.",
      imageEmoji: "🪞",
    },
    {
      yes: ["household", "indoor_use", "made_of_glass"],
      probably: ["used_daily", "large"],
      no: ["electronic", "powered"],
    },
  ),
  o(
    {
      id: "toothbrush",
      name: "Toothbrush",
      shortDescription: "Daily bathroom tool with a job nobody can skip for long.",
      imageEmoji: "🪥",
    },
    {
      yes: ["portable", "household", "used_daily", "small"],
      probably: ["indoor_use", "made_of_plastic"],
      probably_not: ["electronic", "powered"],
    },
  ),
  o(
    {
      id: "book",
      name: "Book",
      shortDescription: "Bound object that still wins against dead batteries.",
      imageEmoji: "📘",
    },
    {
      yes: ["portable", "household", "office_related", "indoor_use"],
      probably: ["used_daily", "made_of_wood", "small"],
      no: ["electronic", "powered"],
    },
  ),
  o(
    {
      id: "keyboard",
      name: "Keyboard",
      shortDescription: "Button field where work, jokes, and mistakes all begin.",
      imageEmoji: "⌨️",
    },
    {
      yes: ["portable", "electronic", "office_related", "indoor_use", "used_daily", "made_of_plastic"],
      probably: ["powered"],
    },
  ),
  o(
    {
      id: "refrigerator",
      name: "Refrigerator",
      shortDescription: "Kitchen appliance that quietly holds tomorrow together.",
      imageEmoji: "🧊",
      aliases: ["fridge"],
    },
    {
      yes: ["household", "kitchen_related", "indoor_use", "powered", "electronic", "used_daily", "large", "made_of_metal"],
      probably_not: ["portable", "small"],
    },
  ),
  o(
    {
      id: "microwave",
      name: "Microwave",
      shortDescription: "Countertop machine designed to make impatience workable.",
      imageEmoji: "📡",
    },
    {
      yes: ["household", "kitchen_related", "indoor_use", "powered", "electronic", "made_of_metal"],
      probably: ["used_daily"],
      probably_not: ["portable"],
    },
  ),
  o(
    {
      id: "blender",
      name: "Blender",
      shortDescription: "Kitchen tool whose job is turning ingredients into noise first.",
      imageEmoji: "🥤",
    },
    {
      yes: ["household", "kitchen_related", "indoor_use", "powered", "electronic"],
      probably: ["made_of_glass", "made_of_plastic", "used_daily"],
      probably_not: ["portable"],
    },
  ),
  o(
    {
      id: "frying-pan",
      name: "Frying Pan",
      shortDescription: "Stovetop essential with handle-first authority.",
      imageEmoji: "🍳",
      aliases: ["pan", "skillet"],
    },
    {
      yes: ["household", "kitchen_related", "indoor_use", "used_daily", "made_of_metal"],
      probably: ["portable"],
      no: ["electronic", "powered"],
    },
  ),
  o(
    {
      id: "chair",
      name: "Chair",
      shortDescription: "Everyday furniture designed around the fact that humans get tired.",
      imageEmoji: "🪑",
    },
    {
      yes: ["household", "office_related", "indoor_use", "used_daily", "large"],
      probably: ["made_of_wood", "made_of_metal", "made_of_plastic"],
      probably_not: ["portable"],
    },
  ),
  o(
    {
      id: "desk",
      name: "Desk",
      shortDescription: "Flat work surface that collects plans, cables, and clutter.",
      imageEmoji: "🧾",
    },
    {
      yes: ["office_related", "indoor_use", "used_daily", "large"],
      probably: ["made_of_wood", "made_of_metal"],
      no: ["portable", "electronic", "powered"],
    },
  ),
  o(
    {
      id: "scissors",
      name: "Scissors",
      shortDescription: "Handheld cutting tool with two blades and instant authority.",
      imageEmoji: "✂️",
    },
    {
      yes: ["portable", "household", "office_related", "small", "made_of_metal"],
      probably: ["used_daily", "indoor_use"],
      no: ["electronic", "powered"],
    },
  ),
  o(
    {
      id: "hammer",
      name: "Hammer",
      shortDescription: "Toolbox classic built around force and confidence.",
      imageEmoji: "🔨",
    },
    {
      yes: ["portable", "outdoor_use", "made_of_metal"],
      probably: ["made_of_wood", "small"],
      probably_not: ["electronic", "powered", "used_daily"],
    },
  ),
  o(
    {
      id: "suitcase",
      name: "Suitcase",
      shortDescription: "Travel container defined by wheels, zippers, and hope.",
      imageEmoji: "🧳",
    },
    {
      yes: ["portable", "has_wheels"],
      probably: ["outdoor_use", "made_of_plastic", "used_daily", "large"],
      no: ["electronic", "powered"],
    },
  ),
  o(
    {
      id: "vacuum-cleaner",
      name: "Vacuum Cleaner",
      shortDescription: "Household machine built to turn floors into a task.",
      imageEmoji: "🧹",
      aliases: ["vacuum"],
    },
    {
      yes: ["household", "indoor_use", "powered", "electronic", "has_wheels"],
      probably: ["used_daily", "made_of_plastic", "large"],
      probably_not: ["portable"],
    },
  ),
  o(
    {
      id: "guitar",
      name: "Guitar",
      shortDescription: "Stringed instrument that travels well and announces itself fast.",
      imageEmoji: "🎸",
    },
    {
      yes: ["portable"],
      probably: ["made_of_wood", "used_daily", "indoor_use", "outdoor_use"],
      probably_not: ["electronic", "powered"],
    },
  ),
] as const;
