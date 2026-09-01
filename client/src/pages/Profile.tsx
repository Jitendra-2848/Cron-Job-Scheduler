import React, { useState } from 'react';
import { User, Shield, Laptop, Save } from 'lucide-react';
import { useCron } from '../context/CronContext';
import { FeatureModal } from '../components/FeatureModal';

const Profile: React.FC = () => {
  const { user, updateUserProfile } = useCron();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [timezone, setTimezone] = useState(user.timezone);
  const [twoFactor] = useState(user.twoFactorEnabled);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      phone,
      timezone,
      twoFactorEnabled: twoFactor
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal information, credentials, and security preferences.
        </p>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500 shadow-md"
          />
          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {user.name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 w-fit mx-auto sm:mx-0">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {user.email} • Account created {user.joinedDate}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Personal Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Personal Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your account details and contact information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Default Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:outline-hidden focus:border-emerald-500"
              >
                <option value="America/New_York (UTC-5)">America/New_York (UTC-5)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="Europe/London (GMT+0)">Europe/London (GMT+0)</option>
                <option value="Asia/Kolkata (IST+5:30)">Asia/Kolkata (IST+5:30)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Security Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage passwords, 2FA, and active session devices
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 2FA Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Two-Factor Authentication (2FA)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Secure your account with TOTP authenticator app verification
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShow2FAModal(true);
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                twoFactor ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  twoFactor ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Active Sessions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Active Sessions
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-emerald-500" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Chrome on Current Device
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Active Session &bull; Managed via Session Cookies
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-[10px]">
                  Active
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

      </form>

      {/* 2FA Feature Modal Pop-Up */}
      <FeatureModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        featureName="Two-Factor Authentication (2FA)"
        description="2FA authenticator verification is currently in development and will be enabled in the upcoming CronMaster release."
      />

    </div>
  );
};

export default Profile;