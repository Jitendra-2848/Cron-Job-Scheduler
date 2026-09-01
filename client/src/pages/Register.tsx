import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Lock, User, Mail, ArrowRight, Loader2, CheckCircle2, Sun, Moon, Monitor } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!error) return;
        toast.error(error);
        setError('');
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username || !password || !email) {
            toast.error('All fields are required!');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long!');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', {
                username,
                email,
                password,
            });

            if (response.status === 201) {
                toast.success(response.data.message || 'Registered successfully!');
                navigate('/login');
            }
        } catch (err: any) {
            console.error(err.response);
            const errMsg = err.response?.data?.message || 'Failed to create account';
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
        window.location.href = `${apiBaseUrl}/auth/google`;
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans">
            {/* Left Side: Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 bg-white dark:bg-slate-950 transition-colors">
                {/* Top Control Bar with Theme Switcher */}
                <div className="flex items-center justify-between w-full max-w-md mx-auto">
                    <div className="flex items-center gap-2 lg:hidden">
                        <Clock className="w-6 h-6 text-emerald-500" />
                        <span className="font-bold text-lg text-slate-900 dark:text-white">CronMaster</span>
                    </div>

                    {/* Theme Mode Segmented Control: Light (Sun), Dark (Moon), System (Monitor) */}
                    <div className="ml-auto flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setTheme('light')}
                            className={`p-1.5 rounded-lg transition-all ${
                                theme === 'light'
                                    ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-xs font-semibold'
                                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title="Light Mode"
                        >
                            <Sun className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setTheme('dark')}
                            className={`p-1.5 rounded-lg transition-all ${
                                theme === 'dark'
                                    ? 'bg-white dark:bg-slate-800 text-emerald-400 shadow-xs font-semibold'
                                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title="Dark Mode"
                        >
                            <Moon className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setTheme('system')}
                            className={`p-1.5 rounded-lg transition-all ${
                                theme === 'system'
                                    ? 'bg-white dark:bg-slate-800 text-blue-400 shadow-xs font-semibold'
                                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title="System Mode"
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="w-full max-w-md mx-auto my-auto py-6 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Join CronMaster to start scheduling & monitoring jobs</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                                    placeholder="name@domain.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                                    placeholder="Minimum 6 characters"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                                    placeholder="Re-enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Register Now
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Auth Divider */}
                    <div className="relative my-4 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <span className="relative bg-white dark:bg-slate-950 px-4 text-xs uppercase text-slate-400 dark:text-slate-500 font-semibold tracking-wider">
                            Or continue with
                        </span>
                    </div>

                    {/* Google SSO Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                            <g transform="matrix(1, 0, 0, 1, 0, 0)">
                                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.64 -0.06,-1.26 -0.17,-1.8Z" fill="#4285F4" />
                                <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.9,0.6 -2.07,0.98 -3.3,0.98c-2.34,0 -4.33,-1.58 -5.04,-3.7H2.92v2.66C4.4,18.78 8.0,20.6 12,20.6Z" fill="#34A853" />
                                <path d="M6.96,13.1c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.04H2.92C2.3,8.28 2,9.68 2,11.1c0,1.42 0.3,2.82 0.92,4.06l4.04,-3.06Z" fill="#FBBC05" />
                                <path d="M12,6.4c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.64 14.43,3 12,3C8.0,3 4.4,4.82 2.92,7.04l4.04,3.06C7.67,7.98 9.66,6.4 12,6.4Z" fill="#EA4335" />
                            </g>
                        </svg>
                        Sign in with Google
                    </button>

                    {/* Login Link */}
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side: Product Visual Showcase */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-l border-slate-800 flex-col justify-between p-12 overflow-hidden">
                {/* Background Grid Accent */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

                {/* Top Header */}
                <div className="relative z-10 flex items-center justify-end gap-2">
                    <span className="text-xs text-slate-400">Ready to start scheduling?</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Free Developer Tier
                    </span>
                </div>

                {/* Center Content */}
                <div className="relative z-10 my-auto space-y-6 max-w-lg">
                    <div className="space-y-3">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                            Build, Schedule & Monitor Webhooks in Seconds
                        </h2>
                        <p className="text-sm text-slate-400">
                            Say goodbye to flaky server crontabs. CronMaster handles scheduling, retries, logs, and notifications.
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>Standard 5-part cron syntax expression support</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>Automated exponential backoff retries on failed webhooks</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>HTTP Method configuration (GET, POST, PUT, DELETE) with custom JSON payloads</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>High-availability persistence & automated worker queue</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} CronMaster. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Register;