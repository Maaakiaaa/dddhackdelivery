"use client";

import { useEffect, useState } from "react";

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function GameTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();

    const intervalId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((performance.now() - startedAt) / 1000));
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      aria-label="ゲーム開始からの経過時間"
      className="absolute right-4 top-4 z-20 min-w-28 rounded-lg border border-white/10 bg-black/55 px-4 py-3 text-right text-stone-100 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm"
    >
      <p className="text-xs font-semibold text-stone-300">TIME</p>
      <p className="font-mono text-2xl font-bold leading-tight">
        {formatElapsedTime(elapsedSeconds)}
      </p>
    </div>
  );
}
