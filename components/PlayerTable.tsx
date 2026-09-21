"use client";

import { useState } from "react";
import Image from "next/image";

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

type SortKey = keyof Player;

const STAT_COLUMNS: { key: SortKey; label: string; short: string; title: string }[] = [
  { key: "appearances", label: "PJ", short: "PJ", title: "Partidos jugados" },
  { key: "goals", label: "GOL", short: "G", title: "Goles" },
  { key: "assists", label: "AST", short: "A", title: "Asistencias" },
  { key: "shots", label: "TIR", short: "T", title: "Tiros totales" },
  { key: "shotsOnTarget", label: "T/P", short: "T/P", title: "Tiros a puerta" },
  { key: "passes", label: "PAS", short: "P", title: "Pases totales" },
  { key: "passAccuracy", label: "%PAS", short: "%P", title: "Precisión de pases (%)" },
  { key: "dribbles", label: "DRB", short: "D", title: "Regates intentados" },
  { key: "tackles", label: "ENT", short: "E", title: "Entradas" },
  { key: "fouls", label: "FAL", short: "F", title: "Faltas cometidas" },
  { key: "yellowCards", label: "AM", short: "A", title: "Tarjetas amarillas" },
  { key: "redCards", label: "RO", short: "R", title: "Tarjetas rojas" },
  { key: "rating", label: "RAT", short: "R", title: "Valoración media" },
];

const POSITIONS = ["Todos", "Attacker", "Midfielder", "Defender", "Goalkeeper"];

interface Props {
  players: Player[];
  loading: boolean;
}

export default function PlayerTable({ players, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("goals");
  const [sortAsc, setSortAsc] = useState(false);
  const [posFilter, setPosFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const filtered = players
    .filter((p) => {
      const matchPos = posFilter === "Todos" || p.position === posFilter;
      const matchSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.team.toLowerCase().includes(search.toLowerCase());
      return matchPos && matchSearch;
    })
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === "-" || aVal === null || aVal === undefined) return 1;
      if (bVal === "-" || bVal === null || bVal === undefined) return -1;
      const diff = Number(aVal) - Number(bVal);
      return sortAsc ? diff : -diff;
    });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar jugador o equipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg px-3 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-[#10b981] w-56"
        />
        <div className="flex gap-1">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosFilter(pos)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                posFilter === pos
                  ? "bg-[#10b981] text-white"
                  : "bg-[#1a1f2e] text-[#94a3b8] hover:text-white border border-[#2d3748]"
              }`}
            >
              {pos === "Attacker" ? "Delantero" : pos === "Midfielder" ? "Centrocampista" : pos === "Defender" ? "Defensa" : pos === "Goalkeeper" ? "Portero" : pos}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-[#64748b]">
          {filtered.length} jugadores
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#2d3748]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#141824] border-b border-[#2d3748]">
              <th className="text-left px-4 py-3 text-[#64748b] font-medium w-8">#</th>
              <th className="text-left px-4 py-3 text-[#64748b] font-medium min-w-[200px]">Jugador</th>
              <th className="text-left px-3 py-3 text-[#64748b] font-medium min-w-[130px]">Equipo</th>
              <th className="text-left px-3 py-3 text-[#64748b] font-medium">Pos</th>
              {STAT_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 text-[#64748b] font-medium cursor-pointer hover:text-[#10b981] transition-colors text-right select-none"
                  onClick={() => handleSort(col.key)}
                  title={col.title}
                >
                  <span className="flex items-center justify-end gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-[#10b981]">{sortAsc ? "↑" : "↓"}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 20 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1e2535] animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 bg-[#1e2535] rounded w-4" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1e2535] rounded-full" />
                      <div className="h-4 bg-[#1e2535] rounded w-28" />
                    </div>
                  </td>
                  <td className="px-3 py-3"><div className="h-4 bg-[#1e2535] rounded w-20" /></td>
                  <td className="px-3 py-3"><div className="h-4 bg-[#1e2535] rounded w-12" /></td>
                  {STAT_COLUMNS.map((col) => (
                    <td key={col.key} className="px-3 py-3 text-right">
                      <div className="h-4 bg-[#1e2535] rounded w-8 ml-auto" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4 + STAT_COLUMNS.length} className="text-center py-16 text-[#64748b]">
                  No se encontraron jugadores
                </td>
              </tr>
            ) : (
              filtered.map((player, idx) => (
                <tr
                  key={player.id}
                  className="border-b border-[#1e2535] hover:bg-[#1a1f2e] transition-colors"
                >
                  <td className="px-4 py-3 text-[#64748b] text-xs">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {player.photo ? (
                        <Image
                          src={player.photo}
                          alt={player.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover bg-[#1e2535]"
                          unoptimized
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#1e2535] flex items-center justify-center text-xs text-[#64748b]">
                          {player.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-white font-medium truncate max-w-[140px]">
                        {player.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {player.teamLogo && (
                        <Image
                          src={player.teamLogo}
                          alt={player.team}
                          width={18}
                          height={18}
                          className="object-contain"
                          unoptimized
                        />
                      )}
                      <span className="text-[#94a3b8] text-xs truncate max-w-[100px]">{player.team}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      player.position === "Attacker" ? "bg-red-500/20 text-red-400" :
                      player.position === "Midfielder" ? "bg-blue-500/20 text-blue-400" :
                      player.position === "Defender" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {player.position === "Attacker" ? "DEL" :
                       player.position === "Midfielder" ? "MED" :
                       player.position === "Defender" ? "DEF" :
                       player.position === "Goalkeeper" ? "POR" : player.position}
                    </span>
                  </td>
                  {STAT_COLUMNS.map((col) => {
                    const val = player[col.key];
                    const isHighStat = col.key === "yellowCards" && Number(val) >= 5;
                    const isRedCard = col.key === "redCards" && Number(val) >= 1;
                    const isRating = col.key === "rating";
                    const ratingNum = isRating ? parseFloat(String(val)) : 0;

                    return (
                      <td
                        key={col.key}
                        className={`px-3 py-3 text-right font-mono text-sm ${
                          sortKey === col.key ? "text-white" : "text-[#94a3b8]"
                        } ${isHighStat ? "text-yellow-400" : ""} ${isRedCard ? "text-red-400" : ""} ${
                          isRating && ratingNum >= 8 ? "text-[#10b981] font-bold" :
                          isRating && ratingNum >= 7 ? "text-blue-400" : ""
                        }`}
                      >
                        {col.key === "passAccuracy" && val !== null ? `${val}%` : val ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
