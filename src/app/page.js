'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
  Leaf,
  Sparkles,
  BarChart3,
  Trophy,
  ArrowRight,
  TrendingDown,
  Globe,
  Flame,
  Zap,
  Users,
  MessageSquare,
  Target,
  TreePine
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Hero Section */}
      <section className="text-center max-w-5xl mx-auto mt-8 md:mt-16 space-y-8 relative animate-slide-up">

        {/* Floating Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto shadow-lg shadow-emerald-500/5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Meet Your AI Sustainability Co-pilot</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Calculate, Track, and <br />
          <span className="text-gradient-emerald-cyan">Reduce Your Carbon Footprint</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
          Small steps lead to massive planetary changes. Use personalized AI insights, log daily eco challenges, and monitor your emissions journey.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <Link
            href="/calculator"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all hover:-translate-y-1 active:translate-y-0 text-base"
          >
            <span>Calculate Footprint</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href={user ? "/dashboard" : "/login?mode=login"}
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold glass-panel text-white hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 active:translate-y-0 text-base"
          >
            <span>{user ? "View Dashboard" : "Sign In to Track"}</span>
          </Link>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="w-full max-w-6xl mx-auto mt-24 sm:mt-32 grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in">
        <div className="glass-panel p-7 rounded-2xl card-hover-effect flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-400 shadow-lg shadow-cyan-500/5">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="stat-value text-white">16,000 kg</div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-widest">US Yearly Average</div>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">Carbon footprint per capita in the United States, roughly 3x the global average.</p>
          </div>
        </div>

        <div className="glass-panel p-7 rounded-2xl card-hover-effect flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 shadow-lg shadow-emerald-500/5">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <div className="stat-value text-white">2,000 kg</div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-widest">Climate Goal Target</div>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">Yearly budget per person needed to limit global warming below 2 degrees Celsius.</p>
          </div>
        </div>

        <div className="glass-panel p-7 rounded-2xl card-hover-effect flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-400 shadow-lg shadow-amber-500/5">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="stat-value text-white">100% Free</div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-widest">Community Project</div>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">Open-source tools to make green lifestyles accessible to everyone.</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-6xl mx-auto mt-28 sm:mt-36 space-y-14">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Everything You Need to Live Sustainably</h2>
          <p className="text-base text-gray-500 max-w-2xl mx-auto font-light">
            We combine dynamic calculation models with modern visualization tools and custom AI to support your green journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="glass-panel p-7 rounded-2xl card-hover-effect flex flex-col gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/5">
              <Leaf className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Carbon Calculator</h3>
            <p className="text-sm text-gray-500 leading-relaxed flex-grow">
              Input travel habits, home utilities, food choices, waste habits, and shopping expenses. Instantly calculate emission breakdowns.
            </p>
            <Link href="/calculator" className="text-sm font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all mt-2">
              <span>Try Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-panel p-7 rounded-2xl card-hover-effect flex flex-col gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/5">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">AI Advisor</h3>
            <p className="text-sm text-gray-500 leading-relaxed flex-grow">
              Chat with a dedicated sustainability bot. Receive personalized actions built on your specific input metrics and scores.
            </p>
            <Link href="/chatbot" className="text-sm font-semibold text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all mt-2">
              <span>Chat EcoBot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-panel p-7 rounded-2xl card-hover-effect flex flex-col gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/5">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Emission Analytics</h3>
            <p className="text-sm text-gray-500 leading-relaxed flex-grow">
              Visualize monthly trends, category percentages, and goal progression using fluid, beautiful Recharts diagrams.
            </p>
            <Link href="/dashboard" className="text-sm font-semibold text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all mt-2">
              <span>View Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-panel p-7 rounded-2xl card-hover-effect flex flex-col gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/5">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Daily Challenges</h3>
            <p className="text-sm text-gray-500 leading-relaxed flex-grow">
              Participate in gamified eco habits like avoiding plastic, composting, and cold wash cycles. Log completions to offset logs.
            </p>
            <Link href="/challenges" className="text-sm font-semibold text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all mt-2">
              <span>Browse Habits</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Call to Action Box */}
      <section className="w-full max-w-6xl mx-auto mt-24 sm:mt-32 mb-8 p-8 sm:p-12 rounded-3xl relative overflow-hidden border border-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 to-cyan-500/8 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/3 to-transparent pointer-events-none" />
        <div className="space-y-3 relative text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Ready to join the movement?</h3>
          <p className="text-sm text-gray-500 max-w-xl font-light leading-relaxed">
            Create an account in less than 30 seconds. Start monitoring your footprint, saving logs, and unlocking personalized AI suggestions today.
          </p>
        </div>
        <Link
          href="/login?mode=signup"
          className="relative w-full md:w-auto px-8 py-4 rounded-2xl font-semibold gradient-green-btn text-white shadow-lg text-center transition-all hover:scale-105 active:scale-100"
        >
          Sign Up Free
        </Link>
      </section>
    </div>
  );
}
