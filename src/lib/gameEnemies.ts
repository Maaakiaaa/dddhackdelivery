import { getPlatformLeft, getPlatformRight, getPlatformTop, type Platform } from "@/lib/gamePlatforms";

export type EnemyPoint = {
  x: number;
  y: number;
};

export type EnemyScreenPosition = {
  row: number;
  col: number;
};

export type Enemy = {
  id: string;
  screen: EnemyScreenPosition;
  x: number;
  y: number;
  minX: number;
  maxX: number;
  speed: number;
  direction: -1 | 1;
  width: number;
  height: number;
  damage?: number;
  frameSrcs?: [string, string];
  shootInterval?: number;
  movementType?: "patrol" | "chase";
};

const PLAYER_HITBOX = {
  width: 4.6,
  height: 10,
};

const BASE_ENEMIES: Enemy[] = [
  {
    id: "enemy-1-1-center",
    screen: { row: 1, col: 1 },
    x: 5,
    y: 95,
    minX: -50,
    maxX: 593,
    speed: 5.5,
    direction: 1,
    width: 3.6,
    height: 4.8,
    damage: 20,
  },
  {
    id: "enemy-1-1-flyer",
    screen: { row: 1, col: 1 },
    x: 70,
    y: 15,
    minX: 16,
    maxX: 78,
    speed: 9,
    direction: -1,
    width: 5,
    height: 7.5,
    damage: 15,
    frameSrcs: ["/flying_donkey_left.png", "/fre2.png"],
  },
  {
    id: "enemy-1-2-shooter",
    screen: { row: 1, col: 2 },
    x: 85,
    y: 97,
    minX: 85,
    maxX: 85,
    speed:0,
    direction: -1,
    width: 4.8,
    height: 6.5,
    damage: 10,
    shootInterval: 2.7,
  },
  {
    id: "enemy-1-3-shooter-1",
    screen:{ row: 1, col: 3},
    x: 30,
    y: 95,
    minX: 30,
    maxX: 30,
    speed: 0,
    direction: 1,
    width: 4.8,
    height: 6.5,
    damage: 10,
    shootInterval: 2.9,
  },
  {
    id: "enemy-1-3-shooter-2",
    screen:{ row: 1, col: 3},
    x: 60,
    y: 64,
    minX: 60,
    maxX: 60,
    speed: 0,
    direction: -1,
    width: 4.8,
    height: 6.5,
    damage: 10,
    shootInterval: 5.3,
  },
  {
    id: "enemy-2-1-left",
    screen: { row: 2, col: 1 },
    x: 13,
    y: 42,
    minX: 9,
    maxX: 17,
    speed: 4.8,
    direction: -1,
    width: 3.6,
    height: 4.8,
    damage: 30,
  },
  {
    id: "enemy-2-1-flyer",
    screen: { row: 2, col: 1 },
    x: 10,
    y: 50,
    minX: 25,
    maxX: 58,
    speed: 9,
    direction: -1,
    width: 5,
    height: 7.5,
    damage: 15,
    frameSrcs: ["/flying_donkey_left.png", "/fre2.png"],
  },
  {
    id: "enemy-2-2-flyer_H",
    screen: { row: 2, col: 2 },
    x: 10,
    y: 20,
    minX: 0,
    maxX: 100,
    speed: 6,
    direction: -1,
    width: 5,
    height: 7.5,
    damage: 15,
    frameSrcs: ["/flying_donkey_left.png", "/fre2.png"],
    movementType: "chase",
  },
  {
    id: "enamy-2-3-flyer",
    screen: {row:2, col:3},
    x: 30,
    y: 42,
    minX:30,
    maxX: 100,
    speed: 9,
    direction: -1,
    width: 5,
    height: 7.5,
    damage: 15,
    frameSrcs: ["/flying_donkey_left.png", "/fre2.png"],
  },
  {
    id: "enemy-3-2-floor",
    screen: { row: 3, col: 2 },
    x: 5,
    y: 95,
    minX: 5,
    maxX: 70,
    speed: 15,
    direction: 1,
    width: 3.8,
    height: 6,
  },
  {
    id: "enemy-3-2-flyer",
    screen: { row: 3, col: 2 },
    x: 1,
    y: 60,
    minX: 1,
    maxX: 27,
    speed: 7,
    direction: 1,
    width: 5,
    height: 7.5,
    damage: 15,
    frameSrcs: ["/flying_donkey_left.png", "/fre2.png"],
  },
];

function isSameScreen(a: EnemyScreenPosition, b: EnemyScreenPosition) {
  return a.row === b.row && a.col === b.col;
}

function cloneEnemy(enemy: Enemy): Enemy {
  return {
    ...enemy,
    screen: { ...enemy.screen },
  };
}

