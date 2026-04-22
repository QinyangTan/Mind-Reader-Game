import type { GameMode, GameResult } from "@/types/game";
import type { MascotFacing, MascotState } from "@/types/mascot";

export type SetupMascotStep = "mode" | "category" | "difficulty" | "review";

export function getSetupMascotState(step: SetupMascotStep): MascotState {
  switch (step) {
    case "mode":
      return "welcome";
    case "category":
      return "asking";
    case "difficulty":
      return "observing";
    case "review":
      return "confident";
    default:
      return "welcome";
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

  return options.mode === "guess-my-mind" ? "teasing" : "asking";
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

  return options.result.winner === "player" ? "celebration" : "teasing";
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
    mode === "guess-my-mind"
      ? "Ask one clear clue, listen to her answer, then decide whether to press your guess."
      : "Hold your thought steady. Mora will pull the pattern forward one question at a time.";

  switch (state) {
    case "welcome":
      return {
        title: "The chamber opens.",
        detail: "Mora waits in the candlelight, ready to lead you into a single clean choice.",
      };
    case "idle":
      return {
        title: "The room is listening.",
        detail: "Nothing moves until you choose the next ritual step.",
      };
    case "observing":
      return {
        title: "She studies the room.",
        detail: "The next move is still yours, but Mora is already weighing the shape of it.",
      };
    case "thinking":
      return {
        title: "She goes quiet.",
        detail: "The answer is forming beneath the surface. Give the chamber one short beat.",
      };
    case "asking":
      return {
        title: "Answer her clearly.",
        detail: readPrompt,
      };
    case "confident":
      return {
        title: "She sees the thread.",
        detail: "Mora only leans in when the pattern feels sharp enough for a real reveal.",
      };
    case "teasing":
      return {
        title: "She knows more than she says.",
        detail: "In this ritual the psychic guards the secret, but every answer still gives something away.",
      };
    case "celebration":
      return {
        title: "The chamber approves.",
        detail: "A clean reveal lands with a bright pulse, then gives the stage back to you.",
      };
    case "surprised":
      return {
        title: "The signal slipped.",
        detail: "Even a miss becomes part of the chamber’s memory if you choose to teach it.",
      };
    case "learning":
      return {
        title: "Teach the chamber.",
        detail: "Name what escaped and Mora will carry that lesson into the next ritual.",
      };
    default:
      return {
        title: "The chamber opens.",
        detail: "One clear decision at a time.",
      };
  }
}
