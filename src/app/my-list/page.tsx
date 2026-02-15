"use client";
import { BookmarkPlus } from "lucide-react";

export default function MyListPage() {
  return (
    <div className="pt-20 md:pt-24 px-5 md:px-12">
      <h1 className="text-2xl font-bold text-white mb-6">Mi Lista</h1>
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <BookmarkPlus className="w-12 h-12 text-zinc-700 mb-3" />
        <p className="text-zinc-500 text-sm">Agrega videos a tu lista para verlos despues</p>
      </div>
    </div>
  );
}
