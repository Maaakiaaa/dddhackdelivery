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
    id: "tnt",
    name: "TNT",
    imageSrc: "/items/TNT.jpg",
  }
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
