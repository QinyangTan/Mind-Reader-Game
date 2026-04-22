export const mascotStates = [
  "welcome",
  "idle",
  "observing",
  "thinking",
  "asking",
  "confident",
  "teasing",
  "celebration",
  "surprised",
  "learning",
] as const;

export type MascotState = (typeof mascotStates)[number];

export const mascotFacings = ["left", "right"] as const;

export type MascotFacing = (typeof mascotFacings)[number];
