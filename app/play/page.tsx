import { GameShell } from "@/components/game/game-shell";

interface PlayPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const params = await searchParams;
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const difficulty = Array.isArray(params.difficulty) ? params.difficulty[0] : params.difficulty;

  return <GameShell initialMode={mode} initialCategory={category} initialDifficulty={difficulty} />;
}
