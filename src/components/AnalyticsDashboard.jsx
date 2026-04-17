import React, { useState, useEffect } from 'react';
import API_BASE from '../config/api.js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, AlertTriangle, CheckCircle, 
  BarChart3, PieChart as PieIcon, Activity, Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

export default function AnalyticsDashboard() {
  const { authFetch } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_BASE}/api/analytics/class`);
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authFetch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">Calculating class metrics...</p>
      </div>
    );
  }

  if (!stats) return <div className="p-10 text-center text-slate-400">Unable to load class data.</div>;

  const displayTrends = stats.trends && stats.trends.length > 0 ? stats.trends : [{ week: 'W1', score: 0 }];
  const gradedCount = (stats.distribution || []).reduce((a, b) => a + (b.count || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg. Class Score', val: `${stats.averageScore || 0}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Graded Projects', val: gradedCount, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Projects', val: stats.totalProjects || 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'At-Risk Flags', val: stats.atRisk?.length || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-sm">
            <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider leading-none mb-1">{s.label}</p>
              <h4 className="text-2xl font-black text-slate-800 leading-none">{s.val}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Bar Chart */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-500" /> Grade Distribution
            </h3>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40}>
                  {(stats.distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <PieIcon size={18} className="text-violet-500" /> Performance by Rubric
          </h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stats.categoryStats || []} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#334155' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="avg" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress Trend Timeline */}
      <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Activity size={18} className="text-emerald-500" /> Submission Performance Trend
          </h3>
          <div className="flex gap-2">
            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Current Semester</span>
          </div>
        </div>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayTrends}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* At-Risk Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
        <div className="p-6 bg-red-50/30 flex justify-between items-center border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white p-2 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-black text-red-900 leading-tight">Priority At-Risk List</h3>
              <p className="text-xs text-red-700 opacity-80 uppercase tracking-widest font-bold">Predictive Intervention Required</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Factor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Urgency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.atRisk && stats.atRisk.map((student, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar-sm bg-red-50 text-red-600 font-bold">{student.avatar || (student.student?.charAt(0))}</div>
                      <span className="font-black text-slate-800 text-sm whitespace-nowrap">{student.student}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 max-w-[200px] truncate">{student.title}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-red-600 tracking-wide">{student.reason}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${student.urgency === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>
                      {student.urgency}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats.atRisk || stats.atRisk.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-sm italic">
                    Great news! No students currently flag as high risk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
