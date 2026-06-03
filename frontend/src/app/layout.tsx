import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeadPulse | Real-Time Lead Qualification",
  description: "Identify, score, and prioritize your high-value sales prospects using dynamic scoring engines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-sans">
        {/* Glassmorphism Header */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                L
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Lead<span className="text-indigo-400 font-extrabold">Pulse</span>
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link 
                href="/" 
                className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/40 rounded-lg transition-colors duration-150"
              >
                Dashboard
              </Link>
              <Link 
                href="/leads" 
                className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/40 rounded-lg transition-colors duration-150"
              >
                Leads Hub
              </Link>
              <Link 
                href="/rules" 
                className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/40 rounded-lg transition-colors duration-150"
              >
                Rules Engine
              </Link>
              <Link 
                href="/simulator" 
                className="ml-2 px-3.5 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 rounded-lg transition-all duration-150"
              >
                Playground
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        
        <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4">
            &copy; 2026 LeadPulse Technologies. All rights reserved. Pair programmed with Antigravity.
          </div>
        </footer>
      </body>
    </html>
  );
}
