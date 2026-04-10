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