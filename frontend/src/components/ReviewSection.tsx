"use client";

import { useState, useEffect } from "react";
import { Star, Send, User, MessageSquare } from "lucide-react";
import { moviesAPI } from "@/lib/api";
import type { Review } from "@/types/movie";
import { useAuth } from "@/lib/AuthContext";

interface ReviewSectionProps {
  movieId: number;
}

export default function ReviewSection({ movieId }: ReviewSectionProps) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (movieId) {
      fetchReviews();
    }
  }, [movieId]);

  const fetchReviews = async () => {
    try {
      const data = await moviesAPI.getReviews(movieId);
      setReviews(data.results || []);
    } catch (err) {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    
    setSubmitting(true);
    setError(null);
    try {
      const newReview = await moviesAPI.submitReview(movieId, rating, text);
      setReviews([newReview, ...reviews]);
      setText("");
      setRating(5);
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="animate-pulse h-32 bg-surface-2 rounded-xl mt-14" />;
  }

  return (
    <section className="mt-14">
      <h2 className="text-xl font-bold font-display flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-gold" />
        </div>
        User Reviews
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 mb-8 border border-white/[0.08]">
          <h3 className="text-sm font-semibold mb-4 text-white/80">Write a Review</h3>
          
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= rating ? "text-gold fill-gold" : "text-white/20"
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts about this movie..."
            className="w-full bg-surface-3 border border-white/5 rounded-xl p-4 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/30 transition-all mb-4 min-h-[100px]"
            required
          />

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-gold to-gold-dim text-surface-0 font-semibold text-sm hover:shadow-lg hover:bg-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Posting..." : "Post Review"}
          </button>
        </form>
      ) : (
        <div className="glass-card rounded-2xl p-6 mb-8 border border-white/[0.08] text-center">
          <p className="text-white/50 text-sm font-medium">Log in to interact and leave a review!</p>
        </div>
      )}
      
    </section>
  );
}