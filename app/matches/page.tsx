"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

const CATEGORIES = [
  { key: "totalShots", label: "Tiros Totales", icon: "🎯" },
  { key: "shotsOnTarget", label: "Tiros a Puerta", icon: "🥅" },
  { key: "passes", label: "Pases", icon: "⚡" },
  { key: "fouls", label: "Faltas", icon: "🚨" },
  { key: "yellowCards", label: "Amarillas", icon: "🟨" },
  { key: "redCards", label: "Rojas", icon: "🟥" },
  { key: "corners", label: "Córners", icon: "🚩" },
  { key: "offsides", label: "Fuera de Juego", icon: "🚫" },
  { key: "saves", label: "Paradas", icon: "🧤" },
];

const BIG_5 = [
  { id: "all", name: "Todas", flag: "🌍" },
  { id: "39", name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "140", name: "La Liga", flag: "🇪🇸" },
  { id: "135", name: "Serie A", flag: "🇮🇹" },
  { id: "78", name: "Bundesliga", flag: "🇩🇪" },
  { id: "61", name: "Ligue 1", flag: "🇫🇷" },
];

interface MatchEntry {
  fixtureId: number;
  date: string;
  leagueName: string;
  leagueLogo: string;
  homeTeam: string;
  homeTeamLogo: string;
  awayTeam: string;
  awayTeamLogo: string;
  homeScore: number;
  awayScore: number;
  round: string;
  value: number;
}

export default function MatchesPage() {
  const [activeCategory, setActiveCategory] = useState("totalShots");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; total: number } | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const fetchData = useCallback(async (category: string, league: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/match-stats?category=${category}&league=${league}`);
      const data = await res.json();
      setMatches(data.matches || []);
      setTotalMatches(data.total || 0);
      setLastSynced(data.lastSynced);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeCategory, leagueFilter);
  }, [activeCategory, leagueFilter, fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync-matches", { method: "POST" });
      const data = await res.json();
      setSyncResult(data);
      await fetchData(activeCategory, leagueFilter);
    } finally {
      setSyncing(false);
    }
  };

  const currentCat = CATEGORIES.find((c) => c.key === activeCategory);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Top Partidos por Estadística</h1>
          <p className="text-[#64748b] text-sm mt-1">
            Las 5 grandes ligas — Temporada 2026/27 — {totalMatches} partidos almacenados
          </p>
          {lastSynced && (
            <p className="text-[#64748b] text-xs mt-0.5">
              Última sincronización: {formatDate(lastSynced)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {syncResult && (
            <span className="text-xs text-[#10b981] bg-[#10b981]/10 px-3 py-1.5 rounded-lg border border-[#10b981]/20">
              +{syncResult.synced} partidos nuevos ({syncResult.total} total)
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10b981] text-white text-sm font-medium hover:bg-[#059669] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {syncing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sincronizando...
              </>
            ) : (
              <>↺ Sincronizar datos</>
            )}
          </button>
        </div>
      </div>

      {/* League filter */}
      <div className="flex flex-wrap gap-2">
        {BIG_5.map((l) => (
          <button
            key={l.id}
            onClick={() => setLeagueFilter(l.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              leagueFilter === l.id
                ? "bg-[#10b981] border-[#10b981] text-white"
                : "bg-[#1a1f2e] border-[#2d3748] text-[#94a3b8] hover:border-[#10b981] hover:text-white"
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.name}</span>
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-1 flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 min-w-[120px] justify-center ${
              activeCategory === cat.key
                ? "bg-[#141824] text-white shadow border border-[#2d3748]"
                : "text-[#64748b] hover:text-[#94a3b8]"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Top 10 table */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2d3748] flex items-center gap-2">
          <span className="text-xl">{currentCat?.icon}</span>
          <h2 className="text-white font-semibold">
            Top 10 — {currentCat?.label}
          </h2>
          <span className="ml-auto text-xs text-[#64748b]">Total combinado (ambos equipos)</span>
        </div>

        {loading ? (
          <div className="divide-y divide-[#1e2535]">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="w-6 h-4 bg-[#2d3748] rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#2d3748] rounded w-48" />
                  <div className="h-3 bg-[#2d3748] rounded w-32" />
                </div>
                <div className="w-12 h-8 bg-[#2d3748] rounded" />
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[#64748b] text-lg">No hay datos todavía</p>
            <p className="text-[#475569] text-sm mt-2">
              Haz clic en <strong className="text-[#10b981]">Sincronizar datos</strong> para cargar los partidos
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e2535]">
            {matches.map((match, idx) => (
              <div
                key={match.fixtureId}
                className="px-6 py-4 flex items-center gap-4 hover:bg-[#141824] transition-colors"
              >
                {/* Rank */}
                <div className={`text-lg font-bold w-7 text-center shrink-0 ${
                  idx === 0 ? "text-yellow-400" :
                  idx === 1 ? "text-gray-300" :
                  idx === 2 ? "text-amber-600" :
                  "text-[#475569]"
                }`}>
                  {idx + 1}
                </div>

                {/* Match info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Home team */}
                    <div className="flex items-center gap-2">
                      {match.homeTeamLogo && (
                        <Image src={match.homeTeamLogo} alt={match.homeTeam} width={20} height={20} unoptimized className="object-contain" />
                      )}
                      <span className="text-white font-medium text-sm">{match.homeTeam}</span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-1 bg-[#141824] border border-[#2d3748] rounded px-2 py-0.5">
                      <span className="text-white font-bold text-sm">{match.homeScore}</span>
                      <span className="text-[#64748b] text-xs">-</span>
                      <span className="text-white font-bold text-sm">{match.awayScore}</span>
                    </div>

                    {/* Away team */}
                    <div className="flex items-center gap-2">
                      {match.awayTeamLogo && (
                        <Image src={match.awayTeamLogo} alt={match.awayTeam} width={20} height={20} unoptimized className="object-contain" />
                      )}
                      <span className="text-white font-medium text-sm">{match.awayTeam}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    {match.leagueLogo && (
                      <Image src={match.leagueLogo} alt={match.leagueName} width={14} height={14} unoptimized className="object-contain" />
                    )}
                    <span className="text-[#64748b] text-xs">{match.leagueName}</span>
                    <span className="text-[#475569] text-xs">•</span>
                    <span className="text-[#475569] text-xs">{match.round}</span>
                    <span className="text-[#475569] text-xs">•</span>
                    <span className="text-[#475569] text-xs">{formatDate(match.date)}</span>
                  </div>
                </div>

                {/* Stat value */}
                <div className="shrink-0 text-right">
                  <div className={`text-2xl font-bold ${
                    idx === 0 ? "text-[#10b981]" : "text-white"
                  }`}>
                    {match.value}
                  </div>
                  <div className="text-[#64748b] text-xs">{currentCat?.label}</div>
                </div>

                {/* Bar visual */}
                <div className="hidden md:block w-24 shrink-0">
                  <div className="h-2 bg-[#2d3748] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#10b981] rounded-full"
                      style={{
                        width: `${matches[0]?.value ? (match.value / matches[0].value) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
