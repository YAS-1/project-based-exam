"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Menu, X, Film, Compass, Star, Clapperboard,
  Sparkles, BarChart3, User, LogOut, LogIn, ArrowLeftRight, Users
} from "lucide-react";
import SearchModal from "@/components/SearchModal";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: "/search", label: "Discover", icon: Compass },
    { href: "/genre", label: "Genres", icon: Clapperboard },
    { href: "/mood", label: "Mood", icon: Sparkles },
    { href: "/compare", label: "Compare", icon: ArrowLeftRight },
    { href: "/search?sort=top_rated", label: "Top Rated", icon: Star },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-lg shadow-gold/10 group-hover:shadow-gold/20 transition-shadow">
                <Film className="w-[18px] h-[18px] text-surface-0" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[17px] font-bold font-display tracking-tight">
                  Cine<span className="text-gold">Quest</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/25 font-body mt-0.5">
                  Cinema Discovery
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href + label}
                  href={href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                  <Link
                    href="/movie-share"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Movie Share
                  </Link>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="group flex items-center gap-2 h-9 px-3.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-gold/20 hover:bg-white/[0.06] transition-all duration-200"
              >
                <Search className="w-3.5 h-3.5 text-white/40 group-hover:text-gold transition-colors" />
                <span className="hidden sm:inline text-xs text-white/30">Search...</span>
                <kbd className="hidden lg:inline text-[10px] text-white/15 bg-white/5 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
              </button>

              {/* Auth / User */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 h-9 px-3 rounded-lg bg-gold/10 border border-gold/15 hover:border-gold/25 transition-all"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center">
                      <span className="text-[10px] font-bold text-surface-0">
                        {user?.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-xs text-gold font-medium">
                      {user?.username}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-12 w-48 glass-card rounded-xl p-2 z-50 animate-scale-in shadow-xl shadow-black/40">
                        <div className="h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent mb-1" />
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <BarChart3 className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-r from-gold to-gold-dim text-surface-0 text-xs font-semibold hover:shadow-lg hover:shadow-gold/15 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Mobile menu */}
              <button
                className="md:hidden w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 px-6 py-4 space-y-1 animate-fade-in">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href + label}
                href={href}
                className="block text-sm text-white/50 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
              <Link
                href="/dashboard"
                className="block text-sm text-white/50 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
                <Link
                  href="/movie-share"
                  className="block text-sm text-white/50 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  Movie Share
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
