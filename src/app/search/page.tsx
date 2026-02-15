"use client";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  return (
    <div className="pt-20 md:pt-24 px-5 md:px-12">
      <div className="max-w-2xl mx-auto">
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar titulos, generos, actores..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-zinc-500 outline-none focus:border-red-500/50 transition-colors" />
        </div>
        <p className="text-zinc-500 text-center text-sm">Escribe para buscar en el catalogo</p>
      </div>
    </div>
  );
}
