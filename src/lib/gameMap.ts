export type ScreenPosition = {
  row: number;
  col: number;
};

export type MapPoint = {
  x: number;
  y: number;
};

export const START_SCREEN: ScreenPosition = { row: 1, col: 1 };

export const LADDER_X_RANGE = {
  min: 84,
  max: 96,
};

export const LADDER_Y_RANGE = {
  min: 0,
  max: 34,
};

const MAP_COLUMNS_BY_ROW = {
  1: [1, 2, 3],
  2: [1, 2, 3],
  3: [1, 2, 3, 4, 5],
  4: [1, 2, 3, 4, 5],
  5: [1, 2, 3, 4, 5, 6],
} as const;

const MAP_ROWS = Object.keys(MAP_COLUMNS_BY_ROW).map(Number);
const GOAL_SCREEN: ScreenPosition = { row: 5, col: 6 };

export function getMaxRow() {
  return Math.max(...MAP_ROWS);
}

export function getMinRow() {
  return Math.min(...MAP_ROWS);
}

export function getMaxColForRow(row: number) {
  const columns = MAP_COLUMNS_BY_ROW[row as keyof typeof MAP_COLUMNS_BY_ROW];

  return columns === undefined ? 1 : Math.max(...columns);
}

export function isValidScreen(screen: ScreenPosition) {
  const columns = MAP_COLUMNS_BY_ROW[screen.row as keyof typeof MAP_COLUMNS_BY_ROW];

  return columns !== undefined && columns.includes(screen.col as never);
}

export function getScreenBelow(screen: ScreenPosition) {
  const nextScreen = {
    row: screen.row + 1,
    col: screen.col,
  };

  return isValidScreen(nextScreen) ? nextScreen : null;
}

export function getScreenLeft(screen: ScreenPosition) {
  const nextScreen = {
    row: screen.row,
    col: screen.col - 1,
  };

  return isValidScreen(nextScreen) ? nextScreen : null;
}

export function getScreenRight(screen: ScreenPosition) {
  const nextScreen = {
    row: screen.row,
    col: screen.col + 1,
  };

  return isValidScreen(nextScreen) ? nextScreen : null;
}

export function isGoalScreen(screen: ScreenPosition) {
  return screen.row === GOAL_SCREEN.row && screen.col === GOAL_SCREEN.col;
}

export function getRoomBackground(screen: ScreenPosition) {
  return isGoalScreen(screen)
    ? {
        alt: "溶岩の光が差し込むゴールの洞窟",
        src: "/goal.png",
      }
    : {
        alt: "青く光る結晶がある洞窟の背景",
        src: "/map.png",
      };
}

export function shouldShowLadder(screen: ScreenPosition) {
  return isValidScreen(screen) && screen.row >= 2 && screen.col <= 3;
}

export function isOnLadder(point: MapPoint, screen: ScreenPosition) {
  return (
    shouldShowLadder(screen) &&
    point.x >= LADDER_X_RANGE.min &&
    point.x <= LADDER_X_RANGE.max &&
    point.y >= LADDER_Y_RANGE.min &&
    point.y <= LADDER_Y_RANGE.max
  );
}
