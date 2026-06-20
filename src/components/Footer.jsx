'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Leaf, Database, Sparkles, ExternalLink, Trophy } from 'lucide-react';
import { getDbConnectionInfo } from '@/lib/db';

export default function Footer() {
  const { isMock } = useAuth();
  const dbInfo = getDbConnectionInfo();

  return (
    <footer className="w-full glass-panel-strong border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          <div className="md:col-span-4 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-emerald-400">
                <Leaf className="w-5 h-5 fill-emerald-400/20" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  EcoTrack <span className="text-gradient-emerald-cyan">AI</span>
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Empowering individuals to understand, track, and reduce their carbon emissions through AI-powered analytics and daily eco-challenges.
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col items-start gap-2 px-4 py-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Integration Status</h4>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Database
                </span>
                <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-medium ${
                  dbInfo.isCloud
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}>
                  {dbInfo.provider}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Engine
                </span>
                <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-medium ${
                  process.env.NEXT_PUBLIC_OPENAI_API_KEY || !isMock
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                }`}>
                  {process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'OpenAI GPT-4o' : 'EcoTrack Expert'}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-start gap-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Resources</h4>
            <div className="flex flex-col gap-2">
              <Link href="/calculator" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" /> Carbon Calculator
              </Link>
              <Link href="/challenges" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Daily Challenges
              </Link>
              <a
                href="https://www.epa.gov/ghgemissions/household-carbon-footprint-calculator"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> EPA Footprint Data
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} EcoTrack AI. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for a sustainable future.</p>
        </div>
      </div>
    </footer>
  );
}
