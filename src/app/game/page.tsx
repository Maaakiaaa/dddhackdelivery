import type { Metadata } from "next";
import Link from "next/link";

const menuItems = [
  {
    label: "ゲーム開始",
    description: "配達ミッションを始めます。",
    href: "/game/play",
    primary: true,
  },
  {
    label: "ホームへ戻る",
    description: "トップページへ戻ります。",
    href: "/",
    primary: false,
  },
] as const;

const storyPoints = [
  "王国の秘密の倉庫から、重要な荷物を回収する使命を受けた。",
  "ダンジョン内を移動し、暗い回廊の奥にある配達先を探さなければならない。",
  "敵や仕掛けを避けながら、目的地にたどり着く。",
  "荷物を受け取ったら、安全に脱出地点まで戻る。",
  "すべてのミッションを完遂できるだろうか？",
] as const;

const controlHints = [
  { key: "矢印キー", action: "プレイヤーを移動させる" },
  { key: "Z / Enter", action: "アイテムを取得、配達先に配達する" },
  { key: "X / ESC", action: "メニューを開く、キャンセルする" },
  { key: "R", action: "ゲームを再スタートする" },
] as const;

export const metadata: Metadata = {
  title: "ダンジョンデリバリー | タイトル",
  description: "ダンジョンデリバリーのタイトル画面です。",
};

export default function GamePage() {
  return (
    <main className="relative flex flex-1 items-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,166,90,0.28),transparent_65%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(112,150,131,0.22),transparent_62%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_26%,transparent_74%,rgba(255,255,255,0.03)_100%)]" />
      </div>

      <section className="mx-auto grid w-full max-w-7xl gap-8 overflow-hidden rounded-[2rem] border border-[var(--panel-border)] bg-[linear-gradient(160deg,rgba(11,14,15,0.94),rgba(17,24,22,0.88))] p-6 shadow-[0_32px_120px_rgba(0,0,0,0.5)] lg:grid-cols-[1fr_1fr] lg:p-10">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-400">
              <span className="rounded-full border border-amber-100/15 bg-amber-100/5 px-4 py-1 tracking-[0.2em] text-[var(--accent)]">
                ゲーム説明
              </span>
              <span>プロトタイプ版</span>
            </div>

            <div className="space-y-5">
              <p className="text-sm tracking-[0.35em] text-stone-400">
                DUNGEON DELIVERY
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-[var(--foreground)] sm:text-6xl lg:text-5xl">
                配達ミッション
                <span className="block text-[var(--accent)]">を完遂せよ</span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
                ダンジョンの奥へ進み、秘密の荷物を回収して脱出する冒険。
                敵や障害を上手く避けながら、ミッションを成功させられるか？
              </p>
            </div>
          </div>

          <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`group rounded-[1.5rem] border px-5 py-5 transition duration-200 ${
                  item.primary
                    ? "border-[var(--accent)] bg-[linear-gradient(180deg,rgba(226,199,137,0.22),rgba(226,199,137,0.08))] shadow-[0_18px_40px_rgba(226,199,137,0.12)] hover:translate-y-[-2px] hover:bg-[linear-gradient(180deg,rgba(226,199,137,0.3),rgba(226,199,137,0.12))]"
                    : "border-white/10 bg-white/[0.03] hover:border-[var(--accent)] hover:bg-white/[0.05]"
                }`}
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
          </div>
        </div>

        <div className="grid gap-5">
          <section
            id="briefing"
            className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6"
          >
            <h2 className="mb-4 text-sm tracking-[0.3em] text-stone-300">
              ストーリー
            </h2>
            <ul className="space-y-3 text-sm leading-7 text-stone-300">
              {storyPoints.map((point, index) => (
                <li
                  key={index}
                  className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                >
                  <span className="text-[var(--accent)]">◆</span> {point}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-sm tracking-[0.3em] text-stone-300">
              操作方法
            </h2>
            <div className="space-y-3">
              {controlHints.map((hint) => (
                <div
                  key={hint.key}
                  className="flex items-start justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                >
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.26em] text-[var(--accent)]">
                    {hint.key}
                  </span>
                  <span className="text-right text-sm text-stone-300">{hint.action}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
