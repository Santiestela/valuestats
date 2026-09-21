import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FOOTBALL_API_KEY!;
const API_BASE = process.env.FOOTBALL_API_BASE!;

interface ApiPlayerResponse {
  player: {
    id: number;
    name: string;
    photo: string;
    nationality: string;
    age: number;
  };
  statistics: Array<{
    team: { id: number; name: string; logo: string };
    games: { appearences: number; minutes: number; position: string; rating: string };
    goals: { total: number; assists: number };
    shots: { total: number; on: number };
    passes: { total: number; accuracy: number };
    tackles: { total: number; interceptions: number };
    dribbles: { attempts: number; success: number };
    fouls: { committed: number; drawn: number };
    cards: { yellow: number; red: number };
  }>;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const league = searchParams.get("league") || "39";
  const season = searchParams.get("season") || "2026";
  const page = searchParams.get("page") || "1";

  const url = `${API_BASE}/players?league=${league}&season=${season}&page=${page}`;

  const res = await fetch(url, {
    headers: { "x-apisports-key": API_KEY },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Error fetching players", players: [] }, { status: res.status });
  }

  const data = await res.json();

  const players = (data.response || []).map((item: ApiPlayerResponse) => {
    const stat = item.statistics[0];
    return {
      id: item.player.id,
      name: item.player.name,
      photo: item.player.photo,
      nationality: item.player.nationality,
      age: item.player.age,
      team: stat?.team?.name || "-",
      teamLogo: stat?.team?.logo || "",
      position: stat?.games?.position || "-",
      appearances: stat?.games?.appearences || 0,
      minutes: stat?.games?.minutes || 0,
      rating: stat?.games?.rating ? parseFloat(stat.games.rating).toFixed(1) : "-",
      goals: stat?.goals?.total || 0,
      assists: stat?.goals?.assists || 0,
      shots: stat?.shots?.total || 0,
      shotsOnTarget: stat?.shots?.on || 0,
      passes: stat?.passes?.total || 0,
      passAccuracy: stat?.passes?.accuracy || 0,
      tackles: stat?.tackles?.total || 0,
      interceptions: stat?.tackles?.interceptions || 0,
      dribbles: stat?.dribbles?.attempts || 0,
      dribblesSuccess: stat?.dribbles?.success || 0,
      fouls: stat?.fouls?.committed || 0,
      foulsSuffered: stat?.fouls?.drawn || 0,
      yellowCards: stat?.cards?.yellow || 0,
      redCards: stat?.cards?.red || 0,
    };
  });

  return NextResponse.json({
    players,
    pagination: {
      current: data.paging?.current || 1,
      total: data.paging?.total || 1,
    },
  });
}
