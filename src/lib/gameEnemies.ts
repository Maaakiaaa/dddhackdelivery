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
};

const PLAYER_HITBOX = {
  width: 4.6,
  height: 10,
};

const BASE_ENEMIES: Enemy[] = [
  {
    id: "enemy-1-1-center",
    screen: { row: 1, col: 1 },
    x: 39,
    y: 45.2,
    minX: 34,
    maxX: 44,
    speed: 5.5,
    direction: 1,
    width: 3.6,
    height: 4.8,
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
  },
  {
    id: "enemy-3-2-floor",
    screen: { row: 3, col: 2 },
    x: 48,
    y: 94,
    minX: 0,
    maxX: 100,
    speed: 7,
    direction: 1,
    width: 3.8,
    height: 6,
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

export function getInitialEnemies() {
  return BASE_ENEMIES.map(cloneEnemy);
}

export function getEnemiesForScreen(
  enemies: Enemy[],
  screen: EnemyScreenPosition,
) {
  return enemies.filter((enemy) => isSameScreen(enemy.screen, screen));
}

export function updateEnemies(enemies: Enemy[], deltaSeconds: number) {
  return enemies.map((enemy) => {
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

export function isPlayerTouchingEnemy(
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

  return getEnemiesForScreen(enemies, screen).some((enemy) => {
    const enemyRect = {
      left: enemy.x - enemy.width / 2,
      right: enemy.x + enemy.width / 2,
      top: enemy.y - enemy.height,
      bottom: enemy.y,
    };

    return isOverlapping(playerRect, enemyRect);
  });
}
