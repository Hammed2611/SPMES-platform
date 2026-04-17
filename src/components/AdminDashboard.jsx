import { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, AlertTriangle, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import API_BASE from '../config/api.js';
import { useApp } from '../context/AppContext';

export default function AdminDashboard() {
  const { allUsers, auditLog, user, authFetch } = useApp();

  const [stats, setStats] = useState({ users: 0, graded: 0, unassigned: 0, overdue: 0, logs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authFetch(`${API_BASE}/api/admin/stats`);
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authFetch]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="welcome-banner rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-primary-900/40 border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                <ShieldCheck size={18} className="text-indigo-300 animate-pulse" />
              </div>
              <span className="text-sky-100 text-xs font-black uppercase tracking-[0.3em]">System Administration</span>
            </div>
            <p className="text-sky-100/70 text-lg font-medium">System Status: <span className="text-emerald-400 font-bold">Secure</span></p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-1 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent italic">
              {user?.name || 'Administrator'}
            </h2>
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-sky-100/80 text-[11px] font-bold bg-white/10 py-2.5 px-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/15 transition-all cursor-default uppercase">
                ⚙️ Root Access
              </span>
              <span className="text-sky-100/80 text-[11px] font-bold bg-white/10 py-2.5 px-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/15 transition-all cursor-default">
                📅 Session: 2024/25
              </span>
            </div>
          </div>
          
          <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/10 p-8 rounded-[2rem] backdrop-blur-2xl border border-white/10 text-center shadow-2xl overflow-hidden group hover:bg-white/15 transition-all min-w-[220px]">
               <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                 <Sparkles size={48} />
               </div>
              <p className="text-[10px] text-sky-100/60 font-black uppercase tracking-[0.4em] mb-2">Live Uptime</p>
              <p className="text-3xl font-black bg-gradient-to-b from-white to-sky-200 bg-clip-text text-transparent">99.9%</p>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-emerald-400 font-black flex items-center justify-center gap-2 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> All Nodes Online
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="banner-circle banner-circle-1" />
        <div className="banner-circle banner-circle-2" />
        <div className="banner-circle banner-circle-3" />
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-xl mb-4"></div>
              <div className="w-24 h-3 bg-slate-50 rounded mb-2"></div>
              <div className="w-16 h-8 bg-slate-100 rounded-lg"></div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Users size={24} />
                </div>
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Active Users</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-4xl font-black text-slate-900">{stats.users}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle size={24} />
                </div>
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Graded Projects</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-4xl font-black text-slate-900">{stats.graded}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <BookOpen size={24} />
                </div>
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Unassigned Projects</p>
              <p className="text-4xl font-black text-slate-900 mt-1">{stats.unassigned}</p>
            </div>

            <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                  <AlertTriangle size={24} />
                </div>
              </div>
              <p className="text-red-800 text-sm font-bold uppercase tracking-wider">Overdue Evaluations</p>
              <p className="text-4xl font-black text-red-600 mt-1">{stats.overdue}</p>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            System Activity Log
          </h3>
          <div className="space-y-6">
            {stats.logs && stats.logs.map((log, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-24 text-right shrink-0">
                  <span className="text-xs font-bold text-slate-400">{new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="relative flex-1 pb-6 border-l-2 border-slate-100 pl-6 last:pb-0 last:border-transparent">
                  <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[7px] top-1 ring-4 ring-white"></div>
                  <p className="text-sm text-slate-700 font-medium">
                    <span className="font-bold">[{log.user?.role}]</span> {log.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workload Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Workload Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-slate-600">Computer Science</span>
                <span className="text-slate-900">85%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-slate-600">Engineering</span>
                <span className="text-slate-900">60%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-slate-600">Business Management</span>
                <span className="text-slate-900">40%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
