import type {
  MovieCompact,
  MovieDetail,
  Genre,
  Person,
  PaginatedResponse,
  AuthTokens,
  User,
  GenrePreference,
  WatchlistItem,
  Review,
} from "@/types/movie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// Token Management

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(tokens: AuthTokens) {
  accessToken = tokens.access;
  refreshToken = tokens.refresh;
  if (typeof window !== "undefined") {
    sessionStorage.setItem("cq_access", tokens.access);
    sessionStorage.setItem("cq_refresh", tokens.refresh);
  }
}

export function loadTokens() {
  if (typeof window !== "undefined") {
    accessToken = sessionStorage.getItem("cq_access");
    refreshToken = sessionStorage.getItem("cq_refresh");
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("cq_access");
    sessionStorage.removeItem("cq_refresh");
  }
}

// Fetch Wrappe

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && refreshToken) {
    // refreshing token
    const refreshRes = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setTokens({ access: data.access, refresh: refreshToken! });
      headers["Authorization"] = `Bearer ${data.access}`;

      const retryRes = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
      if (!retryRes.ok) throw new Error(`API error: ${retryRes.status}`);
      return retryRes.json();
    } else {
      clearTokens();
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Auth API

export const authAPI = {
  login: async (username: string, password: string) => {
    const tokens = await apiFetch<AuthTokens>("/auth/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setTokens(tokens);
    return tokens;
  },

  register: async (username: string, email: string, password: string) => {
    return apiFetch<User>("/users/register/", {
      method: "POST",
      body: JSON.stringify({ username, email, password, password_confirm: password }),
    });
  },

  getProfile: () => apiFetch<User>("/users/profile/"),

  updateProfile: (data: Partial<User>) =>
    apiFetch<User>("/users/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// Movies API

export const moviesAPI = {
  search: (query: string, page = 1) =>
    apiFetch<PaginatedResponse<MovieCompact>>(
      `/movies/search/?q=${encodeURIComponent(query)}&page=${page}`
    ),

  trending: (window = "week", page = 1) =>
    apiFetch<PaginatedResponse<MovieCompact>>(
      `/movies/trending/?window=${window}&page=${page}`
    ),

  nowPlaying: (page = 1) =>
    apiFetch<PaginatedResponse<MovieCompact>>(`/movies/now-playing/?page=${page}`),

  topRated: (page = 1) =>
    apiFetch<PaginatedResponse<MovieCompact>>(`/movies/top-rated/?page=${page}`),

  getDetail: (tmdbId: number) => apiFetch<any>(`/movies/tmdb/${tmdbId}/`),

  getRecommendations: (movieId: number) =>
    apiFetch<MovieCompact[]>(`/movies/list/${movieId}/recommendations/`),

  getSimilar: (movieId: number) =>
    apiFetch<MovieCompact[]>(`/movies/list/${movieId}/similar/`),

// Built explicit Typescript parameter extraction hooks targeting `getReviews()` & `submitReview()
  getReviews: (movieId: number) =>
    apiFetch<PaginatedResponse<Review>>(`/movies/list/${movieId}/reviews/`),

  submitReview: (movieId: number, rating: number, text: string) =>
    apiFetch<Review>(`/movies/list/${movieId}/reviews/`, {
      method: "POST",
      body: JSON.stringify({ rating, text }),
    }),

  getWikipedia: (movieId: number) =>
    apiFetch<{ summary: string; url: string }>(`/movies/list/${movieId}/wikipedia/`),

  getMoods: () => apiFetch<any[]>("/movies/moods/"),

  getMoodMovies: (slug: string, page = 1) =>
    apiFetch<any>(`/movies/moods/${slug}/?page=${page}`),

  discover: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null) qs.set(k, String(v));
    });
    return apiFetch<PaginatedResponse<MovieCompact>>(`/movies/discover/?${qs.toString()}`);
  },

  compare: (id1: number, id2: number) =>
    apiFetch<{ movies: any[] }>(`/movies/compare/?ids=${id1},${id2}`),
};

// Genres API

export const genresAPI = {
  list: () => apiFetch<Genre[]>("/movies/genres/"),

  getMovies: (slug: string, page = 1, sort = "popularity.desc") =>
    apiFetch<PaginatedResponse<MovieCompact>>(
      `/movies/genres/${slug}/movies/?page=${page}&sort=${sort}`
    ),
};

// People API

export const peopleAPI = {
  search: (query: string) =>
    apiFetch<any>(`/movies/people/search/?q=${encodeURIComponent(query)}`),

  getDetail: (id: number) => apiFetch<Person>(`/movies/people/${id}/`),

  enrich: (id: number) => apiFetch<Person>(`/movies/people/${id}/enrich/`),
};

// Recommendations API

export const recommendationsAPI = {
  forYou: (page = 1) =>
    apiFetch<PaginatedResponse<MovieCompact>>(`/recommendations/for-you/?page=${page}`),

  becauseYouWatched: () =>
    apiFetch<Record<string, MovieCompact[]>>("/recommendations/because-you-watched/"),

  getPreferences: () =>
    apiFetch<GenrePreference[]>("/recommendations/preferences/"),

  trackInteraction: (data: {
    movie_tmdb_id: number;
    movie_title: string;
    interaction_type: string;
    genre_ids?: number[];
    rating?: number;
  }) =>
    apiFetch("/recommendations/track/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getWatchlist: () => apiFetch<WatchlistItem[]>("/recommendations/watchlist/"),

  addToWatchlist: (data: {
    movie_tmdb_id: number;
    movie_title: string;
    poster_path: string;
  }) =>
    apiFetch<WatchlistItem>("/recommendations/watchlist/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  markWatched: (id: number) =>
    apiFetch<WatchlistItem>(`/recommendations/watchlist/${id}/mark_watched/`, {
      method: "POST",
    }),

  removeFromWatchlist: (id: number) =>
    apiFetch(`/recommendations/watchlist/${id}/`, { method: "DELETE" }),

  getDashboard: () => apiFetch<any>("/recommendations/dashboard/"),

  // Movie Share API added to the frontend
  shareWatchlist: (userId: number) =>
    apiFetch("/recommendations/shared-watchlists/share/", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    }),

  getSharedWatchlists: () =>
    apiFetch<any[]>("/recommendations/shared-watchlists/"),

  getSharedWatchlistMovies: (ownerId: number) =>
    apiFetch<WatchlistItem[]>(`/recommendations/shared-watchlists/${ownerId}/`),
};

// Users API
export const usersAPI = {
  searchUsers: (query: string) =>
    apiFetch<User[]>(`/users/search/?q=${encodeURIComponent(query)}`),
};
