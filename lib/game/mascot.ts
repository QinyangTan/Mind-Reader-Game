import type { GameMode, GameResult } from "@/types/game";
import type { MascotFacing, MascotState } from "@/types/mascot";

export type SetupMascotStep = "mode" | "category" | "difficulty" | "review";

export function getSetupMascotState(step: SetupMascotStep): MascotState {
  switch (step) {
    case "mode":
      return "idle";
    case "category":
      return "asking";
    case "difficulty":
      return "thinking";
    case "review":
      return "confident";
    default:
      return "idle";
  }
}

export function getQuestionMascotState(options: {
  mode: GameMode;
  isPending?: boolean;
  isScanningGuess?: boolean;
}): MascotState {
  if (options.mode === "read-my-mind" && options.isScanningGuess) {
    return "confident";
  }

  if (options.isPending) {
    return "thinking";
  }

  return options.mode === "guess-my-mind" ? "asking" : "asking";
}

export function getResultMascotState(options: {
  result: GameResult;
  teachOpen?: boolean;
  teachSaved?: boolean;
}): MascotState {
  if (options.teachOpen || options.teachSaved) {
    return "learning";
  }

  if (options.result.mode === "read-my-mind") {
    return options.result.winner === "system" ? "celebration" : "surprised";
  }

  return options.result.winner === "player" ? "celebration" : "confident";
}

export function getMascotFacing(mode?: GameMode, reverse = false): MascotFacing {
  const facing: MascotFacing = mode === "guess-my-mind" ? "left" : "right";
  if (!reverse) {
    return facing;
  }

  return facing === "left" ? "right" : "left";
}

export function getMascotCopy(state: MascotState, mode?: GameMode) {
  const readPrompt =
    mode === "guess-my-mind" ? "Pick a clue, then name the pattern." : "One answer at a time. Mora keeps up.";

  switch (state) {
    case "idle":
      return {
        title: "Mora is ready.",
        detail: "Quiet wings, clear choices, and one clean path into the parlor.",
      };
    case "thinking":
      return {
        title: "Reading the room.",
        detail: "A better hint is forming. Hold the stage for one beat.",
      };
    case "asking":
      return {
        title: "Follow the signal.",
        detail: readPrompt,
      };
    case "confident":
      return {
        title: "The pattern is sharp.",
        detail: "Mora leans in when the next reveal feels strong enough to matter.",
      };
    case "celebration":
      return {
        title: "That landed.",
        detail: "The room rewards a clean reveal with one quick spark and no extra noise.",
      };
    case "surprised":
      return {
        title: "The signal slipped.",
        detail: "A miss is still useful. Mora remembers where the pattern broke.",
      };
    case "learning":
      return {
        title: "Commit it to memory.",
        detail: "Teach one useful trait and the parlor carries it into the next round.",
      };
    default:
      return {
        title: "Mora is ready.",
        detail: "One clear decision at a time.",
      };
  }
}
