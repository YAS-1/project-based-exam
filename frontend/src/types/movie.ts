export interface Genre {
  id: number;
  tmdb_id: number;
  name: string;
  slug: string;
  movie_count?: number;
}

export interface Person {
  id: number;
  tmdb_id: number;
  name: string;
  profile_url: string | null;
  known_for_department: string;
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
  directed_movies?: MovieCompact[];
  acted_movies?: MovieCompact[];
}

export interface MovieCompact {
  id: number;
  tmdb_id: number;
  title: string;
  overview: string;
  release_date: string;
  year: number | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  poster_url: string | null;
  poster_url_small: string | null;
  genres: Genre[];
  runtime: number | null;
  genre_ids?: number[];
}

export interface CastMember {
  person: Person;
  character: string;
  order: number;
}

export interface WatchProvider {
  provider_name: string;
  provider_type: "stream" | "rent" | "buy" | "free";
  logo_url: string | null;
  link: string;
}

export interface MovieDetail extends MovieCompact {
  imdb_id: string;
  original_title: string;
  tagline: string;
  backdrop_url: string | null;
  trailer_url: string | null;
  trailer_embed_url: string | null;
  trailer_key: string;
  budget: number;
  revenue: number;
  status: string;
  homepage: string;
  directors: Person[];
  cast: CastMember[];
  watch_providers: WatchProvider[];
  wikipedia_url: string;
  wikipedia_summary: string;
}

// API Response Types 

export interface PaginatedResponse<T> {
  results: T[];
  total_pages?: number;
  total_results?: number;
  page: number;
  query?: string;
}

// User Types 

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  favorite_genres: number[];
  country_code: string;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Recommendation Types

export interface GenrePreference {
  genre_tmdb_id: number;
  genre_name: string;
  weight: number;
  interaction_count: number;
}


// watch list
export interface WatchlistItem{
  id: number;
  movie_tmdb_id: number;
  movie_title: string;
  poster_path : string | null;
  poster_url: string | null;
  added_at : string;
  watched: boolean;
  watched_at: string | null;
}

// review interface
 export interface Review{
  id: number;
  user: number;
  username: string;
  movie: number;
  rating: number;
  text: string;
  created_at: string;
 }
