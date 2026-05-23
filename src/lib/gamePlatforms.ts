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
const PLATFORMLESS_ROWS = [4];

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
    label: "start-platform",
    x: 13,
    y: 68,
    size: 4,
    blocks: 3,
    screenRows: [1, 3, 5],
  }),
  createPlatform({
    label: "center-platform",
    x: 39,
    y: 51,
    size: 3.6,
    blocks: 3,
    screenRows: [1, 3, 5],
  }),
  createPlatform({
    label: "middle-rock-platform",
    x: 57,
    y: 55,
    size: 3.6,
    blocks: 3,
    screenRows: [1, 3, 5],
  }),
  createPlatform({
    label: "right-platform",
    x: 69,
    y: 68,
    size: 4,
    blocks: 3,
    screenRows: [1, 3, 5],
  }),
  createPlatform({
    label: "upper-right-platform",
    x: 82,
    y: 33,
    size: 3.6,
    blocks: 3,
    screenRows: [1, 3, 5],
  }),
  createPlatform({
    label: "long-platform-a",
    x: 31,
    y: 82,
    size: 4,
    blocks: 6,
    imageSrc: "/block2.png",
    screenRows: [1, 3, 5],
  }),
  createPlatform({
    label: "long-platform-b",
    x: 76,
    y: 48,
    size: 4,
    blocks: 6,
    imageSrc: "/block2.png",
    screenRows: [1, 3, 5],
  }),
  createPlatform({
    label: "ladder-base-platform",
    x: 90,
    y: 100,
    size: 4,
    blocks: 3,
    screenRows: [1, 2],
    screenCols: [1, 2, 3],
  }),
  createPlatform({
    label: "row-2-left-platform",
    x: 13,
    y: 48,
    size: 4,
    blocks: 3,
    screenRows: [2],
    screenCols: [1, 2, 3],
  }),
  createPlatform({
    label: "row-2-center-platform",
    x: 43,
    y: 70,
    size: 4,
    blocks: 4,
    screenRows: [2],
    screenCols: [1, 2, 3],
  }),
  createPlatform({
    label: "row-2-right-platform",
    x: 78,
    y: 56,
    size: 4,
    blocks: 3,
    screenRows: [2],
    screenCols: [1, 2, 3],
  }),
  createPlatform({
    label: "row-2-long-platform",
    x: 58,
    y: 86,
    size: 4,
    blocks: 6,
    imageSrc: "/block2.png",
    screenRows: [2],
    screenCols: [1, 2, 3],
  }),
  ...Array.from({ length: 24 }, (_, index) =>
    createPlatform({
      label: `bottom-floor-platform-${index + 1}`,
      x: 2 + index * 4,
      y: 100,
      size: 4,
      visualOffsetY: BOTTOM_FLOOR_VISUAL_OFFSET,
      screenRows: [5],
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
