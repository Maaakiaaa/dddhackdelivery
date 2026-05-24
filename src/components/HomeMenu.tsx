"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import HomeRankingBoard from "@/components/HomeRankingBoard";

export default function HomeMenu() {
  const [isRankingOpen, setIsRankingOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl space-y-5">
      <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
        <Link
          href="/game"
          className="group grid h-24 w-64 place-items-center transition hover:scale-105"
        >
          <Image
            src="/start.png"
            alt="ゲーム開始"
            width={512}
            height={192}
            priority
            className="h-auto w-full object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.45)]"
          />
        </Link>

        <button
          type="button"
          onClick={() => setIsRankingOpen(true)}
          className="group grid h-24 w-64 place-items-center transition hover:scale-105"
        >
          <Image
            src="/ranking.png"
            alt="ランキング"
            width={512}
            height={192}
            priority
            className="h-auto w-full object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.45)]"
          />
        </button>
      </div>

      {isRankingOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label="ランキング一覧"
          onClick={() => setIsRankingOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsRankingOpen(false)}
              className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center border-2 border-[#d8b66a] bg-[#2a1d17] font-mono text-lg font-bold text-[#f2d486] shadow-[3px_3px_0_rgba(0,0,0,0.45)] transition hover:bg-[#3a261c]"
              aria-label="ランキングを閉じる"
            >
              X
            </button>
            <HomeRankingBoard />
          </div>
        </div>
      ) : null}
    </div>
  );
}
