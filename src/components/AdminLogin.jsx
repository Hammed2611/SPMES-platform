import React, { useState } from 'react';
import { ShieldAlert, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const result = await login(email, password);
      
      if (result.success && result.user?.role?.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.success) {
        alert("Access Denied: Restricted Admin Access Only.");
      } else {
        alert(result.error || "Authentication Failed");
      }
    } catch (error) {
      console.error(error);
      alert("System Connection Error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/30 text-red-500">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Admin Portal</h1>
          <p className="text-slate-400 mt-2 text-center text-sm font-mono">
            RESTRICTED ACCESS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-4 py-3 rounded-xl text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                placeholder="admin@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Master Password</label>
            <div className="relative">
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-10 py-3 rounded-xl text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl mt-6 transition-all tracking-widest shadow-xl shadow-red-900/40 disabled:opacity-50 active:scale-95"
          >
            {isLoggingIn ? 'AUTHENTICATING...' : 'AUTHORIZE SESSION'}
          </button>
        </form>
      </div>
    </div>
  );
}
