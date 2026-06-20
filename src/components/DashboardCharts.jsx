'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardCharts({ logs, userGoal }) {
  const [mounted] = useState(() => typeof window !== 'undefined');

  if (!mounted) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-500 font-light text-sm">
        Calibrating visualization engines...
      </div>
    );
  }

  const latestLog = logs && logs.length > 0 ? logs[0] : {
    breakdown: { transport: 180, electricity: 120, food: 54, waste: 25, shopping: 140 },
    total: 519
  };

  const pieData = [
    { name: 'Transport', value: latestLog.breakdown?.transport || 0, color: '#34d399' },
    { name: 'Energy', value: latestLog.breakdown?.electricity || 0, color: '#06b6d4' },
    { name: 'Food', value: latestLog.breakdown?.food || 0, color: '#818cf8' },
    { name: 'Waste', value: latestLog.breakdown?.waste || 0, color: '#f59e0b' },
    { name: 'Shopping', value: latestLog.breakdown?.shopping || 0, color: '#f472b6' },
  ].filter(item => item.value > 0);

  const sortedLogs = [...(logs || [])].reverse();

  const trendData = sortedLogs.length > 0
    ? sortedLogs.map(log => ({
        date: new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Emissions: log.total,
        Goal: userGoal
      }))
    : [
        { date: 'Week 1', Emissions: 680, Goal: userGoal },
        { date: 'Week 2', Emissions: 610, Goal: userGoal },
        { date: 'Week 3', Emissions: 580, Goal: userGoal },
        { date: 'Week 4', Emissions: 519, Goal: userGoal },
      ];

  const comparisonData = [
    { name: 'Your Score', value: latestLog.total, fill: 'url(#userGlow)' },
    { name: 'Your Goal', value: userGoal, fill: '#10b981' },
    { name: 'US Avg', value: 1333, fill: '#4b5563' },
    { name: 'EU Avg', value: 550, fill: '#6b7280' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-[380px] card-hover-effect">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">Emissions Share</h4>
          <p className="text-[11px] text-gray-500 mt-1">Distribution across lifestyle categories.</p>
        </div>

        <div className="h-56 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                itemStyle={{ color: '#fff', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
            <span className="text-2xl font-extrabold font-mono text-white leading-none">{latestLog.total}</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">kg CO₂/mo</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[10px]">
          {pieData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-400">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-[380px] lg:col-span-2 card-hover-effect">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">Footprint Journey</h4>
          <p className="text-[11px] text-gray-500 mt-1">Historical emissions compared to your target.</p>
        </div>

        <div className="h-64 mt-2 text-[10px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 10 }} />
              <YAxis stroke="#4b5563" unit="kg" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Area type="monotone" dataKey="Emissions" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGlow)" activeDot={{ r: 6, fill: '#06b6d4' }} />
              <Area type="monotone" dataKey="Goal" stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 5" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-[380px] lg:col-span-3 card-hover-effect">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">Benchmarks & Targets</h4>
          <p className="text-[11px] text-gray-500 mt-1">Comparing your emissions to targets and averages.</p>
        </div>

        <div className="h-64 mt-2 text-[10px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="userGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 10 }} />
              <YAxis stroke="#4b5563" unit="kg" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                itemStyle={{ color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
