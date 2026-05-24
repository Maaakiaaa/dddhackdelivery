import type { Metadata } from "next";
import HomeMenu from "@/components/HomeMenu";

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

      <section className="mx-auto grid w-full max-w-6xl gap-8 overflow-hidden rounded-[2rem] border border-[var(--panel-border)] bg-[linear-gradient(160deg,rgba(11,14,15,0.94),rgba(17,24,22,0.88))] px-8 py-12 shadow-[0_32px_120px_rgba(0,0,0,0.5)] lg:py-16">
        <div className="flex flex-col gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-amber-100/15 bg-amber-100/5 px-4 py-1 text-sm tracking-[0.2em] text-[var(--accent)]">
                トップページ
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl font-semibold leading-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
                ダンジョン
                <span className="block text-[var(--accent)]">デリバリー</span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
                ダンジョンの中を進み、依頼された荷物を届ける探索ゲームです。
                下のボタンからゲームを開始できます。
              </p>
            </div>
          </div>

          <HomeMenu />
        </div>
      </section>
    </main>
  );
}
