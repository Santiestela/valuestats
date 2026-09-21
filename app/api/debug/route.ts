import { NextResponse } from "next/server";

const API_KEY = process.env.FOOTBALL_API_KEY!;
const API_BASE = process.env.FOOTBALL_API_BASE!;

export async function GET() {
  const results: Record<string, unknown> = {};

  // Check env vars
  results.envVars = {
    FOOTBALL_API_KEY: API_KEY ? "✓ presente" : "✗ falta",
    FOOTBALL_API_BASE: API_BASE || "✗ falta",
    KV_REST_API_URL: process.env.KV_REST_API_URL ? "✓ presente" : "✗ falta",
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "✓ presente" : "✗ falta",
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

  // Test KV connection
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv");
      await kv.set("test-connection", "ok");
      const val = await kv.get("test-connection");
      results.kvConnection = val === "ok" ? "✓ funciona" : "✗ falló";
    } else {
      results.kvConnection = "✗ variables KV no configuradas";
    }
  } catch (e) {
    results.kvConnection = { error: String(e) };
  }

  return NextResponse.json(results, { status: 200 });
}