function isOverlapping(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
) {
  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

function getEnemyRect(enemy: { x: number; y: number; width: number; height: number }) {
  return {
    left: enemy.x - enemy.width / 2,
    right: enemy.x + enemy.width / 2,
    top: enemy.y - enemy.height,
    bottom: enemy.y,
  };
}

function getPlatformRect(platform: Platform) {
  return {
    left: getPlatformLeft(platform),
    right: getPlatformRight(platform),
    top: getPlatformTop(platform),
    bottom: platform.y + platform.size / 2,
  };
}

function clampChasingEnemyToPlatforms(
  enemy: Enemy,
  nextX: number,
  nextY: number,
  activePlatforms: Platform[],
) {
  const currentRect = getEnemyRect(enemy);
  let resolvedX = nextX;
  let resolvedY = nextY;
  let nextRect = getEnemyRect({ ...enemy, x: resolvedX, y: resolvedY });

  for (const platform of activePlatforms) {
    const platformRect = getPlatformRect(platform);

    if (!isOverlapping(nextRect, platformRect)) {
      continue;
    }

    if (currentRect.bottom <= platformRect.top && nextRect.bottom > platformRect.top) {
      resolvedY = platformRect.top;
    } else if (currentRect.top >= platformRect.bottom && nextRect.top < platformRect.bottom) {
      resolvedY = platformRect.bottom + enemy.height;
    } else if (currentRect.right <= platformRect.left && nextRect.right > platformRect.left) {
      resolvedX = platformRect.left - enemy.width / 2;
    } else if (currentRect.left >= platformRect.right && nextRect.left < platformRect.right) {
      resolvedX = platformRect.right + enemy.width / 2;
    }

    nextRect = getEnemyRect({ ...enemy, x: resolvedX, y: resolvedY });
  }

  return { x: resolvedX, y: resolvedY };
}

export function getInitialEnemies() {
  return BASE_ENEMIES.map(cloneEnemy);
}

export function getEnemiesForScreen(
  enemies: Enemy[],
  screen: EnemyScreenPosition,
) {
  return enemies.filter((enemy) => isSameScreen(enemy.screen, screen));
}

export function getCollidingEnemy(
  player: EnemyPoint,
  enemies: Enemy[],
  screen: EnemyScreenPosition,
) {
  const playerRect = {
    left: player.x - PLAYER_HITBOX.width / 2,
    right: player.x + PLAYER_HITBOX.width / 2,
    top: player.y - PLAYER_HITBOX.height,
    bottom: player.y,
  };

  return getEnemiesForScreen(enemies, screen).find((enemy) => {
    const enemyRect = {
      left: enemy.x - enemy.width / 2,
      right: enemy.x + enemy.width / 2,
      top: enemy.y - enemy.height,
      bottom: enemy.y,
    };

    return isOverlapping(playerRect, enemyRect);
  });
}

export function updateEnemies(enemies: Enemy[], deltaSeconds: number) {
  return enemies.map((enemy) => {
    if (enemy.movementType === "chase") {
      return enemy;
    }

    if (enemy.speed === 0 || enemy.minX === enemy.maxX) {
      return enemy;
    }

    let nextX = enemy.x + enemy.direction * enemy.speed * deltaSeconds;
    let nextDirection = enemy.direction;

    if (nextX <= enemy.minX) {
      nextX = enemy.minX;
      nextDirection = 1;
    } else if (nextX >= enemy.maxX) {
      nextX = enemy.maxX;
      nextDirection = -1;
    }

    return {
      ...enemy,
      x: nextX,
      direction: nextDirection,
    };
  });
}

export function getChasingEnemy(
  enemy: Enemy,
  player: EnemyPoint,
  activePlatforms: Platform[],
  deltaSeconds: number,
) {
  if (enemy.speed === 0 || enemy.minX === enemy.maxX) {
    return enemy;
  }

  const targetX = Math.max(enemy.minX, Math.min(enemy.maxX, player.x));
  const targetY = player.y;
  const deltaX = targetX - enemy.x;
  const deltaY = targetY - enemy.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance === 0) {
    return enemy;
  }

  const travel = Math.min(enemy.speed * deltaSeconds, distance);
  const ratio = travel / distance;
  const nextX = enemy.x + deltaX * ratio;
  const nextY = enemy.y + deltaY * ratio;
  const nextDirection: -1 | 1 = deltaX < 0 ? -1 : deltaX > 0 ? 1 : enemy.direction;

  const resolved = clampChasingEnemyToPlatforms(
    enemy,
    nextX,
    nextY,
    activePlatforms,
  );

  return {
    ...enemy,
    x: resolved.x,
    y: resolved.y,
    direction: nextDirection,
  };
}

export function isPlayerTouchingEnemy(
  player: EnemyPoint,
  enemies: Enemy[],
  screen: EnemyScreenPosition,
) {
  return Boolean(getCollidingEnemy(player, enemies, screen));
}
