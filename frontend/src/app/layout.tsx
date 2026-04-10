import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "CineQuest: Discover Your Next Favorite Movie",
  description:
    "Cinematic movie recommendations based on your taste. Explore genres, directors, and discover hidden gems.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Applied precise suppressHydrationWarning hooks disabling structural panics and unnecessary errors universally.
<html lang="en" className="noise" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col relative" suppressHydrationWarning>
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />

        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
