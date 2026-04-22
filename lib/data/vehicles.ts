import { createVehicle } from "@/lib/data/seed-helpers";

const v = createVehicle;

export const vehicles = [
  v(
    {
      id: "car",
      name: "Car",
      shortDescription: "Standard personal road vehicle and default mental image for transport.",
      imageEmoji: "🚗",
      aliases: ["automobile"],
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "small", "powered", "outdoor_use"],
      probably_not: ["public_transport", "cargo_vehicle"],
    },
  ),
  v(
    {
      id: "bicycle",
      name: "Bicycle",
      shortDescription: "Human-powered road vehicle with two wheels and good intentions.",
      imageEmoji: "🚲",
      aliases: ["bike"],
    },
    {
      yes: ["human_powered", "road_vehicle", "has_wheels", "small", "outdoor_use"],
      no: ["motorized", "powered"],
    },
  ),
  v(
    {
      id: "motorcycle",
      name: "Motorcycle",
      shortDescription: "Two-wheeled motor vehicle with speed and exposure built in.",
      imageEmoji: "🏍️",
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "small", "powered", "outdoor_use"],
      probably_not: ["public_transport", "cargo_vehicle"],
    },
  ),
  v(
    {
      id: "bus",
      name: "Bus",
      shortDescription: "Large road vehicle built to move groups instead of egos.",
      imageEmoji: "🚌",
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "large", "public_transport", "powered", "outdoor_use"],
      probably_not: ["luxury_vehicle"],
    },
  ),
  v(
    {
      id: "train",
      name: "Train",
      shortDescription: "Rail vehicle that scales up from commute to cross-country ambition.",
      imageEmoji: "🚆",
    },
    {
      yes: ["motorized", "rail_vehicle", "large", "public_transport", "powered", "outdoor_use"],
      probably: ["cargo_vehicle"],
      probably_not: ["has_wheels", "small"],
    },
  ),
  v(
    {
      id: "airplane",
      name: "Airplane",
      shortDescription: "Fixed-wing vehicle built to make continents feel closer.",
      imageEmoji: "✈️",
    },
    {
      yes: ["motorized", "air_vehicle", "large", "powered", "outdoor_use"],
      probably: ["public_transport"],
      probably_not: ["has_wheels", "small"],
    },
  ),
  v(
    {
      id: "helicopter",
      name: "Helicopter",
      shortDescription: "Rotorcraft that sounds urgent even when it is just arriving.",
      imageEmoji: "🚁",
    },
    {
      yes: ["motorized", "air_vehicle", "powered", "outdoor_use"],
      probably: ["small", "emergency_vehicle"],
      probably_not: ["public_transport"],
    },
  ),
  v(
    {
      id: "boat",
      name: "Boat",
      shortDescription: "General watercraft category with endless specific variations.",
      imageEmoji: "⛵",
    },
    {
      yes: ["water_vehicle", "outdoor_use"],
      probably: ["small"],
      probably_not: ["road_vehicle", "rail_vehicle"],
    },
  ),
  v(
    {
      id: "ship",
      name: "Ship",
      shortDescription: "Large water vehicle built for scale, cargo, or long travel.",
      imageEmoji: "🚢",
    },
    {
      yes: ["water_vehicle", "large", "motorized", "powered", "outdoor_use"],
      probably: ["cargo_vehicle", "public_transport"],
      probably_not: ["small"],
    },
  ),
  v(
    {
      id: "submarine",
      name: "Submarine",
      shortDescription: "Underwater vehicle with deeply specific operating conditions.",
      imageEmoji: "🛟",
    },
    {
      yes: ["water_vehicle", "motorized", "powered", "outdoor_use"],
      probably: ["large"],
      probably_not: ["public_transport", "has_wheels"],
    },
  ),
  v(
    {
      id: "tram",
      name: "Tram",
      shortDescription: "City rail vehicle that lives somewhere between train and streetcar.",
      imageEmoji: "🚊",
      aliases: ["streetcar"],
    },
    {
      yes: ["rail_vehicle", "public_transport", "motorized", "powered", "outdoor_use"],
      probably: ["small"],
      probably_not: ["cargo_vehicle"],
    },
  ),
  v(
    {
      id: "ambulance",
      name: "Ambulance",
      shortDescription: "Emergency road vehicle where urgency is part of the design.",
      imageEmoji: "🚑",
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "emergency_vehicle", "powered", "outdoor_use"],
      probably: ["large"],
      probably_not: ["luxury_vehicle", "cargo_vehicle"],
    },
  ),
  v(
    {
      id: "fire-truck",
      name: "Fire Truck",
      shortDescription: "Large emergency vehicle built for water, ladders, and response.",
      imageEmoji: "🚒",
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "large", "emergency_vehicle", "powered", "outdoor_use"],
      probably_not: ["luxury_vehicle", "small"],
    },
  ),
  v(
    {
      id: "police-car",
      name: "Police Car",
      shortDescription: "Road vehicle that becomes unmistakable once the lights start.",
      imageEmoji: "🚓",
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "emergency_vehicle", "powered", "outdoor_use"],
      probably: ["small"],
      probably_not: ["cargo_vehicle"],
    },
  ),
  v(
    {
      id: "taxi",
      name: "Taxi",
      shortDescription: "Road vehicle whose whole identity is getting strangers somewhere else.",
      imageEmoji: "🚕",
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "public_transport", "powered", "outdoor_use"],
      probably: ["small"],
      probably_not: ["cargo_vehicle", "luxury_vehicle"],
    },
  ),
  v(
    {
      id: "van",
      name: "Van",
      shortDescription: "Boxy road vehicle built for people, gear, or both.",
      imageEmoji: "🚐",
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "powered", "outdoor_use"],
      probably: ["large", "cargo_vehicle"],
    },
  ),
  v(
    {
      id: "truck",
      name: "Truck",
      shortDescription: "Road workhorse built to haul, carry, or tow.",
      imageEmoji: "🚚",
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "large", "cargo_vehicle", "powered", "outdoor_use"],
      probably_not: ["public_transport", "luxury_vehicle"],
    },
  ),
  v(
    {
      id: "scooter",
      name: "Scooter",
      shortDescription: "Compact ride built around short hops and light convenience.",
      imageEmoji: "🛴",
    },
    {
      yes: ["road_vehicle", "small", "outdoor_use"],
      probably: ["human_powered", "has_wheels"],
      probably_not: ["large", "public_transport"],
    },
  ),
  v(
    {
      id: "ferry",
      name: "Ferry",
      shortDescription: "Water transport built to move people or cars across a gap.",
      imageEmoji: "⛴️",
    },
    {
      yes: ["water_vehicle", "motorized", "powered", "public_transport", "outdoor_use"],
      probably: ["large"],
      probably_not: ["small"],
    },
  ),
  v(
    {
      id: "cargo-ship",
      name: "Cargo Ship",
      shortDescription: "Massive water vehicle made for freight more than passengers.",
      imageEmoji: "🚢",
    },
    {
      yes: ["water_vehicle", "motorized", "powered", "cargo_vehicle", "large", "outdoor_use"],
      probably_not: ["small", "luxury_vehicle"],
    },
  ),
  v(
    {
      id: "race-car",
      name: "Race Car",
      shortDescription: "Specialized road vehicle built to optimize speed over comfort.",
      imageEmoji: "🏎️",
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "powered", "outdoor_use", "small"],
      probably: ["luxury_vehicle"],
      probably_not: ["public_transport", "cargo_vehicle"],
    },
  ),
  v(
    {
      id: "limousine",
      name: "Limousine",
      shortDescription: "Stretched road vehicle that turns transport into a statement.",
      imageEmoji: "🚘",
      aliases: ["limo"],
    },
    {
      yes: ["motorized", "road_vehicle", "has_wheels", "powered", "luxury_vehicle", "outdoor_use"],
      probably: ["large"],
      probably_not: ["cargo_vehicle", "emergency_vehicle"],
    },
  ),
  v(
    {
      id: "jet-ski",
      name: "Jet Ski",
      shortDescription: "Small personal watercraft for speed, spray, and questionable balance.",
      imageEmoji: "🌊",
    },
    {
      yes: ["water_vehicle", "motorized", "powered", "small", "outdoor_use"],
      probably_not: ["public_transport", "cargo_vehicle", "large"],
    },
  ),
  v(
    {
      id: "hot-air-balloon",
      name: "Hot Air Balloon",
      shortDescription: "Air vehicle that makes flying feel slow, scenic, and slightly surreal.",
      imageEmoji: "🎈",
    },
    {
      yes: ["air_vehicle", "outdoor_use"],
      probably: ["large"],
      probably_not: ["has_wheels", "road_vehicle", "rail_vehicle", "public_transport"],
    },
  ),
] as const;

