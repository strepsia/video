import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { generatePresignedUrl } from "@/lib/r2/presigned";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesion para ver contenido." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return NextResponse.json(
        { error: "Parametro 'id' requerido." },
        { status: 400 }
      );
    }

    const { data: video, error: dbError } = await supabase
      .from("videos")
      .select("id, r2_key, title, is_published")
      .eq("id", videoId)
      .eq("is_published", true)
      .single();

    if (dbError || !video) {
      return NextResponse.json(
        { error: "Video no encontrado." },
        { status: 404 }
      );
    }

    const { url, expiresAt } = await generatePresignedUrl(video.r2_key);

    return NextResponse.json({
      url,
      expires_at: expiresAt,
      video_id: video.id,
      title: video.title,
    });
  } catch (err) {
    console.error("[video-url] Error generating presigned URL:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
