import fs from "fs";
import path from "path";

export interface MatchRecord {
  fixtureId: number;
  date: string;
  leagueId: number;
  leagueName: string;
  leagueLogo: string;
  homeTeam: string;
  homeTeamLogo: string;
  awayTeam: string;
  awayTeamLogo: string;
  homeScore: number;
  awayScore: number;
  round: string;
  stats: {
    totalShots: number;
    shotsOnTarget: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
    passes: number;
    corners: number;
    offsides: number;
    tackles: number;
    saves: number;
  };
}

interface DB {
  matches: MatchRecord[];
  lastSynced: Record<string, string>;
}

const EMPTY_DB: DB = { matches: [], lastSynced: {} };

function isVercelKV() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "match-stats.json");

function readLocalDB(): DB {
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { ...EMPTY_DB };
  }
}

function writeLocalDB(db: DB): void {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function readDB(): Promise<DB> {
  if (isVercelKV()) {
    const { kv } = await import("@vercel/kv");
    const data = await kv.get<DB>("valuestats:match-db");
    return data ?? { ...EMPTY_DB };
  }
  return readLocalDB();
}

export async function writeDB(db: DB): Promise<void> {
  if (isVercelKV()) {
    const { kv } = await import("@vercel/kv");
    await kv.set("valuestats:match-db", db);
  } else {
    writeLocalDB(db);
  }
}
