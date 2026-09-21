import { NextRequest, NextResponse } from "next/server";
import { readDB, type MatchRecord } from "@/lib/match-db";

type StatKey = keyof MatchRecord["stats"];

const VALID_STATS: StatKey[] = [
  "totalShots", "shotsOnTarget", "passes", "fouls",
  "yellowCards", "redCards", "corners", "offsides", "tackles", "saves",
];

const CATEGORIES = [
  { key: "totalShots", label: "Tiros Totales" },
  { key: "shotsOnTarget", label: "Tiros a Puerta" },
  { key: "passes", label: "Pases" },
  { key: "fouls", label: "Faltas" },
  { key: "yellowCards", label: "Amarillas" },
  { key: "redCards", label: "Rojas" },
  { key: "corners", label: "Córners" },
  { key: "offsides", label: "Fueras de Juego" },
  { key: "saves", label: "Paradas" },
] as const;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCategory = searchParams.get("category") || "totalShots";
  const category: StatKey = VALID_STATS.includes(rawCategory as StatKey)
    ? (rawCategory as StatKey)
    : "totalShots";
  const leagueFilter = searchParams.get("league");

  const db = await readDB();

  let matches = db.matches;
  if (leagueFilter && leagueFilter !== "all") {
    matches = matches.filter((m) => m.leagueId === Number(leagueFilter));
  }

  const sorted = [...matches]
    .sort((a, b) => (b.stats[category] as number) - (a.stats[category] as number))
    .slice(0, 10)
    .map((m) => ({
      fixtureId: m.fixtureId,
      date: m.date,
      leagueId: m.leagueId,
      leagueName: m.leagueName,
      leagueLogo: m.leagueLogo,
      homeTeam: m.homeTeam,
      homeTeamLogo: m.homeTeamLogo,
      awayTeam: m.awayTeam,
      awayTeamLogo: m.awayTeamLogo,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      round: m.round,
      value: m.stats[category],
    }));

  return NextResponse.json({
    category,
    matches: sorted,
    total: db.matches.length,
    lastSynced: db.lastSynced["2026"] || null,
    categories: CATEGORIES,
  });
}
