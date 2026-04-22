export const mascotStates = [
  "idle",
  "thinking",
  "asking",
  "confident",
  "celebration",
  "surprised",
  "learning",
] as const;

export type MascotState = (typeof mascotStates)[number];

export const mascotFacings = ["left", "right"] as const;

export type MascotFacing = (typeof mascotFacings)[number];
