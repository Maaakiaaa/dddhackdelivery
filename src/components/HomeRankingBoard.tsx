"use client";

import { useEffect, useState } from "react";
import { formatElapsedTime, type RankingEntry } from "@/lib/ranking";

async function fetchRankings() {
  const response = await fetch("/api/rankings", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("ランキングを取得できませんでした。");
  }

  const data = (await response.json()) as { rankings?: RankingEntry[] };

  return data.rankings ?? [];
}

export default function HomeRankingBoard() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const nextRankings = await fetchRankings();

        if (isMounted) {
          setRankings(nextRankings);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "ランキングを取得できませんでした。",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="dungeon-ranking-panel relative overflow-hidden border-2 border-[#d8b66a] bg-[#111719] p-5 text-stone-100 shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
      <div className="relative z-10">
        {isLoading ? (
          <p className="border border-white/10 bg-black/35 px-3 py-4 font-mono text-sm text-stone-300">
            LOADING...
          </p>
        ) : errorMessage ? (
          <p className="border border-red-300/30 bg-red-950/30 px-3 py-4 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : rankings.length > 0 ? (
          <ol className="space-y-2">
            {rankings.slice(0, 5).map((ranking, index) => (
              <li
                key={ranking.id}
                className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border border-[#3e4a42] bg-black/35 px-3 py-2 font-mono text-sm shadow-[3px_3px_0_rgba(0,0,0,0.35)]"
              >
                <span className="grid h-7 w-7 place-items-center bg-[#d8b66a] font-bold text-[#111719]">
                  {index + 1}
                </span>
                <span className="min-w-0 truncate font-bold text-stone-100">
                  {ranking.playerName}
                </span>
                <span className="text-right text-[#f2d486]">
                  {ranking.score} / {formatElapsedTime(ranking.timeSeconds)}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="border border-white/10 bg-black/35 px-3 py-4 text-sm text-stone-300">
            まだランキングはありません。
          </p>
        )}
      </div>
    </section>
  );
}
