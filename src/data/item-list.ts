export type DeliveryItem = {
  id: string;
  name: string;
  imageSrc: string;
};

export type MapItemPlacement = {
  id: string;
  itemId: string;
  screen: {
    row: number;
    col: number;
  };
  x: number;
  y: number;
  size?: number;
};

export const DELIVERY_ITEMS: DeliveryItem[] = [
  {
    id: "daiya",
    name: "ダイヤ",
    imageSrc: "/items/daiya.jpg",
  },
  {
    id: "dynasodo",
    name: "ダイナソード",
    imageSrc: "/items/dynasodo.jpg",
  },
  {
    id: "hurueruisi",
    name: "震える石",
    imageSrc: "/items/hurueruisi.jpg",
  },
  {
    id: "kaseki",
    name: "化石",
    imageSrc: "/items/kaseki.jpg",
  },
  {
    id: "kin",
    name: "金",
    imageSrc: "/items/kin.jpg",
  },
  {
    id: "koutya",
    name: "紅茶",
    imageSrc: "/items/koutya.jpg",
  },
  {
    id: "kusuri",
    name: "薬",
    imageSrc: "/items/kusuri.jpg",
  },
  {
    id: "obentou",
    name: "お弁当",
    imageSrc: "/items/obentou.jpg",
  },
  {
    id: "sinbun",
    name: "新聞",
    imageSrc: "/items/sinbun.jpg",
  },
  {
    id: "takara",
    name: "宝箱",
    imageSrc: "/items/takara.png",
  },
  {
    id: "tetu",
    name: "鉄",
    imageSrc: "/items/tetu.jpg",
  },
  {
    id: "tnt",
    name: "TNT",
    imageSrc: "/items/TNT.jpg",
  },
  {
    id: "toutyuukasou",
    name: "冬虫夏草",
    imageSrc: "/items/toutyuukasou.jpg",
  },
  {
    id: "waremono",
    name: "割れ物",
    imageSrc: "/items/waremono.jpg",
  },
  {
    id: "yakusou",
    name: "薬草",
    imageSrc: "/items/yakusou.jpg",
  },
];

export const MAP_ITEM_PLACEMENTS: MapItemPlacement[] = [
  {
    id: "pickup-takara-1-1",
    itemId: "takara",
    screen: { row: 1, col: 1 },
    x: 38,
    y: 88,
  },
  {
    id: "pickup-takara-1-2",
    itemId: "takara",
    screen: { row: 1, col: 2 },
    x: 34,
    y: 88,
  },
  {
    id: "pickup-takara-1-3",
    itemId: "takara",
    screen: { row: 1, col: 3 },
    x: 66,
    y: 62,
  },
  {
    id: "pickup-takara-2-1",
    itemId: "takara",
    screen: { row: 2, col: 1 },
    x: 18,
    y: 72,
  },
  {
    id: "pickup-takara-3-2",
    itemId: "takara",
    screen: { row: 3, col: 2 },
    x: 74,
    y: 32,
    size: 6,
  },
];
