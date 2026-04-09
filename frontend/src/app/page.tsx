"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Star, Clapperboard, Flame, Crown } from "lucide-react";
import MovieCarousel from "@/components/MovieCarousel";
import GenreGrid from "@/components/GenreGrid";
import HeroSection from "@/components/HeroSection";
import PersonalizedSection from "@/components/PersonalizedSection";
import MoodTeaser from "@/components/MoodTeaser";
import { moviesAPI } from "@/lib/api";
import type { MovieCompact } from "@/types/movie";

export default function HomePage() {
  const [trending, setTrending] = useState<MovieCompact[]>([]); // Fixed the trending movies schema 
  const [nowPlaying, setNowPlaying] = useState<MovieCompact[]>([]);
  const [topRated, setTopRated] = useState<MovieCompact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendRes, npRes, trRes] = await Promise.allSettled([
          moviesAPI.trending(),
          moviesAPI.nowPlaying(),
          moviesAPI.topRated(),
        ]);

        if (trendRes.status === "fulfilled") setTrending(trendRes.value);
        if (npRes.status === "fulfilled") setNowPlaying(npRes.value.results);
        if (trRes.status === "fulfilled") setTopRated(trRes.value.results);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="relative">
      <HeroSection movies={trending} />

      <div className="relative z-10 -mt-28 space-y-20 pb-24">

        {/* Trending this week */}
        <MovieCarousel
          title="Trending This Week"
          subtitle="The most talked about movies right now"
          icon={<Flame className="w-4 h-4 text-orange-400" />}
          movies={trending}
          loading={loading}
          href="/search?sort=trending"
        />

        <div className="section-divider mx-6 md:mx-10 lg:mx-20" />

        {/* Genre grid */}
        <section className="px-6 md:px-10 lg:px-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Clapperboard className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display text-white/95">
                Browse by Genre
              </h2>
              <p className="text-xs text-white/30 mt-0.5">
                Find your next favorite film by mood or category
              </p>
            </div>
          </div>
          <GenreGrid />
        </section>

        <div className="section-divider mx-6 md:mx-10 lg:mx-20" />

        {/* Mood picker teaser */}
        <MoodTeaser />

        <div className="section-divider mx-6 md:mx-10 lg:mx-20" />

        {/* Personalized recommendations */}
        <PersonalizedSection movies={topRated} />

        <div className="section-divider mx-6 md:mx-10 lg:mx-20" />

        {/* Now in theatres */}
        <MovieCarousel
          title="Now in Theatres"
          subtitle="Currently showing on the big screen"
          icon={<Star className="w-4 h-4 text-yellow-400" />}
          movies={nowPlaying}
          loading={loading}
          href="/search?sort=now_playing"
        />

        <div className="section-divider mx-6 md:mx-10 lg:mx-20" />

        {/* Top rated */}
        <MovieCarousel
          title="Highest Rated of All Time"
          subtitle="The greatest films ever made, by audience score"
          icon={<Crown className="w-4 h-4 text-gold" />}
          movies={topRated}
          loading={loading}
          href="/search?sort=top_rated"
        />
      </div>
    </div>
  );
}
