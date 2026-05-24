"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatElapsedTime,
  type RankingEntry,
  type ScoreResult,
} from "@/lib/ranking";

type ScoreRankingPanelProps = {
  playerName: string;
  scoreResult: ScoreResult;
};

type SaveState = "idle" | "saving" | "saved" | "error";

async function loadRankings() {
  const response = await fetch("/api/rankings", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("ランキングを取得できませんでした。");
  }

  const data = (await response.json()) as { rankings?: RankingEntry[] };

  return data.rankings ?? [];
}

export default function ScoreRankingPanel({
  playerName,
  scoreResult,
}: ScoreRankingPanelProps) {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const refreshRankings = useCallback(async () => {
    try {
      setRankings(await loadRankings());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "ランキングを取得できませんでした。",
      );
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshRankings();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refreshRankings]);

  async function saveRanking() {
    setSaveState("saving");
    setErrorMessage("");

    try {
      const response = await fetch("/api/rankings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName,
          score: scoreResult.total,
          hp: scoreResult.hpScore,
          timeSeconds: scoreResult.elapsedSeconds,
          timeBonus: scoreResult.timeBonus,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };

        throw new Error(data.error ?? "ランキング登録に失敗しました。");
      }

      setSaveState("saved");
      await refreshRankings();
    } catch (error) {
      setSaveState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "ランキング登録に失敗しました。",
      );
    }
  }

  return (
    <div className="absolute left-1/2 top-4 z-30 w-[min(42rem,calc(100%-2rem))] -translate-x-1/2 rounded-lg border border-[var(--accent)] bg-black/80 px-5 py-4 text-stone-100 shadow-[0_18px_48px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] text-[var(--accent)]">
            SCORE
          </p>
          <p className="mt-1 font-mono text-4xl font-bold leading-none text-white">
            {scoreResult.total}
          </p>
          <div className="mt-4 text-sm leading-6 text-stone-300">
            <p>NAME {playerName}</p>
            <p>TIME {formatElapsedTime(scoreResult.elapsedSeconds)}</p>
            <p>HP +{scoreResult.hpScore}</p>
            <p>ボーナス +{scoreResult.timeBonus}</p>
          </div>
          <button
            type="button"
            onClick={saveRanking}
            disabled={saveState === "saving" || saveState === "saved"}
            className="mt-4 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveState === "saved"
              ? "登録済み"
              : saveState === "saving"
                ? "登録中"
                : "ランキングに登録"}
          </button>
          {errorMessage ? (
            <p className="mt-2 text-xs text-red-300">{errorMessage}</p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold tracking-[0.24em] text-[var(--accent)]">
              RANKING
            </p>
            <button
              type="button"
              onClick={refreshRankings}
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-stone-200 transition hover:border-[var(--accent)]"
            >
              更新
            </button>
          </div>
          {rankings.length > 0 ? (
            <ol className="space-y-1.5">
              {rankings.map((ranking, index) => (
                <li
                  key={ranking.id}
                  className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 rounded-md bg-white/[0.04] px-3 py-2 text-sm"
                >
                  <span className="font-mono text-stone-400">{index + 1}</span>
                  <span className="truncate font-semibold text-stone-100">
                    {ranking.playerName}
                  </span>
                  <span className="font-mono text-stone-200">
                    {ranking.score} / {formatElapsedTime(ranking.timeSeconds)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-md bg-white/[0.04] px-3 py-4 text-sm text-stone-400">
              ランキングはまだありません。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
