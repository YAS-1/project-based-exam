/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, Share2, Eye, UserPlus, Film, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { usersAPI, recommendationsAPI } from "@/lib/api";
import { User } from "@/types/movie";

export default function MovieSharePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [sharedWatchlists, setSharedWatchlists] = useState<any[]>([]);
  const [loadingShared, setLoadingShared] = useState(true);
  
  const [shareSuccess, setShareSuccess] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSharedWatchlists();
    }
  }, [isAuthenticated]);

  const fetchSharedWatchlists = async () => {
    try {
      setLoadingShared(true);
      const data = await recommendationsAPI.getSharedWatchlists();
      setSharedWatchlists(data);
    } catch (error) {
      console.error("Failed to load shared watchlists", error);
    } finally {
      setLoadingShared(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setShareSuccess(null);
    try {
      const results = await usersAPI.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("User search failed", error);
    } finally {
      setSearching(false);
    }
  };

  const handleShareWatchlist = async (userId: number) => {
    try {
      await recommendationsAPI.shareWatchlist(userId);
      setShareSuccess(userId);
      setTimeout(() => setShareSuccess(null), 3000);
    } catch (error) {
      console.error("Failed to share watchlist", error);
      alert("Could not share watchlist. Perhaps you already shared it?");
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-[1440px] mx-auto text-center h-[60vh] flex flex-col justify-center items-center">
        <Users className="w-16 h-16 text-gold/30 mb-4" />
        <h1 className="text-3xl font-bold font-display mb-3">Movie Share</h1>
        <p className="text-white/40">Please sign in to share watchlists with your friends.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-6 md:px-10 lg:px-20 max-w-[1440px] mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-lg shadow-gold/10">
          <Users className="w-5 h-5 text-surface-0" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display">
            Movie <span className="text-gold italic">Share</span>
          </h1>
          <p className="text-sm text-white/40">
            Share your watchlist with friends and discover what they&apos;re planning to watch.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Search & Share */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-bold font-display flex items-center gap-2 mb-6">
              <UserPlus className="w-5 h-5 text-gold" /> Find Friends
            </h2>
            
            <form onSubmit={handleSearch} className="relative mb-6">
              <input
                type="text"
                placeholder="Search users by username..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <button 
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold text-surface-0 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-gold-dim transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </form>

            <div className="space-y-3">
              {searching ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                        <span className="font-bold text-white/70">{user.username[0].toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-white/90">{user.username}</span>
                    </div>
                    {shareSuccess === user.id ? (
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-lg text-sm">
                        <CheckCircle2 className="w-4 h-4" /> Shared!
                      </div>
                    ) : (
                      <button
                        onClick={() => handleShareWatchlist(user.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors text-white/80 w-full sm:w-auto justify-center"
                      >
                        <Share2 className="w-4 h-4" /> Share My Watchlist
                      </button>
                    )}
                  </div>
                ))
              ) : searchQuery && !searching ? (
                <div className="text-center py-8 text-white/30 text-sm">
                  No users found matching &quot;{searchQuery}&quot;
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Column: Shared with me */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold font-display flex items-center gap-2 mb-6">
              <Film className="w-5 h-5 text-gold" /> Shared With Me
            </h2>

            {loadingShared ? (
              <div className="flex-1 flex justify-center items-center py-20">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sharedWatchlists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sharedWatchlists.map((share) => (
                  <Link 
                    key={share.id}
                    href={`/movie-share/${share.owner}`}
                    className="group relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.05] p-5 hover:border-gold/30 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Film className="w-12 h-12" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-amber-600/20 flex items-center justify-center border border-gold/20 mb-3">
                        <span className="font-bold text-gold">{share.owner_username[0].toUpperCase()}</span>
                      </div>
                      <h3 className="font-medium text-white/90 mb-1">{share.owner_username}&apos;s List</h3>
                      <p className="text-xs text-white/40 mt-auto pt-4 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> View Watchlist
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center py-16 text-center">
                <Share2 className="w-12 h-12 text-white/10 mb-4" />
                <p className="text-white/40 text-sm max-w-[250px]">
                  No one has shared their watchlist with you yet. Invite friends to share!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
