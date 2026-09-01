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

    addCronJob({
      name,
      description,
      schedule,
      humanSchedule,
      commandType: 'webhook',
      webhookUrl: endpoint,
      method: method,
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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cron-jobs')}
          className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Create Cron Job
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure target endpoint triggers and scheduled cron patterns.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Basic Details Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-semibold mb-1.5">Job Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Database Backup"
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0A8F63]"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Daily production backup"
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0A8F63]"
              />
            </div>
          </div>
        </div>

        {/* Target Trigger Endpoint Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
            Target Endpoint
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-slate-500 font-semibold mb-1.5">Endpoint URL *</label>
              <input
                type="url"
                required
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.example.com/backup"
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-[#0A8F63]"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1.5">HTTP Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-[#0A8F63]"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          {/* Webhook Headers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-500 font-semibold">HTTP Headers</label>
              <button
                type="button"
                onClick={handleAddHeader}
                className="text-xs font-bold text-[#0A8F63] hover:underline"
              >
                + Add Header
              </button>
            </div>

            {headers.map((h, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Key"
                  value={h.key}
                  onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 font-mono text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={h.value}
                  onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHeader(idx)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Editor Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
            Schedule Setting
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-500 font-semibold mb-1.5">Cron Expression *</label>
              <input
                type="text"
                required
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="0 0 * * *"
                className="w-48 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-hidden focus:border-[#0A8F63]"
              />
              <span className="text-[11px] text-[#0A8F63] font-bold block mt-2">
                {humanSchedule}
              </span>
            </div>

            {/* Expression breakdown rows */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Minute</span>
                <span className="font-mono font-bold mt-0.5 block">{minute}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Hour</span>
                <span className="font-mono font-bold mt-0.5 block">{hour}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Day of Month</span>
                <span className="font-mono font-bold mt-0.5 block">{day}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Month</span>
                <span className="font-mono font-bold mt-0.5 block">{month}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Weekday</span>
                <span className="font-mono font-bold mt-0.5 block">{weekday}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Retries and Timeouts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
            Execution Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-500 font-semibold mb-1.5">Max Attempts</label>
              <input
                type="number"
                min={1}
                max={5}
                value={retries}
                onChange={(e) => setRetries(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1.5">Execution Timeout (Seconds)</label>
              <input
                type="number"
                min={10}
                max={300}
                value={timeout}
                onChange={(e) => setTimeoutVal(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/cron-jobs')}
            className="px-4 py-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded bg-[#0A8F63] hover:bg-[#08744F] text-white font-bold transition-colors"
          >
            Create Cron Job
          </button>
        </div>

      </form>

    </div>
  );
};

export default CreateCron;