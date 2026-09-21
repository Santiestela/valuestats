"use client";

import { useEffect, useState, useCallback } from "react";
import LeagueSelector from "@/components/LeagueSelector";
import PlayerTable from "@/components/PlayerTable";

interface League {
  id: number;
  name: string;
  logo?: string;
  flag: string;
  country: string;
}

interface Player {
  id: number;
  name: string;
  photo: string;
  nationality: string;
  age: number;
  team: string;
  teamLogo: string;
  position: string;
  appearances: number;
  minutes: number;
  rating: string;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number;
  tackles: number;
  interceptions: number;
  dribbles: number;
  dribblesSuccess: number;
  fouls: number;
  foulsSuffered: number;
  yellowCards: number;
  redCards: number;
}

const SEASONS = ["2024", "2023", "2022", "2021"];

export default function PlayersPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState(39);
  const [selectedSeason, setSelectedSeason] = useState("2024");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch("/api/leagues")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLeagues(data);
      });
  }, []);

  const fetchPlayers = useCallback(async (league: number, season: string, p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/players?league=${league}&season=${season}&page=${p}`);
      const data = await res.json();
      setPlayers(data.players || []);
      setTotalPages(data.pagination?.total || 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPlayers(selectedLeague, selectedSeason, 1);
  }, [selectedLeague, selectedSeason, fetchPlayers]);

  const handlePage = (newPage: number) => {
    setPage(newPage);
    fetchPlayers(selectedLeague, selectedSeason, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentLeague = leagues.find((l) => l.id === selectedLeague);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Estadísticas de Jugadores
        </h1>
        <p className="text-[#64748b] text-sm mt-1">
          Estadísticas detalladas de las mejores ligas del mundo
        </p>
      </div>

      {/* League selector */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 space-y-4">
        <LeagueSelector
          leagues={leagues}
          selected={selectedLeague}
          onSelect={setSelectedLeague}
        />

        <div className="flex items-center gap-3">
          <span className="text-[#64748b] text-sm">Temporada:</span>
          <div className="flex gap-1">
            {SEASONS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSeason(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedSeason === s
                    ? "bg-[#10b981] text-white"
                    : "bg-[#141824] text-[#94a3b8] hover:text-white border border-[#2d3748]"
                }`}
              >
                {s}/{Number(s) + 1}
              </button>
            ))}
          </div>

          {currentLeague && (
            <div className="ml-auto flex items-center gap-2 text-sm text-[#94a3b8]">
              {currentLeague.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentLeague.logo} alt="" className="w-5 h-5 object-contain" />
              ) : (
                <span>{currentLeague.flag}</span>
              )}
              <span className="text-white font-medium">{currentLeague.name}</span>
              <span>•</span>
              <span>{currentLeague.country}</span>
            </div>
          )}
        </div>
      </div>

      {/* Player table */}
      <PlayerTable players={players} loading={loading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-[#1a1f2e] border border-[#2d3748] text-[#94a3b8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    page === p
                      ? "bg-[#10b981] text-white"
                      : "bg-[#1a1f2e] border border-[#2d3748] text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => handlePage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-[#1a1f2e] border border-[#2d3748] text-[#94a3b8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
