import type { Metadata } from "next";
import Link from "next/link";

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

export const metadata: Metadata = {
  title: "ダンジョンデリバリー | トップページ",
  description: "ダンジョンデリバリーのトップページです。",
};

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,166,90,0.28),transparent_65%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(112,150,131,0.22),transparent_62%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_26%,transparent_74%,rgba(255,255,255,0.03)_100%)]" />
      </div>

      <section className="mx-auto grid w-full max-w-4xl gap-8 overflow-hidden rounded-[2rem] border border-[var(--panel-border)] bg-[linear-gradient(160deg,rgba(11,14,15,0.94),rgba(17,24,22,0.88))] px-8 py-12 shadow-[0_32px_120px_rgba(0,0,0,0.5)] lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-amber-100/15 bg-amber-100/5 px-4 py-1 text-sm tracking-[0.2em] text-[var(--accent)]">
                トップページ
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl font-semibold leading-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
                ダンジョン
                <span className="block text-[var(--accent)]">ディテクト</span>
                <span className="block text-[var(--accent)]">デリバリー</span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
                ダンジョンの中を進み、依頼された荷物を届ける探索ゲームです。
                下のボタンからゲームを開始できます。
              </p>
            </div>
          </div>

          
        </div>

        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
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
      </section>
    </main>
  );
}
