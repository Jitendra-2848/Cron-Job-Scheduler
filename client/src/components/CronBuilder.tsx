import React, { useState, useEffect } from 'react';
import { Terminal, Clock } from 'lucide-react';
import { parseCronExpression } from '../utils/cronParser';

interface CronBuilderProps {
  expression?: string;
  onChange: (expression: string, humanText: string) => void;
}

export const CronBuilder: React.FC<CronBuilderProps> = ({ onChange }) => {
  const [preset, setPreset] = useState('0 0 * * *');
  const [minute, setMinute] = useState('0');
  const [hour, setHour] = useState('0');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');

  const presets = [
    { label: 'Every minute (* * * * *)', value: '* * * * *' },
    { label: 'Every 5 minutes (*/5 * * * *)', value: '*/5 * * * *' },
    { label: 'Every 15 minutes (*/15 * * * *)', value: '*/15 * * * *' },
    { label: 'Every 30 minutes (*/30 * * * *)', value: '*/30 * * * *' },
    { label: 'Every hour (0 * * * *)', value: '0 * * * *' },
    { label: 'Every day at midnight (0 0 * * *)', value: '0 0 * * *' },
    { label: 'Every day at 09:00 AM (0 9 * * *)', value: '0 9 * * *' },
    { label: 'Every weekday at 09:00 AM (0 9 * * 1-5)', value: '0 9 * * 1-5' },
    { label: 'Every Sunday at midnight (0 0 * * 0)', value: '0 0 * * 0' },
    { label: 'Every month on 1st at 00:00 (0 0 1 * *)', value: '0 0 1 * *' },
    { label: 'Custom Expression', value: 'custom' }
  ];

  useEffect(() => {
    if (preset !== 'custom') {
      const parts = preset.split(' ');
      if (parts.length === 5) {
        setMinute(parts[0]);
        setHour(parts[1]);
        setDay(parts[2]);
        setMonth(parts[3]);
        setWeekday(parts[4]);
      }
    }
  }, [preset]);

  const currentCronStr = `${minute} ${hour} ${day} ${month} ${weekday}`;
  const humanTranslation = parseCronExpression(currentCronStr);

  useEffect(() => {
    onChange(currentCronStr, humanTranslation);
  }, [minute, hour, day, month, weekday]);

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPreset(val);
  };

  return (
    <div className="space-y-5">
      
      {/* Preset Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Schedule Preset
        </label>
        <select
          value={preset}
          onChange={handleSelectPreset}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        >
          {presets.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Manual Field Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Minute
          </label>
          <input
            type="text"
            value={minute}
            onChange={(e) => {
              setMinute(e.target.value);
              setPreset('custom');
            }}
            placeholder="*"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center text-sm focus:outline-hidden focus:border-emerald-500"
          />
          <span className="text-[10px] text-slate-400 block text-center mt-1">0-59 or *</span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Hour
          </label>
          <input
            type="text"
            value={hour}
            onChange={(e) => {
              setHour(e.target.value);
              setPreset('custom');
            }}
            placeholder="*"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center text-sm focus:outline-hidden focus:border-emerald-500"
          />
          <span className="text-[10px] text-slate-400 block text-center mt-1">0-23 or *</span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Day of Month
          </label>
          <input
            type="text"
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              setPreset('custom');
            }}
            placeholder="*"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center text-sm focus:outline-hidden focus:border-emerald-500"
          />
          <span className="text-[10px] text-slate-400 block text-center mt-1">1-31 or *</span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Month
          </label>
          <input
            type="text"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPreset('custom');
            }}
            placeholder="*"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center text-sm focus:outline-hidden focus:border-emerald-500"
          />
          <span className="text-[10px] text-slate-400 block text-center mt-1">1-12 or *</span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Weekday
          </label>
          <input
            type="text"
            value={weekday}
            onChange={(e) => {
              setWeekday(e.target.value);
              setPreset('custom');
            }}
            placeholder="*"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center text-sm focus:outline-hidden focus:border-emerald-500"
          />
          <span className="text-[10px] text-slate-400 block text-center mt-1">0-6 or 1-5</span>
        </div>
      </div>

      {/* Dark Code-Style Expression Preview Box */}
      <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Generated Expression</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 text-xs font-mono font-bold border border-emerald-800/80">
            {currentCronStr}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-white tracking-wide">
            "{humanTranslation}"
          </span>
        </div>
      </div>

    </div>
  );
};
