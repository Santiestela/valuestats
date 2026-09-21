"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/players", label: "Jugadores" },
  { href: "/matches", label: "Top Partidos" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#2d3748] bg-[#141824] shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-[#10b981] text-2xl">⚽</span>
          <span className="text-white font-bold text-xl tracking-tight">
            Value<span className="text-[#10b981]">Stats</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "bg-[#10b981] text-white"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#1e2535]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto text-xs text-[#64748b]">
          Temporada 2026/27
        </div>
      </div>
    </header>
  );
}
