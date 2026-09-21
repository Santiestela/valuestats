import { NextResponse } from "next/server";
import { readDB, writeDB, type MatchRecord } from "@/lib/match-db";

const API_KEY = process.env.FOOTBALL_API_KEY!;
const API_BASE = process.env.FOOTBALL_API_BASE!;

const BIG_5 = [
  { id: 39, name: "Premier League" },
  { id: 140, name: "La Liga" },
  { id: 135, name: "Serie A" },
  { id: 78, name: "Bundesliga" },
  { id: 61, name: "Ligue 1" },
];

const SEASON = "2026";

function apiHeaders() {
  return { "x-apisports-key": API_KEY };
}

function getStat(stats: Array<{ type: string; value: number | string | null }>, type: string): number {
  const item = stats.find((s) => s.type === type);
  if (!item || item.value === null) return 0;
  return parseInt(String(item.value).replace("%", "")) || 0;
}

export async function POST() {
  const db = await readDB();
  const storedIds = new Set(db.matches.map((m) => m.fixtureId));
  const newMatches: MatchRecord[] = [];
  let requestsUsed = 0;

  for (const league of BIG_5) {
    const fixturesRes = await fetch(
      `${API_BASE}/fixtures?league=${league.id}&season=${SEASON}&status=FT&last=10`,
      { headers: apiHeaders() }
    );
    requestsUsed++;
    if (!fixturesRes.ok) continue;

    const fixturesData = await fixturesRes.json();
    const fixtures = fixturesData.response || [];

    for (const fixture of fixtures) {
      const fId: number = fixture.fixture.id;
      if (storedIds.has(fId)) continue;

      const statsRes = await fetch(`${API_BASE}/fixtures/statistics?fixture=${fId}`, {
        headers: apiHeaders(),
      });
      requestsUsed++;
      if (!statsRes.ok) continue;

      const statsData = await statsRes.json();
      const teamStats: Array<Array<{ type: string; value: number | string | null }>> = (
        statsData.response || []
      ).map((t: { statistics: Array<{ type: string; value: number | string | null }> }) => t.statistics);

      if (teamStats.length < 2) continue;

      const [home, away] = teamStats;

      const record: MatchRecord = {
        fixtureId: fId,
        date: fixture.fixture.date,
        leagueId: league.id,
        leagueName: fixture.league.name,
        leagueLogo: fixture.league.logo,
        homeTeam: fixture.teams.home.name,
        homeTeamLogo: fixture.teams.home.logo,
        awayTeam: fixture.teams.away.name,
        awayTeamLogo: fixture.teams.away.logo,
        homeScore: fixture.goals.home ?? 0,
        awayScore: fixture.goals.away ?? 0,
        round: fixture.league.round,
        stats: {
          totalShots: getStat(home, "Total Shots") + getStat(away, "Total Shots"),
          shotsOnTarget: getStat(home, "Shots on Goal") + getStat(away, "Shots on Goal"),
          fouls: getStat(home, "Fouls") + getStat(away, "Fouls"),
          yellowCards: getStat(home, "Yellow Cards") + getStat(away, "Yellow Cards"),
          redCards: getStat(home, "Red Cards") + getStat(away, "Red Cards"),
          passes: getStat(home, "Total passes") + getStat(away, "Total passes"),
          corners: getStat(home, "Corner Kicks") + getStat(away, "Corner Kicks"),
          offsides: getStat(home, "Offsides") + getStat(away, "Offsides"),
          tackles: getStat(home, "Blocked Shots") + getStat(away, "Blocked Shots"),
          saves: getStat(home, "Goalkeeper Saves") + getStat(away, "Goalkeeper Saves"),
        },
      };

      newMatches.push(record);
      storedIds.add(fId);
    }
  }

  db.matches.push(...newMatches);
  db.lastSynced[SEASON] = new Date().toISOString();
  await writeDB(db);

  return NextResponse.json({
    synced: newMatches.length,
    total: db.matches.length,
    requestsUsed,
  });
}
