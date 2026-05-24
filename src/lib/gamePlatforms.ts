import { isGoalScreen, type ScreenPosition } from "@/lib/gameMap";

export type Platform = {
  label: string;
  x: number;
  y: number;
  size: number;
  blocks: number;
  imageSrc: string;
  visualOffsetY: number;
  screenRows?: number[];
  screenCols?: number[];
};

type PlatformInput = {
  label?: string;
  x: number;
  y: number;
  size: number;
  blocks?: number;
  imageSrc?: string;
  visualOffsetY?: number;
  screenRows?: number[];
  screenCols?: number[];
};

const PLATFORM_SURFACE_OFFSET = 4.0;
const BOTTOM_FLOOR_VISUAL_OFFSET = 2;
const PLATFORMLESS_ROWS: number[] = [];

function createPlatform(platform: PlatformInput): Platform {
  return {
    label: platform.label ?? `platform-${platform.x}-${platform.y}`,
    x: platform.x,
    y: platform.y,
    size: platform.size,
    blocks: platform.blocks ?? 1,
    imageSrc: platform.imageSrc ?? "/block.png",
    visualOffsetY: platform.visualOffsetY ?? 0,
    screenRows: platform.screenRows,
    screenCols: platform.screenCols,
  };
}

// Add new platforms here with createPlatform({ x, y, size, blocks }).
// Use screenRows/screenCols only when a platform should appear in specific rooms.
const platforms = [
  createPlatform({
    label: "ladder-base-platform",
    x: 90,
    y: 100,
    size: 4,
    blocks: 3,
    screenRows: [1, 2, 3],
    screenCols: [1, 2, 3],
  }),
  ...Array.from({ length: 18 }, (_, index) =>
    createPlatform({
      label: `screen-1-2-bottom-block-${index + 1}`,
      x: 2 + index * 4,
      y: 100,
      size: 4,
      blocks: 1,
      screenRows: [1],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-1-2-vertical-block-${index + 1}`,
      x: 100,
      y: 95 - index * 10,
      size: 4,
      blocks: 1,
      screenRows: [1],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 10 }, (_, index) =>
    createPlatform({
      label: `screen-1-3-bottom-block-${index + 1}`,
      x: 1 + index * 4,
      y: 100,
      size: 4,
      blocks: 1,
      screenRows: [1],
      screenCols: [3],
    }),
  ),
  ...Array.from({ length: 12 }, (_, index) =>
    createPlatform({
      label: `screen-1-3-center-block-${index + 1}`,
      x: 100 - index * 4,
      y: 70,
      size: 4,
      blocks: 1,
      screenRows: [1],
      screenCols: [3],
    }),
  ),
  ...Array.from({ length: 10 }, (_, index) =>
    createPlatform({
      label: `screen-1-3-top-block-${index + 1}`,
      x: 1 + index * 4,
      y: 50,
      size: 4,
      blocks: 1,
      screenRows: [1],
      screenCols: [3],
    }),
  ),
  createPlatform({
    label: "row-2-1-left-platform",
    x: 20,
    y: 80,
    size: 4,
    blocks: 24,
    screenRows: [2],
    screenCols: [1],
  }),
  ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-2-1-right-vertical-block-${index + 1}`,
      x:99,
      y: 100 - index * 5,
      size: 4,
      blocks: 1,
      screenRows: [2],
      screenCols: [1],
    }),
  ),
  createPlatform({
    label: "row-2-2-center-platform",
    x: 35,
    y: 60,
    size: 4,
    blocks: 4,
    screenRows: [2],
    screenCols: [2],
  }),
  createPlatform({
    label: "row-2-long-platform",
    x: 80,
    y: 40,
    size: 4,
    blocks: 6,
    imageSrc: "/block2.png",
    screenRows: [2],
    screenCols: [2],
  }),
    ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-2-3-right-bottom-block-${index + 1}`,
      x: 70 + index * 4,
      y: 70,
      size: 4,
      screenRows: [2],
      screenCols: [3],
    }),
  ),
      ...Array.from({ length: 12 }, (_, index) =>
    createPlatform({
      label: `screen-2-3-left-bottom-block-${index + 1}`,
      x: 30 + index * 2,
      y: 50,
      size: 4,
      screenRows: [2],
      screenCols: [3],
    }),
  ),
  ...Array.from({ length: 24 }, (_, index) =>
    createPlatform({
      label: `screen-2-3-bottom-block-${index + 1}`,
      x: 2 + index * 4,
      y: 100,
      size: 4,
      screenRows: [2],
      screenCols: [3],
    }),
  ),
  ...Array.from({ length: 18 }, (_, index) =>
    createPlatform({
      label: `screen-3-2-bottom-block-${index + 1}`,
      x: 2 + index * 4,
      y: 100,
      size: 4,
      screenRows: [3],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 18 }, (_, index) =>
    createPlatform({
      label: `screen-3-2-vertical-block-vertical-block-${index + 1}`,
      x: 1,
      y: 100 - index * 3,
      size: 4,
      blocks: 1,
      screenRows: [3],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 17 }, (_, index) =>
    createPlatform({
      label: `screen-3-2-top-right-block-${index + 1}`,
      x: 30 + index * 4,
      y: 40,
      size: 4,
      blocks: 1,
      screenRows: [3],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 11 }, (_, index) =>
    createPlatform({
      label: `screen-3-1-top-right-block-${index + 1}`,
      x: 60 + index * 4,
      y: 50,
      size: 4,
      blocks: 1,
      screenRows: [3],
      screenCols: [1],
    }),
  ),
  ...Array.from({ length: 11 }, (_, index) =>
    createPlatform({
      label: `screen-3-left-bottom-block-${index + 1}`,
      x: 2 + index * 4,
      y: 70,
      size: 4,
      blocks: 1,
      screenRows: [3],
      screenCols: [1],
    }),
  ),
   ...Array.from({ length: 15 }, (_, index) =>
    createPlatform({
      label: `screen-3-vertical-right-bottom-block-${index + 1}`,
      x: 100,
      y: 100 - index * 3,
      size: 4,
      blocks: 1,
      screenRows: [3],
      screenCols: [1],
    }),
  ),
  ...Array.from({ length: 24 }, (_, index) =>
    createPlatform({
      label: `screen-1-1-bottom-floor-platform-${index + 1}`,
      x: 2 + index * 4,
      y: 100,
      size: 4,
      screenRows: [1],
      screenCols: [1],
    }),
  ),
  ...Array.from({ length: 25 }, (_, index) =>
    createPlatform({
      label: `screen-3-bottom-floor-platform-${index + 1}`,
      x: 2 + index * 4,
      y: 100,
      size: 4,
      screenRows: [3],
      screenCols: [1, 3, 4, 5],
    }),
  ),
  ...Array.from({ length: 25 }, (_, index) =>
    createPlatform({
      label: `screen-4-bottom-floor-platform-${index + 1}`,
      x: 2 + index * 4,
      y: 100,
      size: 4,
      screenRows: [4],
      screenCols: [1,  4, 5],
    }),
  ),
  ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-4-1-left-floor-platform-${index + 1}`,
      x: 2 + index * 4,
      y: 70,
      size: 4,
      screenRows: [4],
      screenCols: [1],
    }),
  ),
  ...Array.from({ length: 12 }, (_, index) =>
    createPlatform({
      label: `screen-4-2-bottom-floor-platform-${index + 1}`,
      x: 2 + index * 4,
      y: 100,
      size: 4,
      screenRows: [4],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 18 }, (_, index) =>
    createPlatform({
      label: `screen-4-2-top-floor-platform-${index + 1}`,
      x: 40 + index * 4,
      y: 40,
      size: 4,
      screenRows: [4],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 24 }, (_, index) =>
    createPlatform({
      label: `screen-4-2-vertical-left-block-vertical-block-${index + 1}`,
      x: 1,
      y: 70 - index * 3,
      size: 4,
      blocks: 1,
      screenRows: [4],
      screenCols: [2],
    }),
  ),
 ...Array.from({ length: 4 }, (_, index) =>
    createPlatform({
      label: `screen-4-2-center-floor-platform-${index + 1}`,
      x: 65 + index * 4,
      y: 75,
      size: 4,
      screenRows: [4],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 10 }, (_, index) =>
    createPlatform({
      label: `screen-4-2-vertical-right-block-vertical-block-${index + 1}`,
      x: 100,
      y: 100 - index * 3,
      size: 4,
      blocks: 2,
      screenRows: [4],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 7 }, (_, index) =>
    createPlatform({
      label: `screen-4-2-right-2-floor-platform-${index + 1}`,
      x: 90 + index * 4,
      y: 70,
      size: 4,
      screenRows: [4],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-4-3-left-floor-platform-${index + 1}`,
      x: 1 + index * 4,
      y: 40,
      size: 4,
      screenRows: [4],
      screenCols: [3],
    }),
  ),
  ...Array.from({ length: 20 }, (_, index) =>
    createPlatform({
      label: `screen-4-3-vertical-center-block-${index + 1}`,
      x: 34,
      y: 100 - index * 3,
      size: 4,
      blocks: 1,
      screenRows: [4],
      screenCols: [3],
    }),
  ),
  ...Array.from({ length: 20 }, (_, index) =>
    createPlatform({
      label: `screen-4-3-right-floor-platform-${index + 1}`,
      x: 38 + index * 4,
      y: 100,
      size: 4,
      screenRows: [4],
      screenCols: [3],
    }),
  ),
  ...Array.from({ length: 4 }, (_, index) =>
    createPlatform({
      label: `screen-4-4-center-floor-platform-${index + 1}`,
      x: 50 + index * 4,
      y: 70,
      size: 4,
      screenRows: [4],
      screenCols: [4],
    }),
  ),
  ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-4-4-right-floor-platform-${index + 1}`,
      x: 80 + index * 4,
      y: 50,
      size: 4,
      screenRows: [4],
      screenCols: [4],
    }),
  ),
  ...Array.from({ length: 12 }, (_, index) =>
    createPlatform({
      label: `screen-4-5-left-floor-platform-${index + 1}`,
      x: 1 + index * 4,
      y: 60,
      size: 4,
      screenRows: [4],
      screenCols: [5],
    }),
  ),
  ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-4-5-right-floor-platform-${index + 1}`,
      x: 60 + index * 4,
      y: 40,
      size: 4,
      screenRows: [4],
      screenCols: [5],
    }),
  ),
    ...Array.from({ length: 25 }, (_, index) =>
    createPlatform({
      label: `screen-5-1-bottom-floor-platform-${index + 1}`,
      x: 2 + index * 4,
      y: 100,
      size: 4,
      screenRows: [5],
      screenCols: [1, 2, 3, 4, 5, 6],
    }),
  ),
    ...Array.from({ length: 4 }, (_, index) =>
    createPlatform({
      label: `screen-5-1-left-floor-platform-${index + 1}`,
      x: 30 + index * 4,
      y: 70,
      size: 4,
      screenRows: [5],
      screenCols: [1],
    }),
  ),
    ...Array.from({ length: 4 }, (_, index) =>
    createPlatform({
      label: `screen-5-1-right-floor-platform-${index + 1}`,
      x: 50 + index * 4,
      y: 40,
      size: 4,
      screenRows: [5],
      screenCols: [1],
    }),
  ),
    ...Array.from({ length: 14 }, (_, index) =>
    createPlatform({
      label: `screen-5-2-right-floor-platform-${index + 1}`,
      x: 50 + index * 4,
      y: 35,
      size: 4,
      screenRows: [5],
      screenCols: [2],
    }),
  ),
  ...Array.from({ length: 20 }, (_, index) =>
    createPlatform({
      label: `screen-5-2-vertical-right-block-vertical-block-${index + 1}`,
      x: 100,
      y: 100 - index * 3,
      size: 4,
      blocks: 1,
      screenRows: [5],
      screenCols: [2],
    }),
  ),
    ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-5-3-left-floor-platform-${index + 1}`,
      x: 1 + index * 4,
      y: 40,
      size: 4,
      screenRows: [5],
      screenCols: [3],
    }),
  ),
    ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-5-4-left-floor-platform-${index + 1}`,
      x: 1 + index * 4,
      y: 40,
      size: 4,
      screenRows: [5],
      screenCols: [4],
    }),
  ),
     ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-5-4-right-floor-platform-${index + 1}`,
      x: 50 + index * 4,
      y: 70,
      size: 4,
      screenRows: [5],
      screenCols: [4],
    }),
  ),
     ...Array.from({ length: 8 }, (_, index) =>
    createPlatform({
      label: `screen-5-5-right-floor-platform-${index + 1}`,
      x: 70 + index * 4,
      y: 50,
      size: 4,
      screenRows: [5],
      screenCols: [5],
    }),
  ),
];


