"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { rankCandidates } from "@/lib/game/scoring";
import type {
  EntityCategory,
  GameEntity,
  LearnedInferenceModel,
  RankedCandidate,
  SystemAnsweredQuestion,
} from "@/types/game";

interface WorkerRequest {
  id: number;
  category: EntityCategory;
  asked: SystemAnsweredQuestion[];
  wrongGuessIds: string[];
  extraEntities: GameEntity[];
  inferenceModel?: LearnedInferenceModel;
}

interface WorkerResponse {
  id: number;
  rankings?: RankedCandidate[];
  error?: string;
}

function rankSynchronously(request: Omit<WorkerRequest, "id">) {
  return rankCandidates(
    request.category,
    request.asked,
    request.wrongGuessIds,
    request.extraEntities,
    request.inferenceModel,
  );
}

export function useWorkerCandidateRankings({
  category,
  asked,
  wrongGuessIds,
  extraEntities,
  inferenceModel,
}: Omit<WorkerRequest, "id">) {
  const requestIdRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);
  const workerFailedRef = useRef(false);
  const [rankings, setRankings] = useState<RankedCandidate[]>(() =>
    rankSynchronously({ category, asked, wrongGuessIds, extraEntities, inferenceModel }),
  );
  const [isRanking, setIsRanking] = useState(false);
  const fallbackRankings = useMemo(
    () => rankSynchronously({ category, asked, wrongGuessIds, extraEntities, inferenceModel }),
    [asked, category, extraEntities, inferenceModel, wrongGuessIds],
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof Worker === "undefined" || workerFailedRef.current) {
      setRankings(fallbackRankings);
      setIsRanking(false);
      return;
    }

    let worker = workerRef.current;
    if (!worker) {
      try {
        worker = new Worker(new URL("../../lib/game/ranking-worker.ts", import.meta.url), {
          type: "module",
        });
        workerRef.current = worker;
      } catch {
        workerFailedRef.current = true;
        setRankings(fallbackRankings);
        setIsRanking(false);
        return;
      }
    }

    const id = requestIdRef.current + 1;
    requestIdRef.current = id;
    setIsRanking(true);

    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== requestIdRef.current) {
        return;
      }

      setIsRanking(false);
      if (event.data.rankings) {
        setRankings(event.data.rankings);
      } else {
        setRankings(fallbackRankings);
      }
    };

    const handleError = () => {
      if (id !== requestIdRef.current) {
        return;
      }

      workerFailedRef.current = true;
      setIsRanking(false);
      setRankings(fallbackRankings);
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);
    worker.postMessage({ id, category, asked, wrongGuessIds, extraEntities, inferenceModel } satisfies WorkerRequest);

    return () => {
      worker?.removeEventListener("message", handleMessage);
      worker?.removeEventListener("error", handleError);
    };
  }, [asked, category, extraEntities, fallbackRankings, inferenceModel, wrongGuessIds]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return { rankings, isRanking };
}
