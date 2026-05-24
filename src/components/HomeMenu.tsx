"use client";

import Link from "next/link";
import { useState } from "react";
import HomeRankingBoard from "@/components/HomeRankingBoard";

const menuItems = [
  {
    label: "ゲーム開始",
    description: "配達ミッションを始めます。",
    href: "/game",
    primary: true,
  },
  {
    label: "ゲーム説明",
    description: "詳細なゲーム説明を見ます。",
    href: "/game",
    primary: false,
  },
] as const;

function menuButtonClass(primary = false) {
  return `group rounded-[1.5rem] border px-5 py-5 text-left transition duration-200 ${
    primary
      ? "border-[var(--accent)] bg-[linear-gradient(180deg,rgba(226,199,137,0.22),rgba(226,199,137,0.08))] shadow-[0_18px_40px_rgba(226,199,137,0.12)] hover:translate-y-[-2px] hover:bg-[linear-gradient(180deg,rgba(226,199,137,0.3),rgba(226,199,137,0.12))]"
      : "border-white/10 bg-white/[0.03] hover:border-[var(--accent)] hover:bg-white/[0.05]"
  }`;
}

export default function HomeMenu() {
  const [isRankingOpen, setIsRankingOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="grid max-w-4xl gap-4 sm:grid-cols-3">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={menuButtonClass(item.primary)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[var(--foreground)]">
                  {item.label}
                </span>
                <span className="text-sm text-stone-400 transition group-hover:text-[var(--accent)]">
                  &gt;
                </span>
              </div>
              <p className="text-sm leading-6 text-stone-300">
                {item.description}
              </p>
            </div>
          </Link>
        ))}

        <button
          type="button"
          onClick={() => setIsRankingOpen((current) => !current)}
          className={menuButtonClass(false)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-[var(--foreground)]">
                ランキング
              </span>
              <span className="text-sm text-stone-400 transition group-hover:text-[var(--accent)]">
                {isRankingOpen ? "∨" : ">"}
              </span>
            </div>
            <p className="text-sm leading-6 text-stone-300">
              スコア上位を表示します。
            </p>
          </div>
        </button>
      </div>

      {isRankingOpen ? <HomeRankingBoard /> : null}
    </div>
  );
}
