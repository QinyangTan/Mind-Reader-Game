import { createAnimal } from "@/lib/data/seed-helpers";

const a = createAnimal;

export const animals = [
  a(
    {
      id: "lion",
      name: "Lion",
      shortDescription: "A big cat with a reputation for regal danger.",
      imageEmoji: "🦁",
    },
    {
      yes: ["mammal", "wild", "carnivore", "large", "dangerous"],
    },
  ),
  a(
    {
      id: "tiger",
      name: "Tiger",
      shortDescription: "A striped predator that looks like stealth wearing fire.",
      imageEmoji: "🐯",
    },
    {
      yes: ["mammal", "wild", "carnivore", "striped", "large", "dangerous"],
    },
  ),
  a(
    {
      id: "elephant",
      name: "Elephant",
      shortDescription: "Massive, intelligent, and impossible to miss.",
      imageEmoji: "🐘",
    },
    {
      yes: ["mammal", "wild", "herbivore", "large"],
      probably: ["dangerous"],
    },
  ),
  a(
    {
      id: "giraffe",
      name: "Giraffe",
      shortDescription: "Towering herbivore with a skyline-level neck.",
      imageEmoji: "🦒",
    },
    {
      yes: ["mammal", "wild", "herbivore", "large", "spotted"],
    },
  ),
  a(
    {
      id: "zebra",
      name: "Zebra",
      shortDescription: "Striped grazer that looks painted by speed.",
      imageEmoji: "🦓",
    },
    {
      yes: ["mammal", "wild", "herbivore", "striped", "large"],
    },
  ),
  a(
    {
      id: "panda",
      name: "Panda",
      shortDescription: "Beloved bamboo specialist with a black-and-white disguise.",
      imageEmoji: "🐼",
    },
    {
      yes: ["mammal", "wild", "large", "herbivore"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "dolphin",
      name: "Dolphin",
      shortDescription: "Smart sea mammal with a smile that hides speed.",
      imageEmoji: "🐬",
    },
    {
      yes: ["mammal", "aquatic", "wild", "carnivore", "lives_in_ocean"],
      probably: ["large"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "shark",
      name: "Shark",
      shortDescription: "Ocean hunter built like pure momentum.",
      imageEmoji: "🦈",
    },
    {
      yes: ["aquatic", "wild", "carnivore", "large", "lives_in_ocean", "dangerous"],
    },
  ),
  a(
    {
      id: "eagle",
      name: "Eagle",
      shortDescription: "Sharp-eyed raptor that makes altitude look easy.",
      imageEmoji: "🦅",
    },
    {
      yes: ["bird", "wild", "carnivore", "can_fly"],
      probably: ["dangerous"],
    },
  ),
  a(
    {
      id: "owl",
      name: "Owl",
      shortDescription: "Wide-eyed hunter with a built-in mystery aura.",
      imageEmoji: "🦉",
    },
    {
      yes: ["bird", "wild", "carnivore", "can_fly", "small"],
    },
  ),
  a(
    {
      id: "penguin",
      name: "Penguin",
      shortDescription: "Formal-looking bird that chose swimming over flying.",
      imageEmoji: "🐧",
    },
    {
      yes: ["bird", "aquatic", "wild"],
      probably: ["lives_in_ocean", "small"],
      no: ["can_fly"],
    },
  ),
  a(
    {
      id: "crocodile",
      name: "Crocodile",
      shortDescription: "Ancient ambush reptile with zero interest in compromise.",
      imageEmoji: "🐊",
    },
    {
      yes: ["reptile", "aquatic", "wild", "carnivore", "large", "dangerous"],
    },
  ),
  a(
    {
      id: "rabbit",
      name: "Rabbit",
      shortDescription: "Small herbivore that survives by being alert before anything else.",
      imageEmoji: "🐇",
    },
    {
      yes: ["mammal", "small", "herbivore"],
      probably: ["pet"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "fox",
      name: "Fox",
      shortDescription: "Clever wild mammal with a storybook reputation.",
      imageEmoji: "🦊",
    },
    {
      yes: ["mammal", "wild", "carnivore", "small"],
      probably_not: ["pet"],
    },
  ),
  a(
    {
      id: "wolf",
      name: "Wolf",
      shortDescription: "Pack predator that looks like discipline with teeth.",
      imageEmoji: "🐺",
    },
    {
      yes: ["mammal", "wild", "carnivore", "large"],
      probably: ["dangerous"],
    },
  ),
  a(
    {
      id: "bear",
      name: "Bear",
      shortDescription: "Large mammal that can pivot from sleepy to terrifying instantly.",
      imageEmoji: "🐻",
    },
    {
      yes: ["mammal", "wild", "large", "dangerous"],
      probably: ["carnivore"],
    },
  ),
  a(
    {
      id: "horse",
      name: "Horse",
      shortDescription: "Powerful runner tied to farms, trails, and open fields.",
      imageEmoji: "🐎",
    },
    {
      yes: ["mammal", "herbivore", "large", "farm_animal"],
      probably: ["pet"],
      probably_not: ["wild"],
    },
  ),
  a(
    {
      id: "cow",
      name: "Cow",
      shortDescription: "Pasture specialist with a very stable brand identity.",
      imageEmoji: "🐄",
    },
    {
      yes: ["mammal", "herbivore", "large", "farm_animal"],
      probably_not: ["wild", "dangerous"],
    },
  ),
  a(
    {
      id: "pig",
      name: "Pig",
      shortDescription: "Farm regular with more brains and personality than people expect.",
      imageEmoji: "🐖",
    },
    {
      yes: ["mammal", "farm_animal"],
      probably: ["small"],
      probably_not: ["wild"],
    },
  ),
  a(
    {
      id: "chicken",
      name: "Chicken",
      shortDescription: "Feathered farm classic with limited flight ambition.",
      imageEmoji: "🐓",
    },
    {
      yes: ["bird", "farm_animal", "small"],
      probably: ["can_fly"],
      probably_not: ["wild", "dangerous"],
    },
  ),
  a(
    {
      id: "dog",
      name: "Dog",
      shortDescription: "Domesticated mammal that basically invented loyalty branding.",
      imageEmoji: "🐕",
    },
    {
      yes: ["mammal", "pet"],
      probably_not: ["wild"],
    },
  ),
  a(
    {
      id: "cat",
      name: "Cat",
      shortDescription: "Compact hunter that acts like the room belongs to it.",
      imageEmoji: "🐈",
    },
    {
      yes: ["mammal", "pet", "small", "carnivore"],
      probably_not: ["wild"],
    },
  ),
  a(
    {
      id: "whale",
      name: "Whale",
      shortDescription: "Ocean giant that makes scale feel abstract.",
      imageEmoji: "🐋",
    },
    {
      yes: ["mammal", "aquatic", "wild", "large", "lives_in_ocean"],
      probably: ["carnivore"],
    },
  ),
  a(
    {
      id: "octopus",
      name: "Octopus",
      shortDescription: "Eight-armed ocean intelligence wrapped in camouflage.",
      imageEmoji: "🐙",
    },
    {
      yes: ["aquatic", "wild", "carnivore", "lives_in_ocean"],
      probably: ["small"],
    },
  ),
  a(
    {
      id: "seal",
      name: "Seal",
      shortDescription: "Slick marine mammal that toggles between cute and torpedo.",
      imageEmoji: "🦭",
    },
    {
      yes: ["mammal", "aquatic", "wild", "carnivore", "lives_in_ocean"],
      probably: ["large"],
    },
  ),
  a(
    {
      id: "turtle",
      name: "Turtle",
      shortDescription: "Shell-bearing reptile that turns patience into a survival tool.",
      imageEmoji: "🐢",
    },
    {
      yes: ["reptile"],
      probably: ["aquatic", "small", "lives_in_ocean", "herbivore"],
    },
  ),
  a(
    {
      id: "frog",
      name: "Frog",
      shortDescription: "Spring-loaded amphibian with a very efficient silhouette.",
      imageEmoji: "🐸",
    },
    {
      yes: ["aquatic", "wild", "small", "carnivore"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "snake",
      name: "Snake",
      shortDescription: "Legless predator with a permanent stealth advantage.",
      imageEmoji: "🐍",
    },
    {
      yes: ["reptile", "wild", "carnivore"],
      probably: ["dangerous", "small"],
    },
  ),
  a(
    {
      id: "hawk",
      name: "Hawk",
      shortDescription: "Raptor that makes every glide look tactical.",
      imageEmoji: "🪶",
    },
    {
      yes: ["bird", "wild", "carnivore", "can_fly"],
      probably: ["dangerous"],
    },
  ),
  a(
    {
      id: "parrot",
      name: "Parrot",
      shortDescription: "Bright bird with mimicry, attitude, and an excellent beak.",
      imageEmoji: "🦜",
    },
    {
      yes: ["bird", "can_fly", "small"],
      probably: ["pet", "wild"],
    },
  ),
  a(
    {
      id: "monkey",
      name: "Monkey",
      shortDescription: "Agile primate built for motion and mischief.",
      imageEmoji: "🐒",
    },
    {
      yes: ["mammal", "wild", "small"],
      probably: ["herbivore"],
    },
  ),
  a(
    {
      id: "gorilla",
      name: "Gorilla",
      shortDescription: "Massive primate with quiet force and watchful presence.",
      imageEmoji: "🦍",
    },
    {
      yes: ["mammal", "wild", "large", "herbivore"],
      probably: ["dangerous"],
    },
  ),
  a(
    {
      id: "kangaroo",
      name: "Kangaroo",
      shortDescription: "Jump-heavy mammal with legs built like springs.",
      imageEmoji: "🦘",
    },
    {
      yes: ["mammal", "wild", "large", "herbivore"],
    },
  ),
  a(
    {
      id: "koala",
      name: "Koala",
      shortDescription: "Tree-hugging marsupial with permanent sleepy charisma.",
      imageEmoji: "🐨",
    },
    {
      yes: ["mammal", "wild", "herbivore"],
      probably: ["small"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "deer",
      name: "Deer",
      shortDescription: "Alert grazer that turns movement into elegance.",
      imageEmoji: "🦌",
    },
    {
      yes: ["mammal", "wild", "herbivore"],
      probably: ["large"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "goat",
      name: "Goat",
      shortDescription: "Farm climber with stubborn confidence and weird balance.",
      imageEmoji: "🐐",
    },
    {
      yes: ["mammal", "herbivore", "farm_animal"],
      probably_not: ["wild"],
    },
  ),
  a(
    {
      id: "sheep",
      name: "Sheep",
      shortDescription: "Wool-heavy grazer with a soft public image.",
      imageEmoji: "🐑",
    },
    {
      yes: ["mammal", "herbivore", "farm_animal"],
      probably_not: ["wild", "dangerous"],
    },
  ),
  a(
    {
      id: "camel",
      name: "Camel",
      shortDescription: "Desert-adapted mammal with serious endurance stats.",
      imageEmoji: "🐪",
    },
    {
      yes: ["mammal", "herbivore", "large"],
      probably: ["farm_animal", "wild"],
    },
  ),
  a(
    {
      id: "leopard",
      name: "Leopard",
      shortDescription: "Spotted cat that treats silence like a weapon.",
      imageEmoji: "🐆",
    },
    {
      yes: ["mammal", "wild", "carnivore", "spotted", "large", "dangerous"],
    },
  ),
  a(
    {
      id: "cheetah",
      name: "Cheetah",
      shortDescription: "Spotted speed specialist built for one terrifying sprint.",
      imageEmoji: "💨",
    },
    {
      yes: ["mammal", "wild", "carnivore", "spotted", "large"],
      probably: ["dangerous"],
    },
  ),
  a(
    {
      id: "peacock",
      name: "Peacock",
      shortDescription: "Display-obsessed bird carrying its own fireworks show.",
      imageEmoji: "🦚",
    },
    {
      yes: ["bird"],
      probably: ["small", "can_fly"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "bat",
      name: "Bat",
      shortDescription: "Flying mammal that turns darkness into territory.",
      imageEmoji: "🦇",
    },
    {
      yes: ["mammal", "wild", "can_fly", "small"],
      probably: ["dangerous", "carnivore"],
    },
  ),
  a(
    {
      id: "hamster",
      name: "Hamster",
      shortDescription: "Pocket-sized pet with suspiciously infinite energy at night.",
      imageEmoji: "🐹",
    },
    {
      yes: ["mammal", "pet", "small"],
      probably: ["herbivore"],
      probably_not: ["wild", "dangerous"],
    },
  ),
  a(
    {
      id: "squirrel",
      name: "Squirrel",
      shortDescription: "Tiny acrobat whose life seems powered by urgency.",
      imageEmoji: "🐿️",
    },
    {
      yes: ["mammal", "wild", "small"],
      probably: ["herbivore"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "duck",
      name: "Duck",
      shortDescription: "Water-friendly bird with reliable everyday chaos.",
      imageEmoji: "🦆",
    },
    {
      yes: ["bird", "aquatic", "small"],
      probably: ["can_fly", "farm_animal"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "swan",
      name: "Swan",
      shortDescription: "Elegant water bird with hidden aggression stats.",
      imageEmoji: "🦢",
    },
    {
      yes: ["bird", "aquatic", "can_fly"],
      probably: ["small", "dangerous"],
    },
  ),
  a(
    {
      id: "crab",
      name: "Crab",
      shortDescription: "Sideways specialist in a portable suit of armor.",
      imageEmoji: "🦀",
    },
    {
      yes: ["aquatic", "wild", "small", "lives_in_ocean"],
      probably: ["carnivore"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "jellyfish",
      name: "Jellyfish",
      shortDescription: "Drifting sea creature that turns touch into a bad idea.",
      imageEmoji: "🪼",
    },
    {
      yes: ["aquatic", "wild", "small", "lives_in_ocean", "dangerous"],
    },
  ),
  a(
    {
      id: "lobster",
      name: "Lobster",
      shortDescription: "Clawed ocean crustacean with premium dinner energy.",
      imageEmoji: "🦞",
    },
    {
      yes: ["aquatic", "wild", "small", "lives_in_ocean"],
      probably: ["carnivore"],
    },
  ),
  a(
    {
      id: "rhinoceros",
      name: "Rhinoceros",
      shortDescription: "Heavy wild herbivore with tank-like posture.",
      imageEmoji: "🦏",
    },
    {
      yes: ["mammal", "wild", "herbivore", "large", "dangerous"],
    },
  ),
  a(
    {
      id: "otter",
      name: "Otter",
      shortDescription: "Playful aquatic mammal with excellent floating confidence.",
      imageEmoji: "🦦",
    },
    {
      yes: ["mammal", "aquatic", "wild", "carnivore", "small"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "walrus",
      name: "Walrus",
      shortDescription: "Huge tusked marine mammal that looks permanently unimpressed.",
      imageEmoji: "🦭",
    },
    {
      yes: ["mammal", "aquatic", "wild", "large", "lives_in_ocean"],
      probably: ["dangerous", "carnivore"],
    },
  ),
  a(
    {
      id: "hippopotamus",
      name: "Hippopotamus",
      shortDescription: "Heavy river mammal that treats water like a hiding place.",
      imageEmoji: "🦛",
    },
    {
      yes: ["mammal", "aquatic", "wild", "large", "dangerous", "herbivore"],
    },
  ),
  a(
    {
      id: "flamingo",
      name: "Flamingo",
      shortDescription: "Long-legged bird whose balance makes pink look inevitable.",
      imageEmoji: "🦩",
    },
    {
      yes: ["bird", "aquatic", "can_fly"],
      probably: ["small"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "bee",
      name: "Bee",
      shortDescription: "Pollinating insect with tiny wings and large agricultural importance.",
      imageEmoji: "🐝",
    },
    {
      yes: ["insect", "can_fly", "small", "wild"],
      probably: ["dangerous"],
      probably_not: ["aquatic"],
    },
  ),
  a(
    {
      id: "butterfly",
      name: "Butterfly",
      shortDescription: "Delicate flying insect built almost entirely from transformation branding.",
      imageEmoji: "🦋",
    },
    {
      yes: ["insect", "can_fly", "small", "wild"],
      probably_not: ["dangerous", "aquatic"],
    },
  ),
  a(
    {
      id: "chimpanzee",
      name: "Chimpanzee",
      shortDescription: "Highly intelligent primate with social complexity and strong arms.",
      imageEmoji: "🐒",
    },
    {
      yes: ["mammal", "wild", "large"],
      probably: ["dangerous"],
      probably_not: ["herbivore"],
    },
  ),
  a(
    {
      id: "alligator",
      name: "Alligator",
      shortDescription: "Broad-snouted reptile that turns still water into a warning.",
      imageEmoji: "🐊",
    },
    {
      yes: ["reptile", "aquatic", "wild", "carnivore", "large", "dangerous"],
      probably_not: ["lives_in_ocean"],
    },
  ),
  a(
    {
      id: "snail",
      name: "Snail",
      shortDescription: "Shell-carrying small creature whose entire brand is patience.",
      imageEmoji: "🐌",
    },
    {
      yes: ["small"],
      probably: ["wild"],
      probably_not: ["dangerous", "can_fly", "large"],
    },
  ),
  a(
    {
      id: "raccoon",
      name: "Raccoon",
      shortDescription: "Masked scavenger that turns trash cans into side quests.",
      imageEmoji: "🦝",
    },
    {
      yes: ["mammal", "wild", "small", "nocturnal"],
      probably: ["carnivore"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "donkey",
      name: "Donkey",
      shortDescription: "Sturdy farm mammal with a voice you hear before you see.",
      imageEmoji: "🫏",
    },
    {
      yes: ["mammal", "farm_animal", "herbivore", "large"],
      probably_not: ["wild", "dangerous"],
    },
  ),
  a(
    {
      id: "sloth",
      name: "Sloth",
      shortDescription: "Tree-dwelling mammal that made slow motion a personality.",
      imageEmoji: "🦥",
    },
    {
      yes: ["mammal", "wild", "small", "herbivore"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "porcupine",
      name: "Porcupine",
      shortDescription: "Spiny mammal that solves most arguments without chasing anyone.",
      imageEmoji: "🦔",
    },
    {
      yes: ["mammal", "wild", "small", "herbivore"],
      probably: ["dangerous"],
    },
  ),
  a(
    {
      id: "meerkat",
      name: "Meerkat",
      shortDescription: "Small alert mammal with a permanent lookout posture.",
      imageEmoji: "🪶",
    },
    {
      yes: ["mammal", "wild", "small"],
      probably: ["carnivore"],
      probably_not: ["dangerous"],
    },
  ),
  a(
    {
      id: "stingray",
      name: "Stingray",
      shortDescription: "Flat ocean animal that turns gliding into camouflage.",
      imageEmoji: "🥏",
    },
    {
      yes: ["aquatic", "wild", "lives_in_ocean"],
      probably: ["carnivore", "dangerous"],
      probably_not: ["small"],
    },
  ),
] as const;
