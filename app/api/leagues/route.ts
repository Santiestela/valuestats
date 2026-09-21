import { NextResponse } from "next/server";

const API_KEY = process.env.FOOTBALL_API_KEY!;
const API_BASE = process.env.FOOTBALL_API_BASE!;

const TOP_LEAGUES = [
  { id: 39, name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 140, name: "La Liga", country: "Spain", flag: "🇪🇸" },
  { id: 135, name: "Serie A", country: "Italy", flag: "🇮🇹" },
  { id: 78, name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  { id: 61, name: "Ligue 1", country: "France", flag: "🇫🇷" },
  { id: 2, name: "Champions League", country: "Europe", flag: "🏆" },
  { id: 3, name: "Europa League", country: "Europe", flag: "🥈" },
  { id: 88, name: "Eredivisie", country: "Netherlands", flag: "🇳🇱" },
  { id: 94, name: "Primeira Liga", country: "Portugal", flag: "🇵🇹" },
  { id: 253, name: "MLS", country: "USA", flag: "🇺🇸" },
];

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/leagues?type=league&current=true`, {
      headers: { "x-apisports-key": API_KEY },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(TOP_LEAGUES);
    }

    const data = await res.json();
    const leagueIds = new Set(TOP_LEAGUES.map((l) => l.id));
    const filtered = (data.response || [])
      .filter((item: { league: { id: number } }) => leagueIds.has(item.league.id))
      .map((item: { league: { id: number; name: string; logo: string }; country: { name: string; flag: string } }) => {
        const top = TOP_LEAGUES.find((l) => l.id === item.league.id);
        return {
          id: item.league.id,
          name: item.league.name,
          logo: item.league.logo,
          country: item.country.name,
          flag: top?.flag || item.country.flag,
        };
      });

    return NextResponse.json(filtered.length > 0 ? filtered : TOP_LEAGUES);
  } catch {
    return NextResponse.json(TOP_LEAGUES);
  }
}
