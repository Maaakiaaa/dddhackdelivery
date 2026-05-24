import Image from "next/image";
import type { DeliveryItem } from "@/data/item-list";

type ItemBagProps = {
  items: DeliveryItem[];
  inventory: Record<string, number>;
  className?: string;
};

export default function ItemBag({ items, inventory, className = "" }: ItemBagProps) {
  const ownedItems = items.filter((item) => (inventory[item.id] ?? 0) > 0);

  return (
    <aside
      aria-label="所持アイテム"
      className={`rounded-lg border border-white/10 bg-black/60 px-3 py-3 text-stone-100 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm ${className}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.2em] text-stone-300">
          ITEM
        </p>
        <p className="text-xs text-stone-400">{ownedItems.length}種</p>
      </div>

      {ownedItems.length > 0 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {ownedItems.map((item) => (
            <div
              key={item.id}
              className="relative h-12 w-12 overflow-hidden rounded-md border border-white/10 bg-stone-950/80"
              title={`${item.name}: ${inventory[item.id]}個`}
            >
              <Image
                src={item.imageSrc}
                alt={item.name}
                fill
                sizes="3rem"
                className="object-cover"
              />
              <span className="absolute bottom-0 right-0 min-w-5 rounded-tl-md bg-black/85 px-1.5 py-0.5 text-center text-xs font-bold leading-none text-white">
                {inventory[item.id]}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="w-40 text-sm text-stone-400">所持アイテムなし</p>
      )}
    </aside>
  );
}
