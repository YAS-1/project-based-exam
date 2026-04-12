/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Film, Clock } from "lucide-react";
import { recommendationsAPI } from "@/lib/api";
import MovieCard, { MovieCardSkeleton } from "@/components/MovieCard";

export default function SharedWatchlistPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchWatchlist();
    }
  }, [userId]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await recommendationsAPI.getSharedWatchlistMovies(Number(userId));
      setMovies(data);
    } catch (err: any) {
      console.error("Failed to load shared watchlist", err);
      // Depending on API response, we could show a localized error message
      setError("This watchlist is not shared with you or doesn't exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-6 md:px-10 lg:px-20 max-w-[1440px] mx-auto min-h-screen">
      <Link 
        href="/movie-share"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Movie Share
      </Link>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-lg shadow-gold/10">
          <Film className="w-5 h-5 text-surface-0" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display">
            Shared <span className="text-gold italic">Watchlist</span>
          </h1>
          <p className="text-sm text-white/40">
            A list of movies recommended and saved by your friend.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="glass-card rounded-2xl p-10 text-center max-w-lg mx-auto mt-20">
          <Film className="w-16 h-16 text-red-400/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-display mb-2 text-white/80">Access Denied</h2>
          <p className="text-white/40 text-sm mb-6">{error}</p>
          <button 
            onClick={() => router.push("/movie-share")}
            className="bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 px-6 py-2.5 rounded-xl transition-colors text-sm font-medium"
          >
            Go Back
          </button>
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((item, index) => (
            <MovieCard 
              key={item.id} 
              movie={{
                id: item.movie_tmdb_id,
                tmdb_id: item.movie_tmdb_id,
                title: item.movie_title,
                poster_url: item.poster_url,
                poster_path: item.poster_path, // fallback
                vote_average: 0 // Mocked, item doesn't have it unless populated
              } as any} 
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-2xl">
          <Clock className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-display mb-2">Empty Watchlist</h2>
          <p className="text-white/30 text-sm">
            Your friend has not added any movies to their watchlist yet.
          </p>
        </div>
      )}
    </div>
  );
}
