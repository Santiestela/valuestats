import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "ValueStats - Estadísticas de Fútbol",
  description: "Estadísticas detalladas de jugadores de las mejores ligas del mundo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0f1117] text-[#e2e8f0]">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
