import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash } from 'lucide-react';
import { useCron } from '../context/CronContext';
import { parseCronExpression } from '../utils/cronParser';

interface HeaderItem {
  key: string;
  value: string;
}

export const CreateCron: React.FC = () => {
  const navigate = useNavigate();
  const { addCronJob, showToast } = useCron();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('0 0 * * *');
  const [endpoint, setEndpoint] = useState('https://api.example.com/backup');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [payloadStr, setPayloadStr] = useState('{\n  "source": "cronmaster"\n}');
  const [retries, setRetries] = useState(3);
  const [timeout, setTimeoutVal] = useState(30);
  const [timezone, setTimezone] = useState('UTC');

  // Parse cron expression
  const [humanSchedule, setHumanSchedule] = useState('Runs every day at midnight (00:00 AM)');
  const [minute, setMinute] = useState('0');
  const [hour, setHour] = useState('0');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');

  useEffect(() => {
    const parts = schedule.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDay(parts[2]);
      setMonth(parts[3]);
      setWeekday(parts[4]);
      setHumanSchedule(parseCronExpression(schedule));
    }
  }, [schedule]);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, idx) => idx !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', val: string) => {
    setHeaders(headers.map((h, idx) => idx === index ? { ...h, [field]: val } : h));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a job name', 'error');
      return;
    }

    let parsedPayload: any = {};
    if (method !== 'GET' && method !== 'DELETE' && payloadStr.trim()) {
      try {
        parsedPayload = JSON.parse(payloadStr);
      } catch {
        showToast('Invalid JSON in Request Body payload', 'error');
        return;
      }
    }

    addCronJob({
      name,
      description,
      schedule,
      humanSchedule,
      commandType: 'webhook',
      webhookUrl: endpoint,
      method: method,
      payload: parsedPayload,
      command: `curl -X ${method} ${endpoint} ${headers.map(h => `-H "${h.key}: ${h.value}"`).join(' ')}`,
      status: 'active',
      nextRun: 'In scheduled window',
      timeoutSeconds: timeout,
      maxRetries: retries,
      timezone,
      category: 'Integrations'
    });

    navigate('/cron-jobs');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12 px-2 sm:px-0">
      
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cron-jobs')}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Create Cron Job
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure target webhook endpoints, schedules, and payloads.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Basic Details Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Job Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Database Backup"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Daily production backup"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Target Trigger Endpoint Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">
            Target Endpoint
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Endpoint URL *</label>
              <input
                type="url"
                required
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.example.com/backup"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-xs focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">HTTP Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          {/* Webhook Headers */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">HTTP Headers</label>
              <button
                type="button"
                onClick={handleAddHeader}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                + Add Header
              </button>
            </div>

            {headers.map((h, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  placeholder="Header Key (e.g. Authorization)"
                  value={h.key}
                  onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
                <input
                  type="text"
                  placeholder="Header Value"
                  value={h.value}
                  onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHeader(idx)}
                  className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors self-end sm:self-auto cursor-pointer"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* JSON Payload (for POST/PUT) */}
          {(method === 'POST' || method === 'PUT') && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                Request Body (JSON Payload)
              </label>
              <textarea
                rows={4}
                value={payloadStr}
                onChange={(e) => setPayloadStr(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Schedule Editor Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">
            Schedule Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Cron Expression *</label>
              <input
                type="text"
                required
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="0 0 * * *"
                className="w-full sm:w-56 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-2">
                {humanSchedule}
              </span>
            </div>

            {/* Expression breakdown rows */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Minute</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{minute}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Hour</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{hour}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Day</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{day}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Month</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{month}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Weekday</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{weekday}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Retries and Timeouts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">
            Execution Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Max Attempts</label>
              <input
                type="number"
                min={1}
                max={5}
                value={retries}
                onChange={(e) => setRetries(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Execution Timeout (Seconds)</label>
              <input
                type="number"
                min={5}
                max={300}
                value={timeout}
                onChange={(e) => setTimeoutVal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/cron-jobs')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            Create Cron Job
          </button>
        </div>

      </form>

    </div>
  );
};

export default CreateCron;