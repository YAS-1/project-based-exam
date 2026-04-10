"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, TrendingUp, Heart, Eye, Bookmark, Star } from "lucide-react";
import { posterUrl } from "@/lib/utils";
import type { MovieCompact } from "@/types/movie";

interface PersonalizedSectionProps {
  movies: MovieCompact[];
}

export default function PersonalizedSection({ movies }: PersonalizedSectionProps) {
  const featured = movies.slice(0, 4);
  const secondary = movies.slice(4, 10);

  return (
    <section className="px-6 md:px-10 lg:px-20">
      {/* Main CTA Card */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 md:p-10 lg:p-14">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-gold/[0.04] to-transparent rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-accent/[0.03] to-transparent rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        
        {/* Top shine line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
          {/* Text content */}
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/15">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gold">
                Personalized For You
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display leading-tight">
              Discover Movies<br />
              <span className="text-gold italic">Tailored to Your Taste</span>
            </h2>

            <p className="text-white/40 leading-relaxed max-w-lg">
              Our recommendation engine learns from what you watch, like, and search for.
              The more you explore, the smarter your suggestions become.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Eye, label: "Track what you watch" },
                { icon: Heart, label: "Like your favorites" },
                { icon: TrendingUp, label: "Get smart picks" },
                { icon: Bookmark, label: "Build your watchlist" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                >
                  <Icon className="w-3.5 h-3.5 text-gold/60" />
                  <span className="text-[12px] text-white/50">{label}</span>
                </div>
              ))}
            </div>

            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-gold to-gold-dim text-surface-0 font-semibold text-sm hover:shadow-lg hover:shadow-gold/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] group"
            >
              Start Exploring
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Right:stacked movie posters */}
          <div className="relative w-full lg:w-auto flex-shrink-0">
            <div className="flex gap-3 justify-center lg:justify-end">
              {featured.map((movie, i) => {
                const pUrl = posterUrl(
                  movie.poster_url || (movie as any).poster_path,
                  "w500"
                );
                return (
                  <Link
                    key={movie.id || movie.tmdb_id}
                    href={`/movie/${movie.tmdb_id || movie.id}`}
                    className="relative group/poster"
                    style={{
                      transform: `rotate(${(i - 1.5) * 3}deg)`,
                      zIndex: i === 1 || i === 2 ? 2 : 1,
                    }}
                  >
                    // There was an invalid CSS relative positioning causing an issue with the component rendering.
                    <div className="relative w-[110px] md:w-[130px] h-[165px] md:h-[195px] rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.08] transition-all duration-400 group-hover/poster:scale-105 group-hover/poster:border-gold/20 group-hover/poster:shadow-gold/10">
                      <Image
                        src={pUrl}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {/* Rating overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-gold fill-gold" />
                          <span className="text-[10px] font-bold text-gold">
                            {movie.vote_average?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* "Curated picks" label underneath */}
            <p className="text-center text-[11px] text-white/20 mt-4 tracking-wider uppercase">
              Curated movie picks
            </p>
          </div>
        </div>
      </div>

      {/* Quick picks row below */}
      {secondary.length > 0 && (
        <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3">
          {secondary.map((movie) => {
            const pUrl = posterUrl(
              movie.poster_url || (movie as any).poster_path,
              "w185"
            );
            return (
              <Link
                key={movie.id || movie.tmdb_id}
                href={`/movie/${movie.tmdb_id || movie.id}`}
                className="group relative rounded-lg overflow-hidden aspect-[2/3] bg-surface-2"
              >
                <Image
                  src={pUrl}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-[10px] font-medium text-white/90 line-clamp-1">{movie.title}</p>
                </div>
                {/* Gold border on hover */}
                <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-gold/20 transition-colors duration-300 pointer-events-none" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
