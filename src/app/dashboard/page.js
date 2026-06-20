'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { dbGetLogs, dbGetUserProfile } from '@/lib/db';
import DashboardCharts from '@/components/DashboardCharts';
import {
  Leaf,
  Plus,
  History,
  Sparkles,
  Award,
  TrendingDown,
  TreePine,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [displayUnit, setDisplayUnit] = useState('co2');

  const fetchData = async () => {
    setLogsLoading(true);
    try {
      const userLogs = await dbGetLogs(user.uid);
      setLogs(userLogs);
    } catch (e) {
      console.error("Failed to load logs:", e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchData();
      }
    }
  }, [user, loading, router, fetchData]);

  if (loading || (logsLoading && logs.length === 0)) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" />
          </div>
          <span className="text-xs text-gray-500 font-light tracking-widest uppercase">Loading eco analytics...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const latestLog = logs[0] || null;
  const userGoal = user.monthlyGoal || 400;

  const previousLog = logs[1] || null;
  let percentChange = 0;
  if (latestLog && previousLog) {
    percentChange = Math.round(((latestLog.total - previousLog.total) / previousLog.total) * 100);
  }

  const monthlyEmissions = latestLog ? latestLog.total : 0;
  const yearlyEmissions = Math.round(monthlyEmissions * 12);
  const treesNeeded = latestLog ? latestLog.treesEquivalent : 0;

  const budgetPercentage = Math.min(Math.round((monthlyEmissions / userGoal) * 100), 100);
  const isOverBudget = monthlyEmissions > userGoal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8 animate-fade-in">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, <span className="text-gradient-emerald-cyan">{user.displayName}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-light">
            Monitor emissions metrics, log calculations, and trace carbon reduction progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDisplayUnit(displayUnit === 'co2' ? 'trees' : 'co2')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-panel text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            {displayUnit === 'co2' ? '🌲 Tree Offset' : '💨 kg CO₂'}
          </button>

          <Link
            href="/calculator"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold gradient-green-btn text-white shadow-lg shadow-emerald-500/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Log</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="glass-panel p-6 rounded-2xl card-hover-effect flex flex-col justify-between h-44">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Monthly Footprint</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div>
            {latestLog ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {displayUnit === 'co2' ? latestLog.total : latestLog.treesEquivalent}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {displayUnit === 'co2' ? 'kg CO₂' : 'trees'}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-600 italic">No entry yet</span>
            )}

            {latestLog && previousLog && (
              <div className={`text-xs mt-2.5 flex items-center gap-1.5 font-semibold ${
                percentChange <= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{percentChange <= 0 ? '↓' : '↑'} {Math.abs(percentChange)}% vs previous</span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl card-hover-effect flex flex-col justify-between h-44">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Goal Alignment</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-gray-500 font-mono">
              <span>Budget</span>
              <span>{budgetPercentage}% used</span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isOverBudget ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              {latestLog ? (
                isOverBudget
                  ? `${Math.round(latestLog.total - userGoal)} kg CO₂ over budget`
                  : `${Math.round(userGoal - latestLog.total)} kg CO₂ remaining`
              ) : (
                `Target: ${userGoal} kg CO₂/mo`
              )}
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl card-hover-effect flex flex-col justify-between h-44">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Forest Absorption</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TreePine className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white">{treesNeeded}</span>
              <span className="text-xs text-gray-500 font-medium">trees/yr</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
              Mature trees needed to offset your yearly emissions
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl card-hover-effect flex flex-col justify-between h-44">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">AI Coach</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <Link
              href="/chatbot"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>Ask EcoBot</span>
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Link>
            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
              AI scans your metrics for personalized reduction tips
            </p>
          </div>
        </div>

      </div>

      {logs.length > 0 ? (
        <section className="space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">Emission Visualizations</h3>
          </div>
          <DashboardCharts logs={logs} userGoal={userGoal} />
        </section>
      ) : (
        <div className="glass-panel p-10 sm:p-14 rounded-3xl text-center flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto border border-emerald-500/10 card-hover-effect">
          <div className="p-5 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-emerald-400 shadow-lg">
            <Activity className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white">Unlock emission charts</h3>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            You haven&apos;t logged any footprints. Run the Carbon Footprint Calculator to construct diagnostics, graphs, and category breakdowns.
          </p>
          <Link
            href="/calculator"
            className="px-6 py-3 rounded-xl text-sm font-bold gradient-green-btn text-white transition-all shadow-lg hover:shadow-emerald-500/20"
          >
            Take Carbon Test
          </Link>
        </div>
      )}

      {logs.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Calculator Logs</h3>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">{logs.length} entries</span>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 font-semibold bg-white/[0.02]">
                    <th className="p-4 text-[10px] uppercase tracking-wider">Date</th>
                    <th className="p-4 text-[10px] uppercase tracking-wider">Travel</th>
                    <th className="p-4 text-[10px] uppercase tracking-wider">Energy</th>
                    <th className="p-4 text-[10px] uppercase tracking-wider">Diet</th>
                    <th className="p-4 text-[10px] uppercase tracking-wider">Waste</th>
                    <th className="p-4 text-[10px] uppercase tracking-wider">Shopping</th>
                    <th className="p-4 text-[10px] uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-400">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 flex items-center gap-1.5 font-medium text-white">
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                        {new Date(log.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        {log.inputs?.vehicleType?.replace('_', ' ') || 'walk/bike'} ({log.inputs?.dailyDistance ?? 0} km)
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        {log.inputs?.electricityUsage ?? 0} kWh
                      </td>
                      <td className="p-4 font-mono text-[11px] capitalize">
                        {log.inputs?.foodPreference?.replace('_', ' ') || 'vegetarian'}
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        {log.inputs?.wasteBags ?? 0} bags
                      </td>
                      <td className="p-4 font-mono text-[11px] capitalize">
                        {log.inputs?.shoppingHabit || 'average'}
                      </td>
                      <td className="p-4 text-right font-bold text-white font-mono">
                        {displayUnit === 'co2' ? `${log.total} kg` : `${log.treesEquivalent} Trees`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