export const START_PLATFORM = platforms[0];

export function getPlatformTop(platform: Platform) {
  return platform.y - platform.size / 2 - PLATFORM_SURFACE_OFFSET;
}

export function getPlatformBlockCount(platform: Platform) {
  return platform.blocks;
}

export function getPlatformImageSrc(platform: Platform) {
  return platform.imageSrc;
}

export function getPlatformVisualTop(platform: Platform) {
  return platform.y + platform.visualOffsetY;
}

export function getPlatformLeft(platform: Platform) {
  return platform.x - (platform.size * getPlatformBlockCount(platform)) / 2;
}

export function getPlatformRight(platform: Platform) {
  return platform.x + (platform.size * getPlatformBlockCount(platform)) / 2;
}

export function getActivePlatforms(screen: ScreenPosition) {
  if (isGoalScreen(screen) || PLATFORMLESS_ROWS.includes(screen.row)) {
    return [];
  }

  return platforms.filter((platform) => {
    const matchesRow =
      platform.screenRows === undefined || platform.screenRows.includes(screen.row);
    const matchesCol =
      platform.screenCols === undefined || platform.screenCols.includes(screen.col);

    return matchesRow && matchesCol;
  });
}

export function findPlatformTopAtPoint(
  point: { x: number; y: number },
  activePlatforms: Platform[],
) {
  return activePlatforms.find((platform) => {
    const isOnTopEdge = Math.abs(point.y - getPlatformTop(platform)) < 0.4;

    return (
      isOnTopEdge &&
      point.x >= getPlatformLeft(platform) &&
      point.x <= getPlatformRight(platform)
    );
  });
}

export function findLandingPlatform(
  x: number,
  fromY: number,
  toY: number,
  activePlatforms: Platform[],
) {
  return activePlatforms
    .filter((platform) => {
      const platformTop = getPlatformTop(platform);

      return (
        x >= getPlatformLeft(platform) &&
        x <= getPlatformRight(platform) &&
        platformTop >= fromY &&
        platformTop <= toY
      );
    })
    .sort((a, b) => getPlatformTop(a) - getPlatformTop(b))[0];
}
