'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Leaf, Menu, X, LogOut, User, LayoutDashboard, Calculator, MessageSquare, Trophy, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, signOut, isMock } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, protected: true },
    { name: 'Calculator', path: '/calculator', icon: Calculator, protected: false },
    { name: 'AI Assistant', path: '/chatbot', icon: MessageSquare, protected: true },
    { name: 'Challenges', path: '/challenges', icon: Trophy, protected: true },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel-strong border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-emerald-400 group-hover:from-emerald-400/30 group-hover:to-cyan-400/30 group-hover:scale-110 transition-all duration-300">
                <Leaf className="w-5 h-5 fill-emerald-400/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors leading-none">
                  EcoTrack <span className="text-gradient-emerald-cyan">AI</span>
                </span>
                <span className="text-[9px] text-gray-500 font-medium tracking-wider uppercase leading-none mt-0.5">Carbon Intelligence</span>
              </div>
            </Link>

            {isMock && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-fade-in">
                <ShieldAlert className="w-3 h-3" />
                <span>Sandbox Mode</span>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.protected && !user) return null;

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 shadow-sm shadow-emerald-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                      {user.displayName ? user.displayName[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors leading-none">
                        {user.displayName}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono leading-none mt-0.5">
                        Goal: {user.monthlyGoal} kg CO₂
                      </span>
                    </div>
                  </Link>
                </div>
                <button
                  onClick={signOut}
                  aria-label="Sign out"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login?mode=login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            {isMock && (
              <div className="flex items-center p-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-panel-strong border-t border-white/5 animate-slide-down">
          <div className="px-3 pt-3 pb-4 space-y-1">
            {navItems.map((item) => {
              if (item.protected && !user) return null;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {user ? (
              <div className="pt-4 pb-1 border-t border-white/5 mt-4 space-y-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg">
                    {user.displayName ? user.displayName[0].toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">{user.displayName}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-gray-400 flex justify-between">
                  <span>Carbon Budget</span>
                  <span className="font-bold text-emerald-400">{user.monthlyGoal} kg CO₂/mo</span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 pb-1 border-t border-white/5 mt-4 space-y-2 px-1">
                <Link
                  href="/login?mode=login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-3 rounded-xl text-base font-medium text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-3 rounded-xl text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
