import React, { useState, useEffect } from 'react';
import { User, Laptop, Save, Camera, Loader2, Sparkles } from 'lucide-react';
import { useCron } from '../context/CronContext';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateUserProfile } = useCron();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [timezone, setTimezone] = useState(user.timezone);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setTimezone(user.timezone);
    if (user.avatar) setAvatar(user.avatar);
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setAvatar(url);
      updateUserProfile({ avatar: url });
      toast.success('Avatar image uploaded to Cloudinary!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Cloudinary upload failed');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      phone,
      timezone,
      avatar
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
          Manage your personal profile information, avatar, and active sessions.
        </p>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group cursor-pointer">
          <img
            src={avatar || user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500 shadow-md transition-opacity group-hover:opacity-85"
          />
          <label className="absolute inset-0 rounded-full flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
            {isUploadingAvatar ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploadingAvatar}
              className="hidden"
            />
          </label>
          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {user.name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 w-fit mx-auto sm:mx-0">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user.email} &bull; Account created {user.joinedDate}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center sm:justify-start">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hover on profile picture to upload a custom avatar to Cloudinary</span>
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
                Full Name / Username
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
                placeholder="+1 (555) 000-0000"
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

        {/* Active Session Device */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Laptop className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Active Session
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current authenticated browser session
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Laptop className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  Current Browser Session
                </div>
                <div className="text-[11px] text-slate-400">
                  Protected with HTTP-Only Cookie Authentication
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-[10px]">
              Active
            </span>
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setPhone(user.phone);
              setTimezone(user.timezone);
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Reset
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>

      </form>

    </div>
  );
};

export default Profile;