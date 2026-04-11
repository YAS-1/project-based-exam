"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import MovieCard, { MovieCardSkeleton } from "@/components/MovieCard";
import type { MovieCompact } from "@/types/movie";



interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  movies: MovieCompact[];
  loading?: boolean;
  href?: string;
}

export default function MovieCarousel({
  title,
  subtitle,
  icon,
  movies,
  loading = false,
  href,
}: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -420 : 420;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section className="relative">
      {/* Header */}
      <div className="flex items-end justify-between px-6 md:px-10 lg:px-20 mb-6">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white/95">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:border-gold/20 transition-all group"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-gold transition-colors" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:border-gold/20 transition-all group"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-gold transition-colors" />
          </button>
          {href && (
            <Link
              href={href}
              className="ml-2 flex items-center gap-1 text-xs text-gold/60 hover:text-gold transition-colors group"
            >
              View all
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      {/* Carousel */}
      <div className="scroll-mask">
        <div
          ref={scrollRef}
          className="scroll-x flex gap-4 px-6 md:px-10 lg:px-20 pb-4"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))
            : movies.map((movie, i) => (
                <MovieCard
                  key={movie.id || movie.tmdb_id}
                  movie={movie}
                  index={i}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
