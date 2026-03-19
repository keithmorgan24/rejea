import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShieldAlert, Clock, CheckCircle, LogOut, RefreshCcw, MessageSquare } from 'lucide-react';

const VerificationPendingView = ({ setUser }) => {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);

    // Function to manually check if the Admin has flipped the 'is_verified' switch
    const checkVerificationStatus = async () => {
        setChecking(true);
        try {
            const response = await api.get('/accounts/profile/'); // Endpoint to get current user data
            if (response.data.is_verified) {
                // If verified, update the global user state and redirect
                setUser(response.data); 
                navigate('/driver-dashboard');
            } else {
                alert("Your documents are still under review. Please check back later.");
            }
        } catch (error) {
            console.error("Status check failed", error);
        } finally {
            setChecking(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-zinc-100">
            <div className="max-w-md w-full text-center">
                
                {/* Visual Header */}
                <div className="relative inline-block mb-10">
                    <div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-full"></div>
                    <div className="relative bg-zinc-900 border border-yellow-500/30 p-8 rounded-full shadow-2xl">
                        <ShieldAlert size={56} className="text-yellow-500 animate-pulse" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-3 tracking-tight text-white">Verification in Progress</h1>
                <p className="text-zinc-400 mb-10 text-sm leading-relaxed px-4">
                    Welcome to the Rejea Swift Fleet. Your driver credentials are currently being audited by our security team for platform compliance.
                </p>

                {/* Status Timeline */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 mb-10 text-left space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="bg-green-500/20 p-1.5 rounded-full mt-1">
                            <CheckCircle size={16} className="text-green-500" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-white">Application Received</p>
                            <p className="text-xs text-zinc-500">Registration sequence successfully logged.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-yellow-500/20 p-1.5 rounded-full mt-1">
                            <Clock size={16} className="text-yellow-500" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-white">Document Audit</p>
                            <p className="text-xs text-zinc-500">Checking ID & License numbers against transport records.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 opacity-30">
                        <div className="bg-zinc-700 p-1.5 rounded-full mt-1">
                            <CheckCircle size={16} className="text-zinc-400" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-zinc-400">Fleet Activation</p>
                            <p className="text-xs text-zinc-600">Awaiting administrative clearance.</p>
                        </div>
                    </div>
                </div>

                {/* Primary Actions */}
                <div className="grid grid-cols-1 gap-4">
                    <button 
                        onClick={checkVerificationStatus}
                        disabled={checking}
                        className="group bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <RefreshCcw size={18} className={`${checking ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        {checking ? "Checking..." : "Refresh Status"}
                    </button>
                    
                    <button 
                        onClick={handleLogout}
                        className="bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 font-semibold py-4 rounded-2xl border border-zinc-800 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} /> Exit Dashboard
                    </button>
                </div>

                {/* Support Footer */}
                <div className="mt-12 pt-8 border-t border-zinc-900">
                    <p className="text-zinc-600 text-[11px] uppercase tracking-widest font-bold mb-4">Secured by Icon Technologies Global</p>
                    <button className="text-zinc-500 hover:text-white text-xs transition-colors flex items-center justify-center gap-2 mx-auto">
                        <MessageSquare size={14} /> Need help? Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationPendingView;