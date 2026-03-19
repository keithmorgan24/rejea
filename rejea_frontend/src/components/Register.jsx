import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; // Your Axios instance
import { User, Truck, ShieldCheck, Mail, Lock, UserCircle, Phone } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone_number: '',
        user_type: 'passenger', // Default role
        id_number: '',
        license_number: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, user_type: role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/accounts/register/', formData);
            alert("Registration successful! Please login to continue.");
            navigate('/login');
        } catch (error) {
            console.error("Registration Error:", error.response?.data);
            alert(error.response?.data?.error || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-zinc-100">
            <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
                    <p className="text-zinc-400 mt-2">Join the Rejea Swift transport network</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role Selector */}
                    <div className="flex gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => handleRoleSelect('passenger')}
                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                formData.user_type === 'passenger' 
                                ? 'border-green-500 bg-green-500/10 text-green-500' 
                                : 'border-zinc-800 bg-zinc-800/50 text-zinc-500'
                            }`}
                        >
                            <User size={24} />
                            <span className="font-semibold">Passenger</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleRoleSelect('driver')}
                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                formData.user_type === 'driver' 
                                ? 'border-green-500 bg-green-500/10 text-green-500' 
                                : 'border-zinc-800 bg-zinc-800/50 text-zinc-500'
                            }`}
                        >
                            <Truck size={24} />
                            <span className="font-semibold">Driver</span>
                        </button>
                    </div>

                    {/* Standard Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <UserCircle className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                            <input
                                name="username"
                                type="text"
                                placeholder="Username"
                                required
                                onChange={handleChange}
                                className="w-full bg-zinc-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 ring-green-500 outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                            <input
                                name="phone_number"
                                type="text"
                                placeholder="Phone Number"
                                required
                                onChange={handleChange}
                                className="w-full bg-zinc-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 ring-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                        <input
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            required
                            onChange={handleChange}
                            className="w-full bg-zinc-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 ring-green-500 outline-none"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                            onChange={handleChange}
                            className="w-full bg-zinc-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 ring-green-500 outline-none"
                        />
                    </div>

                    {/* Conditional Driver Requirements */}
                    {formData.user_type === 'driver' && (
                        <div className="p-5 bg-zinc-950/50 border border-zinc-800 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 text-yellow-500 mb-2">
                                <ShieldCheck size={18} />
                                <span className="text-sm font-medium">Driver Verification Required</span>
                            </div>
                            <input
                                name="id_number"
                                type="text"
                                placeholder="National ID Number"
                                required
                                onChange={handleChange}
                                className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 focus:ring-2 ring-green-500 outline-none"
                            />
                            <input
                                name="license_number"
                                type="text"
                                placeholder="Driving License Number"
                                required
                                onChange={handleChange}
                                className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 focus:ring-2 ring-green-500 outline-none"
                            />
                            <p className="text-[10px] text-zinc-500 italic">
                                * Your account will remain 'Pending' until admin verifies these credentials.
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-black font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-green-900/20"
                    >
                        {loading ? "Creating Account..." : "Register Now"}
                    </button>

                    <p className="text-center text-zinc-500 text-sm mt-4">
                        Already have an account? <Link to="/login" className="text-green-500 hover:underline">Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;