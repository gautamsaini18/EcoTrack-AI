'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { dbGetCompletedChallenges, dbCompleteChallenge } from '@/lib/db';
import Link from 'next/link';
import {
  Trophy,
  CheckCircle2,
  Leaf,
  Car,
  Zap,
  Utensils,
  Trash2,
  ShoppingBag,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Activity,
  Smile,
  Target
} from 'lucide-react';

export default function Challenges() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [completedList, setCompletedList] = useState([]);
  const [loadingCompleted, setLoadingCompleted] = useState(true);
  const [activeTab, setActiveTab] = useState('travel');
  const [actionMessage, setActionMessage] = useState('');

  const dailyChallenges = [
    {
      id: 'no_plastic',
      title: 'No Single-Use Plastic',
      desc: 'Avoid buying bottled water, plastic straws, or grocery carrier bags today.',
      co2Saved: 1.2,
      points: 15,
      icon: Trash2,
      color: 'from-rose-400/20 to-rose-400/5 text-rose-400'
    },
    {
      id: 'active_transit',
      title: 'Active Commuting',
      desc: 'Walk, cycle, run, or take a bus/train instead of riding solo in a car today.',
      co2Saved: 3.5,
      points: 35,
      icon: Car,
      color: 'from-emerald-400/20 to-emerald-400/5 text-emerald-400'
    },
    {
      id: 'cold_wash',
      title: 'Cold Water Laundry',
      desc: 'Run your washing machine on cold cycle instead of hot water to save electricity.',
      co2Saved: 0.8,
      points: 10,
      icon: Zap,
      color: 'from-cyan-400/20 to-cyan-400/5 text-cyan-400'
    },
    {
      id: 'plant_based',
      title: 'Meatless Dinner',
      desc: 'Cook a 100% plant-based or vegetarian dinner tonight.',
      co2Saved: 2.1,
      points: 25,
      icon: Utensils,
      color: 'from-indigo-400/20 to-indigo-400/5 text-indigo-400'
    },
    {
      id: 'unplug_vampire',
      title: 'Vampire Power Audit',
      desc: 'Unplug all unused chargers, monitors, and standby systems before bed.',
      co2Saved: 0.4,
      points: 5,
      icon: Zap,
      color: 'from-amber-400/20 to-amber-400/5 text-amber-400'
    }
  ];

  const savingTips = {
    travel: [
      { title: 'Maintain Tire Inflation', text: 'Keeping car tires inflated to the recommended pressure improves gas mileage by up to 3%.' },
      { title: 'Drive Smoothly', text: 'Aggressive acceleration and braking wastes fuel. Steady driving cuts emissions by 15-30%.' },
      { title: 'Consolidate Errands', text: 'Combine multiple short trips into one. Cold engines consume twice as much fuel.' }
    ],
    energy: [
      { title: 'Dial Down Thermostat', text: 'Lowering the thermostat by just 1°C in winter can reduce bills and carbon by up to 10%.' },
      { title: 'Seal Air Leaks', text: 'Use draft guards on doors and weatherstripping on windows to block energy losses.' },
      { title: 'Wash Clothes at 30°C', text: 'Washing laundry at lower temperatures saves up to 38% energy per cycle.' }
    ],
    food: [
      { title: 'Meatless Mondays', text: 'Swapping beef for beans just one day a week saves roughly 8kg of CO₂ per meal.' },
      { title: 'Buy Loose Produce', text: 'Buy unpackaged fruits and vegetables to reduce plastic and manufacturing footprint.' },
      { title: 'Compost Scraps', text: 'Composting food waste avoids landfill methane emissions and returns nutrients to soil.' }
    ],
    waste: [
      { title: 'Recycle Guidelines', text: 'Recycling aluminum cans consumes 95% less energy than extracting virgin materials.' },
      { title: 'Choose E-Bills', text: 'Opt for paperless billing and digital statements to lower paper mill waste impacts.' },
      { title: 'Glass Containers', text: 'Switch to glass storage jars instead of disposable zipper bags for leftovers.' }
    ],
    shopping: [
      { title: 'Buy Second Hand', text: 'Purchasing pre-owned clothes, furniture, or books saves materials and transport carbon.' },
      { title: 'Avoid Fast Fashion', text: 'Durable quality clothing lasts longer, reducing total consumption cycles.' },
      { title: 'Share & Lease', text: 'Rent specialized power tools or garden equipment instead of buying seldom-used items.' }
    ]
  };

  const fetchCompletedChallenges = useCallback(async () => {
    if (!user) return;
    setLoadingCompleted(true);
    try {
      const data = await dbGetCompletedChallenges(user.uid);
      setCompletedList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCompleted(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchCompletedChallenges();
      }
    }
  }, [user, loading, router, fetchCompletedChallenges]);

  const handleCompleteChallenge = async (challenge) => {
    const today = new Date().toDateString();
    const alreadyDone = completedList.some(
      c => c.challengeId === challenge.id && new Date(c.completedAt).toDateString() === today
    );

    if (alreadyDone) {
      setActionMessage(`You already completed "${challenge.title}" today!`);
      clearMessage();
      return;
    }

    try {
      const result = await dbCompleteChallenge(
        user.uid,
        challenge.id,
        challenge.title,
        challenge.co2Saved
      );

      setCompletedList(prev => [...prev, result]);
      setActionMessage(`Completed "${challenge.title}" — saved ${challenge.co2Saved} kg CO₂ (+${challenge.points} pts)`);
      clearMessage();
    } catch (e) {
      console.error(e);
    }
  };

  const clearMessage = () => {
    setTimeout(() => {
      setActionMessage('');
    }, 4500);
  };

  const totalCompleted = completedList.length;
  const totalCarbonSaved = completedList.reduce((sum, item) => sum + item.carbonSaved, 0).toFixed(1);
  const totalPoints = completedList.length * 15;

  if (loading || loadingCompleted) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" />
          </div>
          <span className="text-xs text-gray-500 font-light tracking-widest uppercase">Loading challenges...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const today = new Date().toDateString();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8 animate-fade-in">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Eco Challenges <span className="text-gradient-emerald-cyan">& Tips</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-light">
            Take small daily actions, log completions, earn points, and expand your sustainable knowledge.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 card-hover-effect">
            <Trophy className="w-5 h-5 text-emerald-400 fill-emerald-400/10" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">Points</div>
              <div className="text-sm font-extrabold text-white font-mono mt-1">{totalPoints}</div>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2.5 card-hover-effect">
            <Leaf className="w-5 h-5 text-cyan-400 fill-cyan-400/10" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">CO₂ Saved</div>
              <div className="text-sm font-extrabold text-white font-mono mt-1">{totalCarbonSaved} kg</div>
            </div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold animate-slide-up text-center max-w-2xl mx-auto" role="alert" aria-live="polite">
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <section className="space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">Daily Eco Tasks</h3>
          </div>

          <div className="space-y-4">
            {dailyChallenges.map((challenge) => {
              const isChecked = completedList.some(
                c => c.challengeId === challenge.id && new Date(c.completedAt).toDateString() === today
              );

              return (
                <div
                  key={challenge.id}
                  className={`p-5 rounded-2xl glass-panel card-hover-effect flex gap-4 items-start border transition-all duration-300 ${
                    isChecked
                      ? 'border-emerald-500/30 bg-emerald-500/5 opacity-80'
                      : 'hover:border-white/10'
                  }`}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${challenge.color} shadow-lg`}>
                    <challenge.icon className="w-5 h-5" />
                  </div>

                  <div className="flex-grow space-y-1.5">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={`text-sm font-bold leading-tight ${isChecked ? 'line-through text-gray-500' : 'text-white'}`}>
                        {challenge.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-white/5 text-emerald-400 border border-white/5 font-mono">
                        -{challenge.co2Saved}kg
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-normal font-light">
                      {challenge.desc}
                    </p>

                    <div className="pt-2 flex justify-between items-center w-full">
                      <span className="text-[10px] text-gray-600 font-mono">
                        +{challenge.points} pts
                      </span>

                      <button
                        onClick={() => handleCompleteChallenge(challenge)}
                        disabled={isChecked}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 cursor-default'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                      >
                        {isChecked ? 'Done Today' : 'Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">Sustainability Library</h3>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-6 card-hover-effect">

            <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-4">
              {[
                { id: 'travel', label: 'Travel' },
                { id: 'energy', label: 'Energy' },
                { id: 'food', label: 'Diet' },
                { id: 'waste', label: 'Waste' },
                { id: 'shopping', label: 'Shopping' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-transparent bg-white/[0.02] text-gray-500 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4 animate-fade-in">
              {savingTips[activeTab].map((tip, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tip.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/15 flex items-center justify-between gap-4 card-hover-effect">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-cyan-400" /> Need personalized plans?
                </h4>
                <p className="text-[11px] text-gray-500">Ask our AI coach to tailor these tips to your profile.</p>
              </div>
              <Link
                href="/chatbot"
                className="px-3.5 py-2 rounded-xl text-[10px] font-bold gradient-cyan-btn text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Chat Coach
              </Link>
            </div>

          </div>
        </section>

      </div>

    </div>
  );
}
