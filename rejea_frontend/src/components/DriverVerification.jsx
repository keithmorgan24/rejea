import React, { useState } from 'react';
import api from '../api';
import { ShieldCheck, CreditCard, Award } from 'lucide-react';

const DriverVerification = () => {
    const [formData, setFormData] = useState({ id_number: '', license_number: '' });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/accounts/driver-setup/', formData);
            setStatus('success');
        } catch (err) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-zinc-900 border border-green-500/30 p-10 rounded-4xl text-center">
                <ShieldCheck className="mx-auto text-green-500 mb-4" size={48} />
                <h2 className="text-white font-black text-xl uppercase">Details Submitted</h2>
                <p className="text-zinc-500 mt-2">Admin is reviewing your verification.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 rounded-4xl space-y-4">
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                <Award className="text-green-500" size={18} /> Driver Documents
            </h2>
            
            <div className="relative">
                <CreditCard className="absolute left-4 top-4 text-zinc-600" size={20} />
                <input 
                    name="id_number" 
                    placeholder="National ID" 
                    required
                    onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 text-white focus:ring-2 ring-green-500 outline-none" 
                />
            </div>

            <div className="relative">
                <Award className="absolute left-4 top-4 text-zinc-600" size={20} />
                <input 
                    name="license_number" 
                    placeholder="Driving License Number" 
                    required
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 text-white focus:ring-2 ring-green-500 outline-none" 
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-green-500 hover:text-white transition-all uppercase tracking-tighter"
            >
                {loading ? 'Updating...' : 'Update Driver Profile'}
            </button>
            
            {status === 'error' && <p className="text-red-500 text-center text-xs font-bold">Update failed. Please try again.</p>}
        </form>
    );
};

export default DriverVerification;
