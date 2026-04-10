"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star, Clock, Calendar, Play, ExternalLink, ArrowLeft,
  Globe, Film, Users, ThumbsUp, ThumbsDown, Bookmark,
  BookmarkCheck, Heart, Sparkles, ChevronRight,
} from "lucide-react";
import MovieCarousel from "@/components/MovieCarousel";
import MovieCard from "@/components/MovieCard";
import ReviewSection from "@/components/ReviewSection";
import { useAuth } from "@/lib/AuthContext";
import { moviesAPI, recommendationsAPI } from "@/lib/api";
import {
  posterUrl, backdropUrl, formatRuntime, formatCurrency,
  formatDate, ratingColor,
} from "@/lib/utils";
import type { MovieCompact } from "@/types/movie";

function getLikedMovies(): any[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("cq_liked") || "[]");
  } catch {
    return [];
  }
}

function saveLikedMovies(movies: any[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cq_liked", JSON.stringify(movies));
}

function getWatchlist(): any[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("cq_watchlist") || "[]");
  } catch {
    return [];
  }
}

function saveWatchlist(movies: any[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cq_watchlist", JSON.stringify(movies));
}

export default function MovieDetailPage() {
  const params = useParams();
  const tmdbId = Number(params.id);
  const { isAuthenticated } = useAuth(); // Authentication Context

  const [movie, setMovie] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<MovieCompact[]>([]);
  const [similarMovies, setSimilarMovies] = useState<MovieCompact[]>([]);
  const [likedRecs, setLikedRecs] = useState<MovieCompact[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Initializing like/bookmark state
  useEffect(() => {
    if (!tmdbId) return;
    const liked = getLikedMovies();
    const watchlist = getWatchlist();
    const likedEntry = liked.find((m: any) => m.id === tmdbId);
    setIsLiked(likedEntry?.type === "like");
    setIsDisliked(likedEntry?.type === "dislike");
    setIsBookmarked(watchlist.some((m: any) => m.id === tmdbId));
    setLikeCount(liked.filter((m: any) => m.type === "like").length);
  }, [tmdbId]);

  // Fetching movie data plus recommendations
  useEffect(() => {
    if (!tmdbId) return;

    async function fetchAll() {
      setLoading(true);
      try {
        const data = await moviesAPI.getDetail(tmdbId);
        setMovie(data);


        const recs = data?.recommendations?.results || [];
        setRecommendations(recs.slice(0, 15));

        // Similar movies
        const similar = data?.similar?.results || [];
        setSimilarMovies(similar.slice(0, 15));

        // "Because you liked" - get recs from liked movies
        fetchLikedRecommendations();
      } catch (err) {
        console.error("Failed to fetch movie:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [tmdbId]);

  // Fetch recommendations based on locally liked movies
  async function fetchLikedRecommendations() {
    const liked = getLikedMovies().filter((m: any) => m.type === "like");
    if (liked.length === 0) return;

    try {
      // Take a random liked movie and get its recommendations
      const randomLiked = liked[Math.floor(Math.random() * liked.length)];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/movies/tmdb/${randomLiked.id}/`
      ).then(r => r.json());
      const recs = res?.recommendations?.results || [];
      setLikedRecs(recs.slice(0, 10));
    } catch {
      // Silently fail
    }
  }

  // Like / Dislike / Bookmark handlers
  const handleLike = useCallback(() => {
    const liked = getLikedMovies();
    const filtered = liked.filter((m: any) => m.id !== tmdbId);

    if (isLiked) {
      // Unlike
      saveLikedMovies(filtered);
      setIsLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      // Like
      filtered.push({
        id: tmdbId,
        title: movie?.title || "",
        poster_path: movie?.poster_path || "",
        type: "like",
        genres: (movie?.genres || []).map((g: any) => g.id),
        timestamp: Date.now(),
      });
      saveLikedMovies(filtered);
      setIsLiked(true);
      setIsDisliked(false);
      setLikeCount((c) => c + 1);
    }
  }, [tmdbId, isLiked, movie]);

  const handleDislike = useCallback(() => {
    const liked = getLikedMovies();
    const filtered = liked.filter((m: any) => m.id !== tmdbId);

    if (isDisliked) {
      saveLikedMovies(filtered);
      setIsDisliked(false);
    } else {
      filtered.push({
        id: tmdbId,
        title: movie?.title || "",
        poster_path: movie?.poster_path || "",
        type: "dislike",
        genres: (movie?.genres || []).map((g: any) => g.id),
        timestamp: Date.now(),
      });
      saveLikedMovies(filtered);
      setIsDisliked(true);
      setIsLiked(false);
    }
  }, [tmdbId, isDisliked, movie]);

  const handleBookmark = useCallback(() => {
    const watchlist = getWatchlist();

    if (isBookmarked) {
      saveWatchlist(watchlist.filter((m: any) => m.id !== tmdbId));
      setIsBookmarked(false);
    } else {
      watchlist.push({
        id: tmdbId,
        title: movie?.title || "",
        poster_path: movie?.poster_path || "",
        timestamp: Date.now(),
      });
      saveWatchlist(watchlist);
      setIsBookmarked(true);
    }
  }, [tmdbId, isBookmarked, movie]);

  // Loading state
  if (loading) {
    return (
      <div className="pt-24 pb-20">
        <div className="h-[60vh] skeleton" />
        
        //
        <div className="max-w-6xl mx-auto px-6 md:px-10 -mt-40 relative z-10 space-y-6">
          <div className="skeleton h-10 w-2/3 rounded-lg" />
          <div className="skeleton h-6 w-1/3 rounded-lg" />
          <div className="skeleton h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="pt-24 pb-20 text-center">
        <p className="text-white/30 text-lg">Movie not found.</p>
        <Link href="/search" className="text-gold mt-4 inline-block hover:text-gold-light transition-colors">
          ← Back to search
        </Link>
      </div>
    );
  }

  // Extract data
  const title = movie.title || "";
  const overview = movie.overview || "";
  const tagline = movie.tagline || "";
  const releaseDate = movie.release_date || "";
  const runtime = movie.runtime || 0;
  const voteAverage = movie.vote_average || 0;
  const voteCount = movie.vote_count || 0;
  const budget = movie.budget || 0;
  const revenue = movie.revenue || 0;
  const homepage = movie.homepage || "";
  const genres = movie.genres || [];
  const bgUrl = backdropUrl(movie.backdrop_path);
  const imgUrl = posterUrl(movie.poster_path);

  const credits = movie.credits || {};
  const cast = (credits.cast || []).slice(0, 10);
  const directors = (credits.crew || []).filter((c: any) => c.job === "Director");

  const videos = movie.videos?.results || [];
  const trailer = videos.find((v: any) => v.site === "YouTube" && v.type === "Trailer");

  const providers = movie["watch/providers"]?.results?.US || {};
  const streamProviders = providers.flatrate || [];
  const rentProviders = providers.rent || [];
  const buyProviders = providers.buy || [];
  const providerLink = providers.link || "";

  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <div className="relative">
      {/* Backdrop  */}
      {bgUrl && (
        <div className="relative h-[65vh]">
          <Image src={bgUrl} alt={title} fill className="object-cover" priority unoptimized />
          <div className="hero-gradient absolute inset-0" />
          <div className="hero-side-gradient absolute inset-0" />
        </div>
      )}

      {/* Content  */}
      <div className={`relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-20 ${bgUrl ? "-mt-80" : "pt-24"}`}>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to search
        </Link>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-10">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="w-[220px] md:w-[260px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/[0.06]">
              <Image src={imgUrl} alt={title} width={260} height={390} className="w-full h-full object-cover" unoptimized />
            </div>

            {/* Like / Dislike / Bookmark Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleLike}
                className={`group flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                  isLiked
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "glass-card text-white/50 hover:text-emerald-400 hover:border-emerald-500/20"
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-emerald-400" : ""}`} />
                {isLiked ? "Liked" : "Like"}
              </button>

              <button
                onClick={handleDislike}
                className={`group flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                  isDisliked
                    ? "bg-red-500/15 border-red-500/30 text-red-400"
                    : "glass-card text-white/50 hover:text-red-400 hover:border-red-500/20"
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${isDisliked ? "fill-red-400" : ""}`} />
                {isDisliked ? "Nope" : "Dislike"}
              </button>

              <button
                onClick={handleBookmark}
                className={`group w-12 flex items-center justify-center py-3 rounded-xl border transition-all duration-300 ${
                  isBookmarked
                    ? "bg-gold/15 border-gold/30 text-gold"
                    : "glass-card text-white/50 hover:text-gold hover:border-gold/20"
                }`}
                title={isBookmarked ? "Remove from watchlist" : "Add to watchlist"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 fill-gold" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Like feedback */}
            {isLiked && (
              <p className="text-[11px] text-emerald-400/60 text-center mt-2 animate-fade-in">
                We&apos;ll recommend similar movies for you
              </p>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-5">
            {tagline && (
              <p className="text-gold/70 text-sm font-medium italic">
                &ldquo;{tagline}&rdquo;
              </p>
            )}

            <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">
              {title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
              {voteAverage > 0 && (
                <span className={`flex items-center gap-1.5 font-bold text-base ${ratingColor(voteAverage)}`}>
                  <Star className="w-5 h-5 text-gold fill-gold" />
                  {voteAverage.toFixed(1)}
                  <span className="text-white/20 text-xs font-normal ml-1">
                    ({voteCount.toLocaleString()})
                  </span>
                </span>
              )}
              {year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-white/25" /> {year}
                </span>
              )}
              {runtime > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-white/25" /> {formatRuntime(runtime)}
                </span>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((g: any) => (
                  <Link
                    key={g.id}
                    href={`/genre/${g.name.toLowerCase().replace(/ /g, "-")}?id=${g.id}`}
                    className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-white/50 hover:text-gold hover:border-gold/20 transition-all uppercase tracking-wider"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-white/60 leading-relaxed max-w-2xl">{overview}</p>

            {/* Directors */}
            {directors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/25">Directed by</span>
                {directors.map((d: any, i: number) => (
                  <span key={d.id}>
                    <Link
                      href={`/director/${d.id}`}
                      className="text-sm text-gold hover:text-gold-light font-medium transition-colors"
                    >
                      {d.name}
                    </Link>
                    {i < directors.length - 1 && <span className="text-white/20">, </span>}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {trailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold to-gold-dim text-surface-0 font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  Watch Trailer
                </button>
              )}
              {homepage && (
                <a
                  href={homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl glass-card text-sm font-medium text-white/70 hover:text-white transition-all"
                >
                  <Globe className="w-4 h-4" /> Official Site
                </a>
              )}
              {providerLink && (
                <a
                  href={providerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl glass-card text-sm font-medium text-white/70 hover:text-white transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Where to Watch
                </a>
              )}
            </div>

            {/* Financial */}
            {(budget > 0 || revenue > 0) && (
              <div className="flex gap-8 pt-4 border-t border-white/[0.04]">
                {budget > 0 && (
                  <div>
                    <span className="text-[11px] text-white/20 block uppercase tracking-wider">Budget</span>
                    <span className="text-sm font-semibold text-white/70">{formatCurrency(budget)}</span>
                  </div>
                )}
                {revenue > 0 && (
                  <div>
                    <span className="text-[11px] text-white/20 block uppercase tracking-wider">Revenue</span>
                    <span className="text-sm font-semibold text-white/70">{formatCurrency(revenue)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Watch providers */}
        {(streamProviders.length > 0 || rentProviders.length > 0 || buyProviders.length > 0) && (
          <section className="mt-14">
            <h2 className="text-xl font-bold font-display flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Film className="w-4 h-4 text-gold" />
              </div>
              Where to Watch
            </h2>
            <div className="glass-card rounded-xl p-5 space-y-5">
              {[
                { label: "Stream", providers: streamProviders },
                { label: "Rent", providers: rentProviders },
                { label: "Buy", providers: buyProviders },
              ]
                .filter(({ providers }) => providers.length > 0)
                .map(({ label, providers: provs }) => (
                  <div key={label}>
                    <span className="text-[11px] text-white/25 block mb-2 uppercase tracking-wider font-semibold">
                      {label}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {provs.map((p: any) => (
                        <a
                          key={p.provider_id}
                          href={providerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-gold/15 transition-all"
                        >
                          {p.logo_path && (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                              alt={p.provider_name}
                              width={22}
                              height={22}
                              className="rounded"
                              unoptimized
                            />
                          )}
                          <span className="text-sm text-white/70">{p.provider_name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Cast  */}
        {cast.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold font-display flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Users className="w-4 h-4 text-gold" />
              </div>
              Top Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {cast.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-xl glass-card"
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-3 flex-shrink-0 border border-white/[0.06]">
                    {member.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                        alt={member.name}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/15 text-sm font-display">
                        {member.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate text-white/80">{member.name}</p>
                    <p className="text-[11px] text-white/30 truncate">{member.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RECOMMENDATIONS PORTAL */}

        <div className="section-divider my-16" />

        {/* Personalized*/}
        {likedRecs.length > 0 && (
          <section className="mb-16">
            <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
              {/* Decorative shine */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold/[0.03] to-transparent rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display">
                      Because You <span className="text-gold italic">Liked</span> Similar Movies
                    </h2>
                    <p className="text-xs text-white/30 mt-0.5">
                      Personalized picks based on your {likeCount} liked movie{likeCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {likedRecs.slice(0, 5).map((rec: any) => (
                    <Link
                      key={rec.id}
                      href={`/movie/${rec.id}`}
                      className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-3 border border-white/[0.04] hover:border-gold/20 transition-all duration-300"
                    >
                      <Image
                        src={posterUrl(rec.poster_path, "w500")}
                        alt={rec.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-[12px] font-semibold text-white/90 line-clamp-2">{rec.title}</p>
                        {rec.vote_average > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-gold fill-gold" />
                            <span className="text-[11px] text-gold">{rec.vote_average?.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      {/* Gold hover ring */}
                      <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-gold/15 transition-all pointer-events-none" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TMDB Recommendations for this movie */}
        {recommendations.length > 0 && (
          <section className="mb-16">
            <MovieCarousel
              title="Recommended"
              subtitle={`If you enjoyed ${title}, you'll love these`}
              icon={<Heart className="w-4 h-4 text-rose-400" />}
              movies={recommendations}
            />
          </section>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <section>
            <MovieCarousel
              title="Similar Movies"
              subtitle="Same genre and style"
              icon={<Film className="w-4 h-4 text-gold" />}
              movies={similarMovies}
            />
          </section>
        )}

        {/* If no recs at all, show a CTA */}
        {recommendations.length === 0 && similarMovies.length === 0 && !loading && (
          <section className="text-center py-16">
            <div className="glass-card inline-block rounded-2xl p-8 max-w-md mx-auto">
              <Sparkles className="w-8 h-8 text-gold/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold font-display mb-2">Like movies to get recommendations</h3>
              <p className="text-sm text-white/30 mb-4">
                Hit the like button on movies you enjoy and we&apos;ll show you personalized picks here.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-dim text-surface-0 font-semibold text-sm hover:shadow-lg hover:shadow-gold/20 transition-all"
              >
                Explore Movies
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Trailer modal*/}
      {showTrailer && trailer && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden animate-scale-in border border-white/[0.06] shadow-2xl shadow-black/80"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
              title="Movie Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <button
            onClick={() => setShowTrailer(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
