"use client";

interface League {
  id: number;
  name: string;
  logo?: string;
  flag: string;
  country: string;
}

interface Props {
  leagues: League[];
  selected: number;
  onSelect: (id: number) => void;
}

export default function LeagueSelector({ leagues, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {leagues.map((league) => (
        <button
          key={league.id}
          onClick={() => onSelect(league.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
            selected === league.id
              ? "bg-[#10b981] border-[#10b981] text-white shadow-lg shadow-[#10b981]/20"
              : "bg-[#1a1f2e] border-[#2d3748] text-[#94a3b8] hover:border-[#10b981] hover:text-white"
          }`}
        >
          {league.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain" />
          ) : (
            <span className="text-base">{league.flag}</span>
          )}
          <span className="hidden sm:inline">{league.name}</span>
        </button>
      ))}
    </div>
  );
}
