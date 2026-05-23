import GameScreen from "@/components/GameScreen";
import Link from "next/link";

export default function PlayPage() {
  return (
    <main className="relative flex h-screen flex-1 items-stretch justify-center overflow-hidden px-4 py-4 sm:px-5 lg:px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,166,90,0.28),transparent_65%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(112,150,131,0.22),transparent_62%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_26%,transparent_74%,rgba(255,255,255,0.03)_100%)]" />
      </div>

      <div className="mx-auto flex h-full min-h-0 w-full max-w-none flex-col">
        {/* Header */}
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--foreground)]">
              ゲーム画面
            </h1>
            
          </div>
          <Link
            href="/game"
            className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-2 text-sm transition duration-200 hover:border-[var(--accent)] hover:bg-white/[0.05]"
          >
            ← 戻る
          </Link>
        </div>

        <GameScreen />
      </div>
    </main>
  );
}
