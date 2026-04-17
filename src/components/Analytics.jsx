import React from 'react';
import { TrendingUp, Award, Users, BarChart2, PieChart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGradeLetter, getGradeBadgeClass, USERS } from '../data/mockData';

function MiniBar({ value, max = 100, color = 'bg-primary-500' }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );
}

function GradeDonut({ projects }) {
  const graded = projects.filter(p => p.finalScore !== null);
  const buckets = {
    A: graded.filter(p => p.finalScore >= 90).length,
    B: graded.filter(p => p.finalScore >= 80 && p.finalScore < 90).length,
    C: graded.filter(p => p.finalScore >= 70 && p.finalScore < 80).length,
    D: graded.filter(p => p.finalScore >= 60 && p.finalScore < 70).length,
    F: graded.filter(p => p.finalScore < 60).length,
  };
  const colors = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' };
  const total = graded.length;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><PieChart size={18} className="text-primary-500" /> Grade Distribution</h3>
      {total === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">No graded projects yet.</p>
      ) : (
        <>
          <div className="space-y-3">
            {Object.entries(buckets).map(([grade, count]) => (
              <div key={grade} className="flex items-center gap-3">
                <span className="text-xs font-black w-5 text-slate-700">{grade}</span>
                <div className="flex-1">
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, backgroundColor: colors[grade] }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 w-12 text-right">
                  {count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-black text-slate-900">{total}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Graded</p>
            </div>
            <div>
              <p className="text-xl font-black text-emerald-600">{buckets.A + buckets.B}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">A–B Range</p>
            </div>
            <div>
              <p className="text-xl font-black text-primary-600">
                {total > 0 ? (graded.reduce((s, p) => s + p.finalScore, 0) / total).toFixed(1) : '—'}%
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Average</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TopPerformers({ projects }) {
  const graded = projects
    .filter(p => p.finalScore !== null)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 5);

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Award size={18} className="text-amber-500" /> Top Performers</h3>
      {graded.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">No graded projects yet.</p>
      ) : (
        <div className="space-y-3">
          {graded.map((p, i) => {
            const student = allUsers.find(u => u.id === p.studentId);
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-xl w-8 text-center">{medals[i] || `#${i + 1}`}</span>
                <div className="avatar-sm shrink-0">{student?.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{student?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{p.title}</p>
                </div>
                <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${getGradeBadgeClass(p.finalScore)}`}>
                  {p.finalScore.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RubricBreakdown({ projects }) {
  const graded = projects.filter(p => p.finalScore !== null);

  const avg = (key) => {
    if (graded.length === 0) return 0;
    return graded.reduce((s, p) => s + (p.rubric[key]?.score || 0), 0) / graded.length;
  };

  const categories = [
    { key: 'innovation',    label: 'Innovation',    color: 'bg-violet-500' },
    { key: 'technical',     label: 'Technical',     color: 'bg-blue-500' },
    { key: 'presentation',  label: 'Presentation',  color: 'bg-amber-500' },
    { key: 'documentation', label: 'Documentation', color: 'bg-emerald-500' },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><BarChart2 size={18} className="text-blue-500" /> Average by Category</h3>
      <div className="space-y-4">
        {categories.map(({ key, label, color }) => {
          const val = avg(key);
          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-slate-700">{label}</span>
                <span className="font-bold text-slate-900">{val.toFixed(1)}</span>
              </div>
              <MiniBar value={val} color={color} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategorySpread({ projects }) {
  const cats = {};
  projects.forEach(p => {
    if (!cats[p.category]) cats[p.category] = { count: 0, total: 0 };
    cats[p.category].count++;
    if (p.finalScore !== null) cats[p.category].total += p.finalScore;
  });

  return (
    <div className="glass-card rounded-2xl p-6 col-span-full">
      <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500" /> Project Categories</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(cats).map(([cat, { count, total }]) => {
          const avg = count > 0 && total > 0 ? (total / projects.filter(p => p.category === cat && p.finalScore !== null).length) : null;
          return (
            <div key={cat} className="p-4 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-xl">
              <p className="font-bold text-slate-800 text-sm">{cat}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{count}</p>
              <p className="text-xs text-slate-500">project{count !== 1 ? 's' : ''}</p>
              {avg !== null && (
                <p className="text-xs mt-2 font-bold text-primary-600">Avg: {avg.toFixed(1)}%</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { getProjectsForUser, allUsers } = useApp();
  const projects = getProjectsForUser();

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: projects.length, color: 'from-blue-500 to-blue-600' },
          { label: 'Graded', value: projects.filter(p => p.status === 'graded').length, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Pending', value: projects.filter(p => p.status !== 'graded').length, color: 'from-amber-500 to-amber-600' },
          { label: 'High Scores (≥90)', value: projects.filter(p => p.finalScore >= 90).length, color: 'from-violet-500 to-violet-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl p-5 bg-gradient-to-br ${color} text-white`}>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-black mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GradeDonut projects={projects} />
        <TopPerformers projects={projects} />
        <RubricBreakdown projects={projects} />
        <CategorySpread projects={projects} />
      </div>
    </div>
  );
}
