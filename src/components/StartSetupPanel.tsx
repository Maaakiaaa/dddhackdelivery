import Image from "next/image";
import type { DeliveryItem } from "@/data/item-list";

type StartSetupPanelProps = {
  items: DeliveryItem[];
  inventory: Record<string, number>;
  itemLimit: number;
  playerName: string;
  totalItems: number;
  onPlayerNameChange: (value: string) => void;
  onResetItems: () => void;
  onStart: () => void;
  onUpdateItemCount: (itemId: string, delta: number) => void;
};

export default function StartSetupPanel({
  items,
  inventory,
  itemLimit,
  playerName,
  totalItems,
  onPlayerNameChange,
  onResetItems,
  onStart,
  onUpdateItemCount,
}: StartSetupPanelProps) {
  const trimmedPlayerName = playerName.trim();

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 px-4 py-5">
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_32px_90px_rgba(0,0,0,0.7)]">
        <div className="flex shrink-0 flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-7">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)]">
              INVENTORY SETUP
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              持っていくアイテムを選択
            </h2>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-stone-200">
            合計 {totalItems} 個
          </div>
        </div>

        <div className="border-b border-white/10 px-5 py-4 sm:px-7">
          <label className="block text-sm font-semibold text-stone-100">
              プレイヤーネーム
            <input
              type="text"
              value={playerName}
              onChange={(event) => onPlayerNameChange(event.target.value)}
              maxLength={20}
              placeholder="20文字以内で入力"
              className="mt-2 block w-full rounded-lg border border-white/10 bg-black/45 px-4 py-3 text-base text-white outline-none transition placeholder:text-stone-500 focus:border-[var(--accent)]"
            />
          </label>
        </div>

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const count = inventory[item.id] ?? 0;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border border-white/10 bg-black">
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      fill
                      sizes="4rem"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-100">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                      {itemLimit}個まで所持可能
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`${item.name}を減らす`}
                      onClick={() => onUpdateItemCount(item.id, -1)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-black/40 text-lg leading-none text-stone-100 transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={count === 0}
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono text-lg font-bold text-white">
                      {count}
                    </span>
                    <button
                      type="button"
                      aria-label={`${item.name}を増やす`}
                      onClick={() => onUpdateItemCount(item.id, 1)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-black/40 text-lg leading-none text-stone-100 transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={count === itemLimit}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button
            type="button"
            onClick={onResetItems}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-stone-200 transition hover:border-[var(--accent)]"
          >
            リセット
          </button>
          <button
            type="button"
            onClick={onStart}
            disabled={trimmedPlayerName.length === 0}
            className="rounded-lg bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-45"
          >
            この所持数で開始
          </button>
        </div>
      </div>
    </div>
  );
}
