import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; 
import { User, Truck, ShieldCheck, Mail, Lock, UserCircle, Phone } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone_number: '',
        user_type: 'passenger',
        id_number: '',
        license_number: ''
    });

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (e) => {
        if (error) setError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, user_type: role });
    };

        const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError('');

        const payload = { ...formData };
        if (payload.user_type === 'passenger') {
            delete payload.id_number;
            delete payload.license_number;
        }

        try {
           await api.post('/accounts/register/', payload);
            localStorage.clear();
            alert("Registration successful! Please login.");
            navigate('/login', { replace: true });
        } catch (err) {
            const serverData = err.response?.data;
            const detailError = serverData?.error || "";

            // 1. Handle the "UserProfile already exists" error (The one in your image)
            if (detailError.includes("userprofile") && detailError.includes("already exists")) {
                setError("System Error: A profile already exists for this account. Please try logging in.");
            } 
            // 2. Handle Username duplicate
            else if (detailError.includes("username") && detailError.includes("already exists")) {
                setError("This username is already taken.");
            } 
            // 3. Fallback
            else {
                setError("Registration failed. Please check your connection or try again.");
            }
            console.error("Full Server Error:", serverData);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-zinc-100">
            <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-[40px] p-10 shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black italic tracking-tighter text-white">
                        JOIN <span className="text-green-500">REJEA</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Create your transport network profile</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-xs font-bold text-center animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex gap-4 mb-10">
                        <button type="button" onClick={() => handleRoleSelect('passenger')}
                            className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-3xl border-2 transition-all ${formData.user_type === 'passenger' ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-zinc-800 bg-zinc-800/50 text-zinc-500'}`}>
                            <User size={28} />
                            <span className="font-black text-xs uppercase tracking-widest">Passenger</span>
                        </button>
                        <button type="button" onClick={() => handleRoleSelect('driver')}
                            className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-3xl border-2 transition-all ${formData.user_type === 'driver' ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-zinc-800 bg-zinc-800/50 text-zinc-500'}`}>
                            <Truck size={28} />
                            <span className="font-black text-xs uppercase tracking-widest">Driver</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <UserCircle className={`absolute left-4 top-4 ${error.includes('username') ? 'text-red-500' : 'text-zinc-500'}`} size={20} />
                            <input name="username" type="text" placeholder="Username" required value={formData.username} onChange={handleChange}
                                className={`w-full bg-zinc-800 border-zinc-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 outline-none transition-all ${error.includes('username') ? 'ring-red-500 border-red-500/50' : 'ring-green-500'}`} />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-4 top-4 text-zinc-500" size={20} />
                            <input name="phone_number" type="text" placeholder="Phone Number" required value={formData.phone_number} onChange={handleChange}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 ring-green-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="relative">
                        <Mail className={`absolute left-4 top-4 ${error.includes('email') ? 'text-red-500' : 'text-zinc-500'}`} size={20} />
                        <input name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={handleChange}
                            className={`w-full bg-zinc-800 border-zinc-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 outline-none transition-all ${error.includes('email') ? 'ring-red-500 border-red-500/50' : 'ring-green-500'}`} />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
                        <input name="password" type="password" placeholder="Password" required value={formData.password} onChange={handleChange}
                            className="w-full bg-zinc-800 border-zinc-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 ring-green-500 outline-none transition-all" />
                    </div>

                    {formData.user_type === 'driver' && (
                        <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 text-yellow-500 mb-2">
                                <ShieldCheck size={20} />
                                <span className="text-xs font-black uppercase tracking-widest">Driver Verification</span>
                            </div>
                            <input name="id_number" type="text" placeholder="National ID Number" required value={formData.id_number} onChange={handleChange}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-2xl py-4 px-5 text-white focus:ring-2 ring-green-500 outline-none" />
                            <input name="license_number" type="text" placeholder="License Number" required value={formData.license_number} onChange={handleChange}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-2xl py-4 px-5 text-white focus:ring-2 ring-green-500 outline-none" />
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 text-black font-black py-4 rounded-2xl transition-all uppercase">
                        {loading ? 'Processing...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
