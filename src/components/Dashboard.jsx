import React, { useState } from 'react';
import {
  ClipboardList, CheckCircle2, Clock, TrendingUp,
  ChevronRight, AlertCircle, Star, Calendar, Tag, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getGradeLetter, getGradeBadgeClass, USERS } from '../data/mockData';

const STATUS_CONFIG = {
  graded:       { label: 'Graded',      cls: 'badge-green',  dot: 'bg-emerald-500' },
  pending:      { label: 'Pending',     cls: 'badge-orange', dot: 'bg-amber-500' },
  under_review: { label: 'In Review',   cls: 'badge-blue',   dot: 'bg-blue-500' },
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
        {sub && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{sub}</span>}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return <span className="text-slate-400 font-bold">—</span>;
  return (
    <div className="flex items-center gap-2">
      <span className={`font-black text-lg ${score >= 90 ? 'text-emerald-600' : score >= 80 ? 'text-blue-600' : score >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
        {score.toFixed(1)}%
      </span>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getGradeBadgeClass(score)}`}>
        {getGradeLetter(score)}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user, getProjectsForUser, setSelectedProjectId, allUsers, isInitialDataLoading } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const projects = getProjectsForUser();

  const filtered = projects.filter(p => {
    const student = allUsers.find(u => u.id === p.studentId);
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (student?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const graded  = projects.filter(p => p.status === 'graded').length;
  const pending = projects.filter(p => p.status === 'pending').length;
  const inReview = projects.filter(p => p.status === 'under_review').length;
  const avgScore = projects
    .filter(p => p.finalScore !== null)
    .reduce((acc, p, _, arr) => acc + p.finalScore / arr.length, 0);

  const navigate = useNavigate();

  const openProject = (p) => {
    setSelectedProjectId(p.id);
    navigate(`/app/grade/${p.id}`);
  };

  const isLecturer = user?.role === 'lecturer';
  const isAdmin    = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="welcome-banner rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden mb-8 shadow-2xl shadow-primary-900/40 border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              </div>
              <span className="text-sky-100 text-xs font-black uppercase tracking-[0.3em]">SPMES v2.0 Platform</span>
            </div>
            <p className="text-sky-100/70 text-lg font-medium">Welcome back,</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-1 bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent italic">
              {user?.name}
            </h2>
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-sky-100/80 text-[11px] font-bold bg-white/10 py-2.5 px-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/15 transition-all cursor-default">
                🏛️ {user?.department || 'University Portal'}
              </span>
              <span className="text-sky-100/80 text-[11px] font-bold bg-white/10 py-2.5 px-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/15 transition-all cursor-default capitalize">
                🛡️ {user?.role || 'User'}
              </span>
            </div>
          </div>
          
          <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white/10 p-8 rounded-[2rem] backdrop-blur-2xl border border-white/10 text-center shadow-2xl overflow-hidden group hover:bg-white/15 transition-all min-w-[220px]">
               <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                 <CheckCircle2 size={48} />
               </div>
              <p className="text-[10px] text-sky-100/60 font-black uppercase tracking-[0.4em] mb-2">Academic Session</p>
              <p className="text-3xl font-black bg-gradient-to-b from-white to-sky-200 bg-clip-text text-transparent">25 / 26</p>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-emerald-400 font-black flex items-center justify-center gap-2 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Connection Active
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

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isInitialDataLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
              <div className="w-20 h-3 bg-slate-50 rounded mt-2"></div>
              <div className="w-12 h-6 bg-slate-100 rounded mt-1"></div>
            </div>
          ))
        ) : (
          <>
            <StatCard icon={ClipboardList} label="Total Projects" value={projects.length} color="bg-blue-50 text-blue-600" />
            <StatCard icon={CheckCircle2} label="Graded"         value={graded}          color="bg-emerald-50 text-emerald-600" sub={projects.length > 0 ? `${Math.round(graded/projects.length*100)}%` : null} />
            <StatCard icon={Clock}        label="Pending"         value={pending + inReview} color="bg-amber-50 text-amber-600" />
            <StatCard icon={TrendingUp}   label="Average Score"  value={avgScore > 0 ? `${avgScore.toFixed(1)}%` : '—'} color="bg-violet-50 text-violet-600" />
          </>
        )}
      </div>

      {/* Projects table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h3 className="font-black text-slate-800">
            {isAdmin ? 'All Projects' : isLecturer ? 'Your Students\' Projects' : 'Projects'}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'under_review', 'graded'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'under_review' ? 'In Review' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Search inline */}
        <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50">
          <input
            type="text"
            placeholder="Search by student, project, or category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field-input w-full max-w-sm text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/60 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-30" />
                    No projects match your filters.
                  </td>
                </tr>
              ) : filtered.map(p => {
                const student = p.student || allUsers.find(u => u.id === p.studentId);
                const cfg = STATUS_CONFIG[p.status?.toLowerCase()] || { label: p.status, cls: 'bg-slate-100', dot: 'bg-slate-400' };
                return (
                  <tr key={p.id} className="hover:bg-primary-50/30 transition-colors group cursor-pointer" onClick={() => openProject(p)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="avatar-sm shrink-0">{student?.avatar || (student?.name?.charAt(0) || '?')}</div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{student?.name || 'Unknown'}</div>
                          <div className="text-[10px] text-slate-400">{p.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-700 text-sm max-w-[220px] truncate">{p.title}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {Array.isArray(p.tags) && p.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium text-slate-600">{p.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{p.submittedAt}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block mr-1`}/>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ScoreBadge score={p.finalScore} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="p-2 rounded-lg text-slate-300 group-hover:text-primary-600 group-hover:bg-primary-50 transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-slate-50/40 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
          <span>Showing {filtered.length} of {projects.length} projects</span>
          {(isLecturer || isAdmin) && (
            <button onClick={() => navigate(isAdmin ? '/admin/projects' : '/app/projects')} className="text-primary-600 font-bold hover:underline">
              View all →
            </button>
          )}
        </div>
      </div>

      {/* Recent activity quick view */}
      {(isLecturer || isAdmin) && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-black text-slate-800 mb-4">Recent Highlights</h3>
          <div className="space-y-3">
            {projects.filter(p => p.finalScore !== null).slice(0, 3).map(p => {
              const student = allUsers.find(u => u.id === p.studentId);
              return (
                <div key={p.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <div className="avatar-sm shrink-0">{student?.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">{student?.name}</p>
                  </div>
                  <ScoreBadge score={p.finalScore} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
