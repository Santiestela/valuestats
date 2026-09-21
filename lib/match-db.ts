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
const REDIS_KEY = "valuestats:match-db";
const LOCAL_DB_PATH = path.join(process.cwd(), "data", "match-stats.json");

function readLocalDB(): DB {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, "utf-8"));
  } catch {
    return { ...EMPTY_DB };
  }
}

function writeLocalDB(db: DB): void {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

async function withRedis<T>(fn: (client: import("redis").RedisClientType) => Promise<T>): Promise<T> {
  const { createClient } = await import("redis");
  const client = createClient({ url: process.env.REDIS_URL }) as import("redis").RedisClientType;
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.disconnect();
  }
}

export async function readDB(): Promise<DB> {
  if (process.env.REDIS_URL) {
    return withRedis(async (client) => {
      const raw = await client.get(REDIS_KEY);
      return raw ? (JSON.parse(raw) as DB) : { ...EMPTY_DB };
    });
  }
  return readLocalDB();
}

export async function writeDB(db: DB): Promise<void> {
  if (process.env.REDIS_URL) {
    await withRedis(async (client) => {
      await client.set(REDIS_KEY, JSON.stringify(db));
    });
  } else {
    writeLocalDB(db);
  }
}
