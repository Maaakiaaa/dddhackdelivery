export type ScoreResult = {
  elapsedSeconds: number;
  hpScore: number;
  timeBonus: number;
  total: number;
};

export type RankingEntry = {
  id: number | string;
  playerName: string;
  score: number;
  hp: number;
  timeSeconds: number;
  timeBonus: number;
  createdAt: string;
};

export type RankingSavePayload = {
  playerName: string;
  score: number;
  hp: number;
  timeSeconds: number;
  timeBonus: number;
};

export function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
