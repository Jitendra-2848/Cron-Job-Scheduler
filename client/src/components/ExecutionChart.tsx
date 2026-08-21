import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const DATA_SETS: Record<string, Array<{ time: string; success: number; failed: number }>> = {
  '7D': [
    { time: 'Mon', success: 184, failed: 2 },
    { time: 'Tue', success: 210, failed: 1 },
    { time: 'Wed', success: 195, failed: 4 },
    { time: 'Thu', success: 240, failed: 3 },
    { time: 'Fri', success: 220, failed: 1 },
    { time: 'Sat', success: 160, failed: 0 },
    { time: 'Sun', success: 175, failed: 2 }
  ],
  '30D': [
    { time: 'Week 1', success: 1250, failed: 14 },
    { time: 'Week 2', success: 1410, failed: 8 },
    { time: 'Week 3', success: 1380, failed: 22 },
    { time: 'Week 4', success: 1520, failed: 11 }
  ],
  '90D': [
    { time: 'May', success: 5200, failed: 48 },
    { time: 'Jun', success: 5800, failed: 35 },
    { time: 'Jul', success: 6100, failed: 42 }
  ],
  '1Y': [
    { time: 'Q1', success: 15400, failed: 120 },
    { time: 'Q2', success: 17200, failed: 95 },
    { time: 'Q3', success: 18100, failed: 110 },
    { time: 'Q4', success: 19500, failed: 84 }
  ]
};

export const ExecutionChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('7D');
  const { isDark } = useTheme();

  const data = DATA_SETS[timeRange];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Execution Overview
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor successful vs failed job executions over time
          </p>
        </div>

        {/* Legend & Filter Buttons */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Successful</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Failed</span>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['7D', '30D', '90D', '1Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1E293B" : "#F1F5F9"} />
            <XAxis
              dataKey="time"
              stroke={isDark ? "#64748B" : "#94A3B8"}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? "#64748B" : "#94A3B8"}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                fontSize: '12px',
                color: isDark ? '#FFFFFF' : '#0F172A'
              }}
            />
            <Area
              type="monotone"
              dataKey="success"
              name="Successful"
              stroke="#22C55E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSuccess)"
            />
            <Area
              type="monotone"
              dataKey="failed"
              name="Failed"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFailed)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
