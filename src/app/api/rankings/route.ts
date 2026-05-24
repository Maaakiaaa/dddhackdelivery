import type { RankingEntry, RankingSavePayload } from "@/lib/ranking";

export const dynamic = "force-dynamic";

type SupabaseScoreRow = {
  id: number | string;
  player_name: string;
  score: number;
  hp: number;
  time_seconds: number;
  time_bonus: number;
  created_at: string;
};

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tableName = process.env.SUPABASE_SCORES_TABLE ?? "scores";

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return {
    baseUrl: `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`,
    key: supabaseKey,
  };
}

function toRankingEntry(row: SupabaseScoreRow): RankingEntry {
  return {
    id: row.id,
    playerName: row.player_name,
    score: row.score,
    hp: row.hp,
    timeSeconds: row.time_seconds,
    timeBonus: row.time_bonus,
    createdAt: row.created_at,
  };
}

function validatePayload(value: unknown): RankingSavePayload | string {
  if (typeof value !== "object" || value === null) {
    return "Invalid payload.";
  }

  const payload = value as Partial<RankingSavePayload>;
  const playerName = String(payload.playerName ?? "").trim();
  const score = Number(payload.score);
  const hp = Number(payload.hp);
  const timeSeconds = Number(payload.timeSeconds);
  const timeBonus = Number(payload.timeBonus);

  if (playerName.length < 1 || playerName.length > 20) {
    return "Player name must be 1 to 20 characters.";
  }

  if (
    !Number.isInteger(score) ||
    !Number.isInteger(hp) ||
    !Number.isInteger(timeSeconds) ||
    !Number.isInteger(timeBonus)
  ) {
    return "Score values must be integers.";
  }

  if (score < 0 || hp < 0 || timeSeconds < 0) {
    return "Score values must be positive.";
  }

  if (timeBonus !== 0 && timeBonus !== 100) {
    return "Invalid time bonus.";
  }

  if (score !== hp + timeBonus) {
    return "Invalid score total.";
  }

  return {
    playerName,
    score,
    hp,
    timeSeconds,
    timeBonus,
  };
}

export async function GET() {
  const config = getSupabaseConfig();

  if (config === null) {
    return Response.json({ rankings: [] });
  }

  const response = await fetch(
    `${config.baseUrl}?select=id,player_name,score,hp,time_seconds,time_bonus,created_at&order=score.desc,time_seconds.asc,created_at.asc&limit=10`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return Response.json(
      { error: "Failed to load rankings." },
      { status: 502 },
    );
  }

  const rows = (await response.json()) as SupabaseScoreRow[];

  return Response.json({ rankings: rows.map(toRankingEntry) });
}

export async function POST(request: Request) {
  const config = getSupabaseConfig();

  if (config === null) {
    return Response.json(
      { error: "Supabase environment variables are not configured." },
      { status: 500 },
    );
  }

  const parsed = validatePayload(await request.json().catch(() => null));

  if (typeof parsed === "string") {
    return Response.json({ error: parsed }, { status: 400 });
  }

  const response = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      player_name: parsed.playerName,
      score: parsed.score,
      hp: parsed.hp,
      time_seconds: parsed.timeSeconds,
      time_bonus: parsed.timeBonus,
    }),
  });

  if (!response.ok) {
    return Response.json(
      { error: "Failed to save ranking." },
      { status: 502 },
    );
  }

  const rows = (await response.json()) as SupabaseScoreRow[];

  return Response.json({ ranking: toRankingEntry(rows[0]) });
}
