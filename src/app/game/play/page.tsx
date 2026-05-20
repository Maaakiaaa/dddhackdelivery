'use client';

import Link from 'next/link';

export default function PlayPage() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,166,90,0.28),transparent_65%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(112,150,131,0.22),transparent_62%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_26%,transparent_74%,rgba(255,255,255,0.03)_100%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
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

        {/* Game Canvas Area */}
        <div className="aspect-video overflow-hidden rounded-[2rem] border border-[var(--panel-border)] bg-[rgba(10,10,10,0.8)] shadow-[0_32px_120px_rgba(0,0,0,0.5)]">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="mb-4 text-lg text-stone-300">
                ゲーム画面（スポーン位置）
              </p>
              <p className="text-sm text-stone-500">
                現在、ゲーム画面の実装中です
              </p>
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
            <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
              プレイヤー情報
            </h3>
            <div className="space-y-2 text-sm text-stone-300">
              <p>位置: 開始地点</p>
              <p>HP: 100</p>
              <p>所持品: 空</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
            <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
              ミッション
            </h3>
            <div className="space-y-2 text-sm text-stone-300">
              <p>📦 配達先を探す</p>
              <p>🏠 安全に戻る</p>
              <p>⭐ スコア: 0</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
            <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
              操作方法
            </h3>
            <div className="space-y-2 text-sm text-stone-300">
              <p>矢印キー: 移動</p>
              <p>Z キー: 確認</p>
              <p>X キー: キャンセル</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
