"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Video, CategoryRow } from "@/types";

export function useVideos() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [featured, setFeatured] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAll() {
      const { data: featuredData } = await supabase
        .from("videos")
        .select("*, category:categories(*)")
        .eq("is_featured", true)
        .eq("is_published", true)
        .limit(1)
        .single();

      if (featuredData) setFeatured(featuredData);

      const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      if (categories) {
        const categoryRows: CategoryRow[] = [];
        for (const cat of categories) {
          const { data: vids } = await supabase
            .from("videos")
            .select("*")
            .eq("category_id", cat.id)
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .limit(20);

          if (vids && vids.length > 0) {
            categoryRows.push({ category: cat, videos: vids });
          }
        }
        setRows(categoryRows);
      }
      setLoading(false);
    }
    fetchAll();
  }, [supabase]);

  return { rows, featured, loading };
}
