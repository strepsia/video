"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import VideoCarousel from "@/components/video/VideoCarousel";
import { Loader2, LayoutGrid } from "lucide-react";
import type { CategoryRow } from "@/types";

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data: categories } = await supabase
        .from("categories").select("*").neq("slug", "my-list").order("sort_order");

      if (categories) {
        const categoryRows: CategoryRow[] = [];
        for (const cat of categories) {
          const { data: vids } = await supabase
            .from("videos").select("*").eq("category_id", cat.id).eq("is_published", true)
            .order("created_at", { ascending: false }).limit(20);
          if (vids && vids.length > 0) categoryRows.push({ category: cat, videos: vids });
        }
        setRows(categoryRows);
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24">
      <h1 className="text-2xl font-bold text-white mb-6 px-5 md:px-12">Categorias</h1>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 px-5 md:px-12 mb-10">
        {rows.map(({ category }) => (
          <a key={category.id} href={`#cat-${category.slug}`}
            className="px-4 py-2 bg-zinc-900 hover:bg-red-600 border border-zinc-800 hover:border-red-600 rounded-full text-sm text-zinc-300 hover:text-white transition-all cursor-pointer">
            {category.name}
          </a>
        ))}
      </div>

      {/* Videos by category */}
      <div className="space-y-2">
        {rows.map(({ category, videos }) => (
          <div key={category.id} id={`cat-${category.slug}`}>
            <VideoCarousel title={category.name} videos={videos} />
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-6">
          <LayoutGrid className="w-12 h-12 text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm">No hay categorias disponibles</p>
        </div>
      )}
    </div>
  );
}
