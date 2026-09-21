import { NextResponse } from "next/server";

const API_KEY = process.env.FOOTBALL_API_KEY!;
const API_BASE = process.env.FOOTBALL_API_BASE!;

export async function GET() {
  const results: Record<string, unknown> = {};

  // Check env vars
  results.envVars = {
    FOOTBALL_API_KEY: API_KEY ? "✓ presente" : "✗ falta",
    FOOTBALL_API_BASE: API_BASE || "✗ falta",
    REDIS_URL: process.env.REDIS_URL ? "✓ presente" : "✗ falta",
  };

  // Test API connection
  try {
    const res = await fetch(`${API_BASE}/status`, {
      headers: { "x-apisports-key": API_KEY },
    });
    const data = await res.json();
    results.apiStatus = {
      ok: res.ok,
      account: data.response?.account,
      requests: data.response?.requests,
    };
  } catch (e) {
    results.apiStatus = { error: String(e) };
  }

  // Test Premier League last 3 fixtures (without season filter)
  try {
    const res = await fetch(`${API_BASE}/fixtures?league=39&last=3`, {
      headers: { "x-apisports-key": API_KEY },
    });
    const data = await res.json();
    results.lastFixtures = {
      ok: res.ok,
      total: data.results,
      fixtures: data.response?.map((f: { fixture: { date: string; status: { short: string } }; teams: { home: { name: string }; away: { name: string } } }) => ({
        date: f.fixture.date,
        status: f.fixture.status.short,
        match: `${f.teams.home.name} vs ${f.teams.away.name}`,
      })),
    };
  } catch (e) {
    results.lastFixtures = { error: String(e) };
  }

  // Test Redis connection
  try {
    if (process.env.REDIS_URL) {
      const { createClient } = await import("redis");
      const client = createClient({ url: process.env.REDIS_URL });
      await client.connect();
      await client.set("test-connection", "ok");
      const val = await client.get("test-connection");
      await client.disconnect();
      results.redisConnection = val === "ok" ? "✓ funciona" : "✗ falló";
    } else {
      results.redisConnection = "✗ REDIS_URL no configurada";
    }
  } catch (e) {
    results.redisConnection = { error: String(e) };
  }

  return NextResponse.json(results, { status: 200 });
}
