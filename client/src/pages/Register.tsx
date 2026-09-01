import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import toast from 'react-hot-toast';





const Register: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<any>("");
    const [confirm_password, setConfirm_Password] = useState<any>("");
    const [email, setEmail] = useState<any>("");
    const [error, setError] = useState<any>("");
    const [currentScene, setCurrentScene] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const durations = [4000, 3000, 3500, 5000, 7000]; // ms for each SVG

        const timer = setTimeout(() => {
            setCurrentScene((prev) => (prev + 1) % 5);
        }, durations[currentScene]);

        return () => clearTimeout(timer);
    }, [currentScene]);


    useEffect(() => {
        if (!error) {
            return;
        }
        toast.error(error);
        setError("");
    }, [error])
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password || !email) {
            toast.error("All fields are required!")
            return;
        }
        if(confirm_password !== password){
            toast.error("Passwords do not match!")
            return;
        }
        setIsLoading(true);
        const registerData = {
            username: username,
            password: password,
            email: email
        }
        try {
            const response = await api.post("/auth/register", registerData);

            console.log(response.data);
            if (response.status === 201) {
                toast.success(response.data.message);
            }
        } catch (err: any) {
            console.log(err.response);       // Full response
            console.log(err.response.data);  // { message: "Username is already taken" }
            console.log(err.response.status); // 400
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="min-h-screen w-full flex bg-slate-50 ">
            <div className={`w-full lg:w-1/2 bg-[#fff7f5] flex items-center justify-center px-20`}>
                <div className="w-full max-w-xl p-8 rounded-3xl ">
                    <div className="text-center flex flex-col mb-6 mx-auto">
                        <img className='w-10 mx-auto scale-150 border border-[#2566f3] rounded-full my-2 p-1' src="/Register_Asset/Profile.svg" />
                        <h1 className="text-3xl font-bold text-slate-900 flex mx-auto">Register
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Select your account type to proceed</p>
                    </div>



                    <form onSubmit={handleSubmit} className="space-y-4 pr-10 start-0">
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
                            <label className="block text-slate-700 text-sm font-medium mb-1">Email</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                        <div>
                            <label className="block text-slate-700 text-sm font-medium mb-1">Confirm Password</label>
                            <input
                                type="password"
                                value={confirm_password}
                                onChange={(e) => setConfirm_Password(e.target.value)}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                                placeholder="Enter your password"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-3 px-4 my-2 ${isLoading ? "bg-[#dcffd9]" : "bg-[#14ad3d] hover:bg-[#00d323d6] "} text-white font-semibold rounded-2xl shadow-md transition-all active:scale-[0.99] cursor-pointer overflow-hidden`}
                        >
                            {
                                !isLoading ?
                                    "Register now"
                                    :
                                    <img src="/Register_Asset/loading.svg" className='w-5 my-1 scale-[2.5] mx-auto ease-in' />
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
                    {/* <button
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
                    </button> */}
                    {/* Registration Link */}
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden lg:flex lg:w-1/2 relative bg-white justify-center items-center overflow-hidden">

                {currentScene === 0 && (
                    <img
                        src="/Register_Asset/thinking.svg"

                        className="w-96 scale-[1]"
                        alt="Driving"
                    />
                )}
                {currentScene === 1 && (
                    <img
                        src="/Register_Asset/car.svg"
                        className="w-96 scale-[1.8]"
                        alt="Taxi Booking"
                    />
                )}
                {currentScene === 2 && (
                    <img
                        src="/Register_Asset/cortisol.svg"
                        className="w-96 scale-[2]"
                        alt="Taxi Booking"
                    />
                )}
                {currentScene === 3 && (
                    <img
                        src="/Register_Asset/Car Rush.svg"
                        className="w-96 scale-[2]"
                        alt="Taxi Booking"
                    />
                )}
                {currentScene === 4 && (
                    <img
                        src="/Register_Asset/Tourists.svg"
                        className="w-96 scale-[2]"
                        alt="Taxi Booking"
                    />
                )}

            </div>
        </div>
    );
}

export default Register