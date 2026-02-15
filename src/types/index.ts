export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: "viewer" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  r2_key: string;
  thumbnail_url: string | null;
  backdrop_url: string | null;
  duration_seconds: number | null;
  release_year: number | null;
  rating: number;
  maturity_rating: "G" | "PG" | "PG-13" | "R" | "NC-17";
  category_id: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
  video?: Video;
}

export interface VideoWithUrl extends Video {
  presigned_url: string;
}

export interface PresignedUrlResponse {
  url: string;
  expires_at: string;
}

export interface ApiError {
  error: string;
  status: number;
}

export interface CategoryRow {
  category: Category;
  videos: Video[];
}
