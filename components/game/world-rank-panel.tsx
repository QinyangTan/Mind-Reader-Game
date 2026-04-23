"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react";

import {
  ChamberMemorySurface,
  ResponseWell,
  SurfacePillButton,
} from "@/components/game/scene-surfaces";
import { createPublicGameServices } from "@/lib/game/leaderboard-service";
import { modeMeta } from "@/lib/game/game-config";
import type { GameMode, LeaderboardSnapshot, PlayerProfile } from "@/types/game";

interface WorldRankPanelProps {
  profile: PlayerProfile | null;
  onClose: () => void;
}

function formatScore(value: number) {
  return Intl.NumberFormat("en-US").format(Math.round(value));
}

export function WorldRankPanel({ profile, onClose }: WorldRankPanelProps) {
  const services = useMemo(() => createPublicGameServices(), []);
  const [mode, setMode] = useState<GameMode>("read-my-mind");
  const [snapshot, setSnapshot] = useState<LeaderboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const next = await services.getLeaderboard(mode);
        if (mounted) {
          setSnapshot(next);
        }
      } catch {
        if (mounted) {
          setError("The public ranking mirror is unreachable. Local rankings remain available when no backend is configured.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    const interval = window.setInterval(load, services.refreshIntervalMs);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [mode, services]);

  const playerRank = snapshot?.entries.findIndex((entry) => entry.playerId === profile?.id);

  return (
    <div className="relative mx-auto w-full max-w-[980px]">
      <ChamberMemorySurface
        eyebrow="World Rank"
        title="The public ritual board"
        description={`Rankings are separated by ritual and refreshed ${
          services.source === "remote" ? "from the configured backend" : "from the local dev fallback"
        }.`}
      >
        <div className="absolute right-0 top-0">
          <SurfacePillButton tone="default" surface="compact" className="px-4 py-2" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
            Return
          </SurfacePillButton>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap justify-center gap-3">
            {(["read-my-mind", "guess-my-mind"] as const).map((nextMode) => (
              <SurfacePillButton
                key={nextMode}
                active={mode === nextMode}
                tone={mode === nextMode ? "accent" : "default"}
                surface="tab"
                onClick={() => setMode(nextMode)}
              >
                {modeMeta[nextMode].label}
              </SurfacePillButton>
            ))}
          </div>

          {playerRank !== undefined && playerRank >= 0 ? (
            <ResponseWell tone="muted">
              <p className="text-sm text-[#d7c7a4]">
                {profile?.displayName}, you are currently ranked #{playerRank + 1} in {modeMeta[mode].label}.
              </p>
            </ResponseWell>
          ) : null}

          {error ? (
            <ResponseWell tone="muted">
              <p className="text-sm text-[#d7c7a4]">{error}</p>
            </ResponseWell>
          ) : null}

          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#d7c7a4]">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Reading the board...
              </div>
            ) : snapshot?.entries.length ? (
              snapshot.entries.slice(0, 20).map((entry, index) => {
                const mine = entry.playerId === profile?.id;
                return (
                  <div
                    key={`${entry.playerId}-${entry.mode}`}
                    className={`grid grid-cols-[3rem_1fr_auto] items-center gap-3 border px-4 py-3 text-sm ${
                      mine
                        ? "border-[rgba(246,226,179,0.48)] bg-[rgba(74,43,94,0.72)]"
                        : "border-[rgba(214,174,98,0.18)] bg-[rgba(22,12,31,0.54)]"
                    }`}
                    style={{
                      clipPath:
                        "polygon(14px 0, calc(100% - 14px) 0, 100% 30%, 100% 70%, calc(100% - 14px) 100%, 14px 100%, 0 70%, 0 30%)",
                    }}
                  >
                    <div className="flex items-center gap-1 font-semibold text-[#f6e7bf]">
                      {index === 0 ? <Trophy className="h-4 w-4 text-[#d8b36a]" /> : null}
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-[#f6e7bf]">{entry.displayName}</p>
                      <p className="text-xs text-[#d7c7a4]">
                        {entry.gamesPlayed} games · {entry.wins} wins · avg {Math.round(entry.averageScore)}
                      </p>
                    </div>
                    <p className="font-display text-[1.6rem] leading-none text-[#f6e7bf]">
                      {formatScore(entry.totalScore)}
                    </p>
                  </div>
                );
              })
            ) : (
              <ResponseWell tone="muted">
                <p className="text-sm text-[#d7c7a4]">
                  No scores have been recorded for this ritual yet. Finish a game to write the first mark.
                </p>
              </ResponseWell>
            )}
          </div>
        </div>
      </ChamberMemorySurface>
    </div>
  );
}
