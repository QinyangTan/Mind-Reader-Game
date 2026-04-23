"use client";

import { useState } from "react";
import { ArrowRight, UserRound } from "lucide-react";

import { PromptPlaque, SurfacePillButton } from "@/components/game/scene-surfaces";
import {
  createPlayerProfile,
  normalizeDisplayName,
  validateDisplayName,
} from "@/lib/game/player-profile";
import type { PlayerProfile } from "@/types/game";

interface PlayerNameGateProps {
  onCreateProfile: (profile: PlayerProfile) => void;
}

export function PlayerNameGate({ onCreateProfile }: PlayerNameGateProps) {
  const [name, setName] = useState("");
  const normalized = normalizeDisplayName(name);
  const error = normalized ? validateDisplayName(normalized) : null;
  const canSubmit = normalized.length > 0 && !error;

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-5 text-center">
      <PromptPlaque variant="dialogue" tail size="md">
        <div className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(226,192,118,0.34)] bg-[rgba(25,13,33,0.78)] text-[#f6e7bf]">
            <UserRound className="h-5 w-5" />
          </div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#d8b36a]">
            Before Mora opens the ledger
          </p>
          <h2 className="font-display text-[2.35rem] leading-[0.94] text-[#f6e7bf] sm:text-[3rem]">
            What name should the chamber remember?
          </h2>
          <p className="mx-auto max-w-[30rem] text-sm leading-7 text-[#d9caac] sm:text-base">
            This creates a local public-player identity for scores and rankings. No email, no password.
          </p>
        </div>
      </PromptPlaque>

      <form
        className="mx-auto flex max-w-[34rem] flex-col items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) {
            return;
          }
          onCreateProfile(createPlayerProfile(normalized));
        }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your player name"
          maxLength={18}
          className="h-12 w-full border border-[rgba(214,174,98,0.34)] bg-[linear-gradient(180deg,rgba(45,24,62,0.9),rgba(21,12,30,0.98))] px-5 text-center text-base text-[#f6e7bf] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#a99976] focus:border-[rgba(242,226,181,0.64)] focus:shadow-[0_0_20px_rgba(177,119,219,0.18)]"
          style={{
            clipPath:
              "polygon(16px 0, calc(100% - 16px) 0, 100% 30%, 100% 70%, calc(100% - 16px) 100%, 16px 100%, 0 70%, 0 30%)",
          }}
        />
        <p className="min-h-5 text-sm text-[#d7c7a4]">
          {error ?? "Letters, numbers, spaces, dots, dashes, and underscores are welcome."}
        </p>
        <SurfacePillButton
          tone="accent"
          surface="choice"
          className="min-w-[14rem] px-7 py-3 text-base"
          disabled={!canSubmit}
          type="submit"
        >
          Enter as {normalized || "Player"}
          <ArrowRight className="h-4 w-4" />
        </SurfacePillButton>
      </form>
    </div>
  );
}
