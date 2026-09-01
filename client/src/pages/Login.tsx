import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

type UserRole = 'Customer' | 'Driver';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('Customer');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<any>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentScene, setCurrentScene] = useState(0);


  useEffect(() => {
    if (!error) return;
    toast.error(error);
    setError('');
  }, [error]);

  useEffect(() => {
    const durations = [2000, 4900, 9000, 3000]; // ms for each SVG

    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
    }, durations[currentScene]);

    return () => clearTimeout(timer);
  }, [currentScene]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('All fields are required!');
      return;
    }
    setIsLoading(true);
    const loginData = {
      username,
      password,
      role, 
    };

    try {
      const response = await api.post('/auth/login', loginData);

      if (response.status === 200) {
        toast.success(response.data.message || 'Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err.response);
      toast.error(err.response?.data?.message);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left Side: Brand Visual/Image Banner */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white justify-center items-center overflow-hidden">

        {currentScene === 0 && (
          <img
            src="/Login_Asset/driving.svg"
            className="w-96 scale-[1.5]"
            alt="Driving"
          />
        )}

        {currentScene === 1 && (
          <img
            src="/Login_Asset/taxi app.svg"
            className="w-96 scale-[1.5]"
            alt="Taxi App"
          />
        )}

        {currentScene === 2 && (
          <img
            src="/Login_Asset/taxi booking.svg"
            className="w-96 scale-[2]"
            alt="Taxi Booking"
          />
        )}
        { currentScene === 3 && (
          <img
            src="/Login_Asset/friends.svg"
            className="w-96 scale-[2]"
            alt="Taxi Booking"
          />
        )}

      </div>

      {/* Right Side: Form Credentials */}
      <div className={`w-full lg:w-1/2 ${role == "Driver" ? "bg-[#f2fcf0]" : "bg-[#f5fafd]"} flex items-center justify-center`}>
        <div className="w-full max-w-xl p-8 rounded-3xl ">
          <div className="text-center flex flex-col mb-6 mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 flex mx-auto">Login
              {
                role === 'Customer' ?
                  <img className='w-10 mx-2 bg-black ' src="/Login_Asset/profile.gif" />
                  :
                  <img className='w-10 mx-2 bg-black ' src="/Login_Asset/path.gif" />
              }
            </h1>
            <p className="text-sm text-slate-500 mt-1">Select your account type to proceed</p>
          </div>

          {/* Role Selector Tabs (Customer vs Driver) */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRole('Customer')}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${role === 'Customer'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('Driver')}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${role === 'Driver'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Driver
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 px-4 ${isLoading ? "bg-white" : "bg-slate-900 hover:bg-slate-800 "} text-white font-semibold rounded-2xl shadow-md transition-all active:scale-[0.99] cursor-pointer overflow-hidden`}
            >
              {
                !isLoading ?
                  `Login as ${role === 'Customer' ? 'Customer' : 'Driver'}`
                  :
                  <img src="/Login_Asset/go-kart.gif" className='w-5 scale-[3.5] mx-auto ease-in' />
              }
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-4 text-xs uppercase text-slate-400 font-medium">
              Or continue with
            </span>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={() => {
              const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
              window.location.href = `${apiBaseUrl}/auth/google?role=${role}`;
            }}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-700 font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
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
          {/* Registration Link */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-slate-900 hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;