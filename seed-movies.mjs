// seed-movies.mjs
// Ejecutar: node seed-movies.mjs

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNDhjOGY0OTI0NWNlOGIxZTNjMTQ1ZDA1ZmZiNTFlMCIsIm5iZiI6MTc3MTE4MzY3Ni44MTksInN1YiI6IjY5OTIxZTNjYWIzYzM1ZTI1YmZhMzJhMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2CA0YzF-g88MN0vs8mSvIlUE2Z7aI4nydqVPLs3Qxsk";

// ── TUS CREDENCIALES DE SUPABASE ──
const SUPABASE_URL = "https://xvwgxlzihdaomsqufzkh.supabase.co"; // <- cámbialo si es diferente
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2d2d4bHppaGRhb21zcXVmemtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE3MjYzMCwiZXhwIjoyMDg2NzQ4NjMwfQ.VyNFMc9dxV4aOytha521rpCeFgBVmFG_aZvneRKdjMo"; // <- PEGA TU SERVICE ROLE KEY

const TMDB_IMG = "https://image.tmdb.org/t/p";

// Mapeo de géneros TMDB -> categorías de tu DB
const GENRE_TO_CATEGORY = {
  28: "action",
  12: "action",
  16: "animation",
  35: "comedy",
  80: "drama",
  99: "documentaries",
  18: "drama",
  10751: "comedy",
  14: "sci-fi",
  36: "drama",
  27: "horror",
  10402: "drama",
  9648: "horror",
  10749: "romance",
  878: "sci-fi",
  10770: "drama",
  53: "action",
  10752: "action",
  37: "action",
};

async function tmdbFetch(endpoint) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`TMDB error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function supabaseQuery(table, method, body) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const headers = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: method === "POST" ? "return=representation" : "return=minimal",
  };

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${method} ${table}: ${res.status} ${text}`);
  }
  if (method === "POST" || method === "GET") return res.json();
  return null;
}

async function getCategories() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?select=id,slug`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  return res.json();
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🎬 Descargando peliculas de TMDB...\n");

  // 1. Obtener categorías existentes
  const categories = await getCategories();
  const catMap = {};
  for (const c of categories) {
    catMap[c.slug] = c.id;
  }
  console.log(`✅ ${categories.length} categorias cargadas`);

  // 2. Descargar películas populares (varias páginas para tener variedad)
  const allMovies = [];
  for (let page = 1; page <= 5; page++) {
    const data = await tmdbFetch(`/movie/popular?language=es-ES&page=${page}`);
    allMovies.push(...data.results);
  }
  console.log(`✅ ${allMovies.length} peliculas descargadas de TMDB`);

  // 3. Descargar también por géneros específicos para llenar categorías
  const genrePages = [
    { genre: 27, name: "Terror" },
    { genre: 878, name: "Sci-Fi" },
    { genre: 99, name: "Documentales" },
    { genre: 10749, name: "Romance" },
    { genre: 16, name: "Animacion" },
  ];

  for (const gp of genrePages) {
    const data = await tmdbFetch(
      `/discover/movie?language=es-ES&with_genres=${gp.genre}&sort_by=popularity.desc&page=1`
    );
    allMovies.push(...data.results);
    console.log(`  + ${data.results.length} peliculas de ${gp.name}`);
  }

  // 4. Eliminar duplicados por ID
  const seen = new Set();
  const uniqueMovies = allMovies.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return m.poster_path && m.backdrop_path; // Solo las que tienen imágenes
  });

  console.log(`✅ ${uniqueMovies.length} peliculas unicas con imagenes\n`);

  // 5. Preparar e insertar
  let inserted = 0;
  let featured = false;

  for (const movie of uniqueMovies.slice(0, 80)) {
    // Determinar categoría
    const genreId = movie.genre_ids?.[0];
    const catSlug = GENRE_TO_CATEGORY[genreId] || "trending";
    const categoryId = catMap[catSlug] || catMap["trending"];

    const slug = slugify(movie.title) + "-" + movie.id;

    // Marcar la primera como featured
    const isFeatured = !featured && movie.vote_average > 7;
    if (isFeatured) featured = true;

    const video = {
      title: movie.title,
      slug: slug,
      description: movie.overview || null,
      r2_key: `videos/${slug}.mp4`, // placeholder
      thumbnail_url: `${TMDB_IMG}/w500${movie.poster_path}`,
      backdrop_url: `${TMDB_IMG}/original${movie.backdrop_path}`,
      duration_seconds: Math.floor(90 * 60 + Math.random() * 60 * 60), // 90-150 min simulado
      release_year: movie.release_date
        ? parseInt(movie.release_date.split("-")[0])
        : null,
      rating: movie.vote_average || 0,
      maturity_rating: movie.adult ? "R" : "PG-13",
      category_id: categoryId,
      is_featured: isFeatured,
      is_published: true,
    };

    try {
      await supabaseQuery("videos", "POST", video);
      inserted++;
      const marker = isFeatured ? " ⭐ FEATURED" : "";
      console.log(
        `  [${inserted}] ${movie.title} → ${catSlug}${marker}`
      );
    } catch (err) {
      // Probablemente slug duplicado, skip
      if (err.message.includes("duplicate")) {
        console.log(`  [SKIP] ${movie.title} (ya existe)`);
      } else {
        console.error(`  [ERROR] ${movie.title}: ${err.message}`);
      }
    }
  }

  console.log(`\n============================================`);
  console.log(`🎬 ${inserted} peliculas insertadas correctamente!`);
  console.log(`============================================`);
  console.log(`\nAbre https://video-coral-omega.vercel.app para verlas.`);
}

main().catch(console.error);
