import { createCharacter } from "@/lib/data/seed-helpers";

const c = createCharacter;

export const fictionalCharacters = [
  c(
    {
      id: "harry-potter",
      name: "Harry Potter",
      shortDescription: "Scarred wizard who keeps stumbling into destiny.",
      imageEmoji: "⚡",
    },
    {
      yes: [
        "human",
        "male",
        "magical",
        "from_movie",
        "associated_with_magic",
        "associated_with_school",
        "famous_worldwide",
      ],
      probably: ["child"],
    },
  ),
  c(
    {
      id: "hermione-granger",
      name: "Hermione Granger",
      shortDescription: "Brilliant spellcaster with answers before the question finishes.",
      imageEmoji: "📚",
    },
    {
      yes: [
        "human",
        "female",
        "magical",
        "from_movie",
        "associated_with_magic",
        "associated_with_school",
        "famous_worldwide",
      ],
      probably: ["child"],
    },
  ),
  c(
    {
      id: "ron-weasley",
      name: "Ron Weasley",
      shortDescription: "Loyal red-haired wizard with panic, heart, and timing.",
      imageEmoji: "♟️",
    },
    {
      yes: [
        "human",
        "male",
        "magical",
        "from_movie",
        "associated_with_magic",
        "associated_with_school",
      ],
      probably: ["child"],
    },
  ),
  c(
    {
      id: "luke-skywalker",
      name: "Luke Skywalker",
      shortDescription: "Farm boy turned galactic legend with a lightsaber arc.",
      imageEmoji: "🌠",
    },
    {
      yes: ["human", "male", "uses_weapons", "from_movie", "associated_with_space", "famous_worldwide"],
      probably: ["adult", "associated_with_magic"],
    },
  ),
  c(
    {
      id: "darth-vader",
      name: "Darth Vader",
      shortDescription: "Masked enforcer whose breathing arrives before his menace.",
      imageEmoji: "🖤",
    },
    {
      yes: [
        "male",
        "villain",
        "uses_weapons",
        "wears_mask",
        "from_movie",
        "associated_with_space",
        "adult",
        "famous_worldwide",
      ],
      probably: ["human", "associated_with_magic"],
    },
  ),
  c(
    {
      id: "leia-organa",
      name: "Leia Organa",
      shortDescription: "Rebel strategist with royal blood and iron nerve.",
      imageEmoji: "👑",
    },
    {
      yes: [
        "human",
        "female",
        "royal",
        "from_movie",
        "associated_with_space",
        "famous_worldwide",
      ],
      probably: ["uses_weapons", "adult"],
    },
  ),
  c(
    {
      id: "yoda",
      name: "Yoda",
      shortDescription: "Ancient mentor speaking like every sentence is a puzzle box.",
      imageEmoji: "🟢",
    },
    {
      yes: ["male", "animal_like", "from_movie", "associated_with_space", "adult", "famous_worldwide"],
      probably: ["magical", "associated_with_magic", "uses_weapons"],
    },
  ),
  c(
    {
      id: "spider-man",
      name: "Spider-Man",
      shortDescription: "Mask-wearing wall-crawler fueled by guilt and quick jokes.",
      imageEmoji: "🕷️",
    },
    {
      yes: ["human", "male", "superhero", "wears_mask", "from_movie", "famous_worldwide"],
      probably: ["child", "from_game"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "batman",
      name: "Batman",
      shortDescription: "No-powers vigilante who weaponizes fear, gadgets, and posture.",
      imageEmoji: "🦇",
    },
    {
      yes: [
        "human",
        "male",
        "superhero",
        "uses_weapons",
        "wears_mask",
        "adult",
        "from_movie",
        "famous_worldwide",
      ],
      probably_not: ["child"],
    },
  ),
  c(
    {
      id: "wonder-woman",
      name: "Wonder Woman",
      shortDescription: "Mythic warrior princess with impossible poise.",
      imageEmoji: "✨",
    },
    {
      yes: [
        "human",
        "female",
        "superhero",
        "uses_weapons",
        "adult",
        "from_movie",
        "famous_worldwide",
      ],
      probably: ["magical", "royal", "can_fly", "associated_with_magic"],
    },
  ),
  c(
    {
      id: "superman",
      name: "Superman",
      shortDescription: "Cape, kindness, and planet-shaking power in one silhouette.",
      imageEmoji: "☄️",
    },
    {
      yes: ["male", "superhero", "can_fly", "adult", "from_movie", "famous_worldwide"],
      probably: ["human", "associated_with_space"],
    },
  ),
  c(
    {
      id: "iron-man",
      name: "Iron Man",
      shortDescription: "Armored genius whose confidence lands before the suit does.",
      imageEmoji: "🤖",
    },
    {
      yes: [
        "human",
        "male",
        "superhero",
        "uses_weapons",
        "wears_mask",
        "can_fly",
        "adult",
        "from_movie",
        "famous_worldwide",
      ],
    },
  ),
  c(
    {
      id: "black-panther",
      name: "Black Panther",
      shortDescription: "Masked king carrying a nation and a myth at once.",
      imageEmoji: "🐾",
    },
    {
      yes: [
        "human",
        "male",
        "superhero",
        "wears_mask",
        "uses_weapons",
        "royal",
        "adult",
        "from_movie",
        "famous_worldwide",
      ],
    },
  ),
  c(
    {
      id: "deadpool",
      name: "Deadpool",
      shortDescription: "Chaotic mercenary who treats genre rules like chew toys.",
      imageEmoji: "🔴",
    },
    {
      yes: [
        "human",
        "male",
        "uses_weapons",
        "wears_mask",
        "adult",
        "from_movie",
        "famous_worldwide",
      ],
      probably: ["superhero"],
      probably_not: ["villain"],
    },
  ),
  c(
    {
      id: "wolverine",
      name: "Wolverine",
      shortDescription: "Clawed antihero powered by healing and bad temper management.",
      imageEmoji: "🗡️",
    },
    {
      yes: ["human", "male", "superhero", "uses_weapons", "adult", "from_movie", "famous_worldwide"],
    },
  ),
  c(
    {
      id: "elsa",
      name: "Elsa",
      shortDescription: "Snow queen with ice control and emotional weather systems.",
      imageEmoji: "❄️",
    },
    {
      yes: [
        "human",
        "female",
        "magical",
        "royal",
        "from_movie",
        "adult",
        "associated_with_magic",
        "famous_worldwide",
      ],
    },
  ),
  c(
    {
      id: "anna",
      name: "Anna",
      shortDescription: "Warm-hearted sister who keeps rushing at impossible missions.",
      imageEmoji: "🧡",
    },
    {
      yes: ["human", "female", "royal", "from_movie", "adult", "famous_worldwide"],
      probably: ["associated_with_magic"],
    },
  ),
  c(
    {
      id: "moana",
      name: "Moana",
      shortDescription: "Wayfinder led by instinct, ocean pull, and impossible courage.",
      imageEmoji: "🌊",
    },
    {
      yes: ["human", "female", "from_movie", "famous_worldwide"],
      probably: ["royal", "child", "associated_with_magic"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "genie",
      name: "Genie",
      shortDescription: "Reality-bending companion who treats wishes like performance art.",
      imageEmoji: "🧞",
    },
    {
      yes: [
        "male",
        "animal_like",
        "magical",
        "from_movie",
        "adult",
        "can_fly",
        "associated_with_magic",
        "famous_worldwide",
      ],
    },
  ),
  c(
    {
      id: "aladdin",
      name: "Aladdin",
      shortDescription: "Street-smart dreamer pulled into a palace-level whirlpool.",
      imageEmoji: "🕌",
    },
    {
      yes: ["human", "male", "from_movie", "famous_worldwide"],
      probably: ["child", "associated_with_magic"],
      probably_not: ["adult", "royal"],
    },
  ),
  c(
    {
      id: "shrek",
      name: "Shrek",
      shortDescription: "Swamp ogre who accidentally keeps earning emotional depth.",
      imageEmoji: "🧅",
    },
    {
      yes: ["male", "animal_like", "from_movie", "adult", "famous_worldwide"],
    },
  ),
  c(
    {
      id: "donkey-shrek",
      name: "Donkey",
      shortDescription: "Motor-mouth sidekick with unstoppable optimism.",
      imageEmoji: "🐴",
      aliases: ["donkey"],
    },
    {
      yes: ["male", "animal_like", "from_movie", "adult", "famous_worldwide"],
    },
  ),
  c(
    {
      id: "gandalf",
      name: "Gandalf",
      shortDescription: "Grey-cloaked wizard whose calm voice usually precedes fireworks.",
      imageEmoji: "🪄",
    },
    {
      yes: [
        "human",
        "male",
        "magical",
        "uses_weapons",
        "from_movie",
        "adult",
        "associated_with_magic",
        "famous_worldwide",
      ],
    },
  ),
  c(
    {
      id: "frodo-baggins",
      name: "Frodo Baggins",
      shortDescription: "Small ring-bearer pushed through enormous dread.",
      imageEmoji: "💍",
    },
    {
      yes: ["male", "animal_like", "from_movie", "adult", "famous_worldwide"],
      probably: ["associated_with_magic"],
    },
  ),
  c(
    {
      id: "gollum",
      name: "Gollum",
      shortDescription: "Bent creature whose obsession echoes louder than his footsteps.",
      imageEmoji: "🪨",
    },
    {
      yes: ["male", "animal_like", "villain", "from_movie", "adult", "famous_worldwide"],
      probably: ["associated_with_magic"],
    },
  ),
  c(
    {
      id: "mario",
      name: "Mario",
      shortDescription: "Mustached plumber whose confidence can clear any platform.",
      imageEmoji: "🍄",
    },
    {
      yes: ["human", "male", "from_game", "adult", "famous_worldwide"],
      probably_not: ["child"],
    },
  ),
  c(
    {
      id: "luigi",
      name: "Luigi",
      shortDescription: "Tall green sibling with surprising ghost-avoidance mileage.",
      imageEmoji: "🟩",
    },
    {
      yes: ["human", "male", "from_game", "adult", "famous_worldwide"],
      probably_not: ["child"],
    },
  ),
  c(
    {
      id: "princess-peach",
      name: "Princess Peach",
      shortDescription: "Royal mainstay balancing grace, pink, and playable chaos.",
      imageEmoji: "🍑",
    },
    {
      yes: ["human", "female", "royal", "from_game", "adult", "famous_worldwide"],
    },
  ),
  c(
    {
      id: "bowser",
      name: "Bowser",
      shortDescription: "Spiked king who turns kidnapping into a full-time brand.",
      imageEmoji: "🐢",
    },
    {
      yes: ["male", "animal_like", "villain", "royal", "from_game", "adult", "famous_worldwide"],
      probably: ["can_fly"],
    },
  ),
  c(
    {
      id: "link",
      name: "Link",
      shortDescription: "Silent adventurer with a sword, a mission, and zero spare time.",
      imageEmoji: "🗡️",
    },
    {
      yes: ["human", "male", "uses_weapons", "from_game", "famous_worldwide"],
      probably: ["child"],
      probably_not: ["adult", "royal"],
    },
  ),
  c(
    {
      id: "princess-zelda",
      name: "Princess Zelda",
      shortDescription: "Wise heir whose calm hides world-saving responsibility.",
      imageEmoji: "🔺",
    },
    {
      yes: ["human", "female", "royal", "from_game", "famous_worldwide"],
      probably: ["magical", "adult", "associated_with_magic"],
    },
  ),
  c(
    {
      id: "samus-aran",
      name: "Samus Aran",
      shortDescription: "Power-suited bounty hunter built for cold stars and colder odds.",
      imageEmoji: "🚀",
    },
    {
      yes: [
        "human",
        "female",
        "uses_weapons",
        "wears_mask",
        "from_game",
        "adult",
        "associated_with_space",
        "famous_worldwide",
      ],
    },
  ),
  c(
    {
      id: "lara-croft",
      name: "Lara Croft",
      shortDescription: "Relic-hunting icon with twin pistols and impossible balance.",
      imageEmoji: "🧭",
    },
    {
      yes: ["human", "female", "uses_weapons", "from_game", "adult", "famous_worldwide"],
    },
  ),
  c(
    {
      id: "sonic",
      name: "Sonic",
      shortDescription: "Blue speedster who treats momentum like a personality trait.",
      imageEmoji: "💙",
    },
    {
      yes: ["male", "animal_like", "from_game", "famous_worldwide"],
      probably: ["child"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "shadow",
      name: "Shadow",
      shortDescription: "Edge-heavy rival wrapped in speed, mystery, and attitude.",
      imageEmoji: "🖤",
    },
    {
      yes: ["male", "animal_like", "from_game", "famous_worldwide"],
      probably: ["villain", "adult"],
    },
  ),
  c(
    {
      id: "goku",
      name: "Goku",
      shortDescription: "Battle-loving hero who treats gravity like an optional setting.",
      imageEmoji: "🥋",
    },
    {
      yes: ["human", "male", "from_anime", "adult", "can_fly", "famous_worldwide"],
      probably: ["magical", "associated_with_magic"],
    },
  ),
  c(
    {
      id: "naruto",
      name: "Naruto Uzumaki",
      shortDescription: "Loud underdog with a ridiculous amount of willpower.",
      imageEmoji: "🍥",
    },
    {
      yes: ["human", "male", "magical", "from_anime", "associated_with_school", "famous_worldwide"],
      probably: ["child", "uses_weapons", "associated_with_magic"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "sailor-moon",
      name: "Sailor Moon",
      shortDescription: "Moon-powered heroine balancing school life and cosmic duty.",
      imageEmoji: "🌙",
    },
    {
      yes: ["human", "female", "magical", "from_anime", "associated_with_magic", "famous_worldwide"],
      probably: ["superhero", "child", "associated_with_school", "can_fly"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "totoro",
      name: "Totoro",
      shortDescription: "Forest spirit with a soft silhouette and surreal commute options.",
      imageEmoji: "🌳",
    },
    {
      yes: ["animal_like", "magical", "from_anime", "can_fly", "associated_with_magic", "famous_worldwide"],
    },
  ),
  c(
    {
      id: "ash-ketchum",
      name: "Ash Ketchum",
      shortDescription: "Eternal young trainer powered by optimism and stubbornness.",
      imageEmoji: "🎒",
    },
    {
      yes: ["human", "male", "from_anime", "child", "famous_worldwide"],
      probably: ["from_game", "associated_with_school"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "pikachu",
      name: "Pikachu",
      shortDescription: "Electric mascot with world-class recognition and compact fury.",
      imageEmoji: "⚡",
    },
    {
      yes: ["animal_like", "from_anime", "from_game", "famous_worldwide"],
      probably_not: ["adult", "can_fly"],
    },
  ),
  c(
    {
      id: "mickey-mouse",
      name: "Mickey Mouse",
      shortDescription: "Global mascot distilled into ears, gloves, and pure recognition.",
      imageEmoji: "🐭",
    },
    {
      yes: ["male", "animal_like", "from_movie", "famous_worldwide"],
    },
  ),
  c(
    {
      id: "minnie-mouse",
      name: "Minnie Mouse",
      shortDescription: "Bow-wearing icon with instant silhouette chemistry.",
      imageEmoji: "🎀",
    },
    {
      yes: ["female", "animal_like", "from_movie", "famous_worldwide"],
    },
  ),
  c(
    {
      id: "sherlock-holmes",
      name: "Sherlock Holmes",
      shortDescription: "Detective who treats everyone else like a half-finished clue.",
      imageEmoji: "🔎",
    },
    {
      yes: ["human", "male", "adult"],
      probably: ["from_movie", "famous_worldwide"],
      probably_not: ["uses_weapons", "magical"],
    },
  ),
  c(
    {
      id: "wednesday-addams",
      name: "Wednesday Addams",
      shortDescription: "Morbid prodigy who makes deadpan feel like a martial art.",
      imageEmoji: "🕸️",
    },
    {
      yes: ["human", "female", "associated_with_school"],
      probably: ["child", "from_movie", "famous_worldwide", "associated_with_magic"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "neo",
      name: "Neo",
      shortDescription: "Chosen hacker whose disbelief keeps losing to reality shifts.",
      imageEmoji: "💊",
    },
    {
      yes: ["human", "male", "from_movie", "adult", "famous_worldwide"],
      probably: ["can_fly"],
    },
  ),
  c(
    {
      id: "katniss-everdeen",
      name: "Katniss Everdeen",
      shortDescription: "Reluctant symbol with a bow and enough grit to bend nations.",
      imageEmoji: "🏹",
    },
    {
      yes: ["human", "female", "uses_weapons", "from_movie", "famous_worldwide"],
      probably: ["child"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "jack-sparrow",
      name: "Jack Sparrow",
      shortDescription: "Swaggering pirate who survives largely through improvised nonsense.",
      imageEmoji: "🏴‍☠️",
    },
    {
      yes: ["human", "male", "uses_weapons", "from_movie", "adult", "famous_worldwide"],
      probably_not: ["villain"],
    },
  ),
  c(
    {
      id: "maleficent",
      name: "Maleficent",
      shortDescription: "Horned sorceress with a silhouette designed to haunt castles.",
      imageEmoji: "🦇",
    },
    {
      yes: [
        "female",
        "magical",
        "villain",
        "from_movie",
        "adult",
        "associated_with_magic",
        "famous_worldwide",
      ],
      probably: ["can_fly", "animal_like"],
    },
  ),
  c(
    {
      id: "mulan",
      name: "Mulan",
      shortDescription: "Disciplined warrior who redefines who gets to answer the call.",
      imageEmoji: "🗡️",
    },
    {
      yes: ["human", "female", "uses_weapons", "from_movie", "famous_worldwide"],
      probably: ["child"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "simba",
      name: "Simba",
      shortDescription: "Lion prince growing from runaway cub to roaring ruler.",
      imageEmoji: "🦁",
    },
    {
      yes: ["male", "animal_like", "royal", "from_movie", "famous_worldwide"],
      probably: ["child"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "po",
      name: "Po",
      shortDescription: "Noodle-loving panda unexpectedly drafted into legend status.",
      imageEmoji: "🥢",
    },
    {
      yes: ["male", "animal_like", "uses_weapons", "from_movie", "famous_worldwide"],
      probably: ["adult"],
    },
  ),
  c(
    {
      id: "monkey-d-luffy",
      name: "Monkey D. Luffy",
      shortDescription: "Elastic captain powered by hunger, friendship, and absurd courage.",
      imageEmoji: "🏴",
    },
    {
      yes: ["human", "male", "from_anime", "famous_worldwide"],
      probably: ["child", "uses_weapons"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "spongebob-squarepants",
      name: "SpongeBob SquarePants",
      shortDescription: "Hyper-cheerful sea sponge living in a pineapple with unlimited energy.",
      imageEmoji: "🧽",
    },
    {
      yes: ["male", "animal_like", "famous_worldwide"],
      probably: ["from_movie", "adult"],
      probably_not: ["can_fly"],
    },
  ),
  c(
    {
      id: "buzz-lightyear",
      name: "Buzz Lightyear",
      shortDescription: "Toy space ranger whose confidence can launch itself.",
      imageEmoji: "🚨",
    },
    {
      yes: ["male", "uses_weapons", "from_movie", "associated_with_space", "adult", "famous_worldwide"],
      probably: ["human", "can_fly"],
      probably_not: ["animal_like"],
    },
  ),
  c(
    {
      id: "woody",
      name: "Woody",
      shortDescription: "Toy cowboy balancing leadership, loyalty, and low-key panic.",
      imageEmoji: "🤠",
    },
    {
      yes: ["male", "from_movie", "adult", "famous_worldwide"],
      probably: ["human"],
      probably_not: ["animal_like", "can_fly"],
    },
  ),
  c(
    {
      id: "joker",
      name: "Joker",
      shortDescription: "Chaos-drunk villain who turns every room into a dare.",
      imageEmoji: "🃏",
    },
    {
      yes: ["human", "male", "villain", "adult", "from_movie", "famous_worldwide"],
      probably_not: ["superhero"],
    },
  ),
  c(
    {
      id: "doctor-strange",
      name: "Doctor Strange",
      shortDescription: "Arrogant surgeon remade into a cosmic mystic.",
      imageEmoji: "🔮",
    },
    {
      yes: [
        "human",
        "male",
        "superhero",
        "magical",
        "adult",
        "from_movie",
        "associated_with_magic",
        "famous_worldwide",
      ],
      probably: ["can_fly"],
    },
  ),
  c(
    {
      id: "kirby",
      name: "Kirby",
      shortDescription: "Pink powerhouse who solves problems by inhaling them.",
      imageEmoji: "🩷",
    },
    {
      yes: ["animal_like", "from_game", "can_fly", "famous_worldwide"],
      probably: ["child"],
      probably_not: ["adult", "human"],
    },
  ),
  c(
    {
      id: "san-princess-mononoke",
      name: "San",
      shortDescription: "Wolf-raised fighter moving with fierce forest conviction.",
      imageEmoji: "🐺",
    },
    {
      yes: ["human", "female", "uses_weapons", "from_anime"],
      probably: ["child", "animal_like", "associated_with_magic"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "ariel",
      name: "Ariel",
      shortDescription: "Curious mermaid princess convinced the surface is worth the trouble.",
      imageEmoji: "🧜‍♀️",
    },
    {
      yes: ["female", "royal", "from_movie", "famous_worldwide"],
      probably: ["animal_like", "child", "associated_with_magic"],
      probably_not: ["adult", "human"],
    },
  ),
  c(
    {
      id: "rapunzel",
      name: "Rapunzel",
      shortDescription: "Tower-raised heroine with healing magic and impossible hair logistics.",
      imageEmoji: "🌼",
    },
    {
      yes: ["human", "female", "magical", "royal", "from_movie", "associated_with_magic"],
      probably: ["child", "famous_worldwide"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "merida",
      name: "Merida",
      shortDescription: "Archer princess who treats tradition like a negotiable draft.",
      imageEmoji: "🏹",
    },
    {
      yes: ["human", "female", "royal", "uses_weapons", "from_movie"],
      probably: ["child", "associated_with_magic"],
      probably_not: ["adult"],
    },
  ),
  c(
    {
      id: "vegeta",
      name: "Vegeta",
      shortDescription: "Pride-fueled rival who treats humility like an optional side quest.",
      imageEmoji: "💥",
    },
    {
      yes: ["male", "from_anime", "can_fly", "adult", "famous_worldwide"],
      probably: ["human", "villain", "associated_with_space", "uses_weapons"],
    },
  ),
  c(
    {
      id: "captain-america",
      name: "Captain America",
      shortDescription: "Shield-first hero built from ideals, discipline, and a star motif.",
      imageEmoji: "🛡️",
    },
    {
      yes: ["human", "male", "superhero", "uses_weapons", "adult", "from_movie", "famous_worldwide"],
      probably_not: ["villain"],
    },
  ),
  c(
    {
      id: "thor",
      name: "Thor",
      shortDescription: "Hammer-wielding thunder god who carries myth like a spotlight.",
      imageEmoji: "⚡",
    },
    {
      yes: ["male", "superhero", "uses_weapons", "adult", "from_movie", "famous_worldwide"],
      probably: ["magical", "royal", "can_fly", "associated_with_magic"],
    },
  ),
  c(
    {
      id: "hulk",
      name: "Hulk",
      shortDescription: "Green force-of-nature hero powered by rage and collateral damage.",
      imageEmoji: "💚",
    },
    {
      yes: ["male", "superhero", "adult", "from_movie", "famous_worldwide"],
      probably: ["human"],
      probably_not: ["uses_weapons", "wears_mask"],
    },
  ),
  c(
    {
      id: "scarlet-witch",
      name: "Scarlet Witch",
      shortDescription: "Reality-twisting powerhouse with grief and magic in equal measure.",
      imageEmoji: "🔺",
    },
    {
      yes: ["female", "superhero", "magical", "adult", "from_movie", "associated_with_magic", "famous_worldwide"],
      probably: ["human", "villain", "can_fly"],
    },
  ),
  c(
    {
      id: "obi-wan-kenobi",
      name: "Obi-Wan Kenobi",
      shortDescription: "Measured Jedi mentor who can turn calm into a weapon.",
      imageEmoji: "🟦",
    },
    {
      yes: ["human", "male", "uses_weapons", "adult", "from_movie", "associated_with_space", "famous_worldwide"],
      probably: ["associated_with_magic"],
    },
  ),
  c(
    {
      id: "anakin-skywalker",
      name: "Anakin Skywalker",
      shortDescription: "Gifted hero whose arc bends hard toward disaster before the mask.",
      imageEmoji: "🌌",
    },
    {
      yes: ["human", "male", "uses_weapons", "from_movie", "associated_with_space", "famous_worldwide"],
      probably: ["child", "adult", "villain", "associated_with_magic"],
    },
  ),
  c(
    {
      id: "zelda",
      name: "Zelda",
      shortDescription: "Wise royal figure whose calm usually hides a larger plan.",
      imageEmoji: "🜃",
      aliases: ["princess zelda"],
    },
    {
      yes: ["human", "female", "royal", "from_game", "associated_with_magic", "famous_worldwide"],
      probably: ["magical", "adult"],
    },
  ),
  c(
    {
      id: "kratos",
      name: "Kratos",
      shortDescription: "Axe-and-anger warrior who treats gods like unfinished business.",
      imageEmoji: "🪓",
    },
    {
      yes: ["human", "male", "uses_weapons", "adult", "from_game"],
      probably: ["villain", "associated_with_magic", "famous_worldwide"],
    },
  ),
  c(
    {
      id: "geralt-of-rivia",
      name: "Geralt of Rivia",
      shortDescription: "Monster hunter whose professionalism is mostly sarcasm-resistant.",
      imageEmoji: "🐺",
    },
    {
      yes: ["human", "male", "uses_weapons", "adult", "from_game", "associated_with_magic"],
      probably: ["magical", "famous_worldwide"],
    },
  ),
  c(
    {
      id: "sephiroth",
      name: "Sephiroth",
      shortDescription: "Silver-haired antagonist with long sword energy and apocalyptic posture.",
      imageEmoji: "🪽",
    },
    {
      yes: ["male", "villain", "uses_weapons", "adult", "from_game", "famous_worldwide"],
      probably: ["human", "can_fly", "associated_with_magic"],
    },
  ),
  c(
    {
      id: "baymax",
      name: "Baymax",
      shortDescription: "Inflatable healthcare robot with maximum hug geometry.",
      imageEmoji: "🤍",
    },
    {
      yes: ["animal_like", "from_movie"],
      probably: ["can_fly", "famous_worldwide"],
      probably_not: ["human", "villain", "uses_weapons"],
    },
  ),
  c(
    {
      id: "toothless",
      name: "Toothless",
      shortDescription: "Dragon companion with stealth, speed, and enormous marketability.",
      imageEmoji: "🐉",
    },
    {
      yes: ["animal_like", "can_fly", "from_movie", "famous_worldwide"],
      probably: ["associated_with_magic"],
      probably_not: ["human", "villain"],
    },
  ),
] as const;
