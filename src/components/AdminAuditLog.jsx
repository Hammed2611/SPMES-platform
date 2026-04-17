import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Clock, User, Download } from 'lucide-react';
import { USERS } from '../data/mockData';

const ACTION_COLOR = {
  GRADE_FINALIZED: 'bg-emerald-100 text-emerald-700',
  USER_CREATED:    'bg-blue-100 text-blue-700',
  LOGIN:           'bg-slate-100 text-slate-600',
};

export default function AdminAuditLog() {
  const { auditLog, allUsers } = useApp();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-violet-600" />
          <h2 className="font-black text-slate-800 text-lg">Audit Log</h2>
        </div>
        <button onClick={() => {
          const csv = ['Timestamp,User,Action,Target,Details'].concat(
            auditLog.map(entry => {
              const actor = allUsers.find(u => u.id === entry.userId);
              return `"${new Date(entry.timestamp).toISOString()}", "${actor?.name || entry.userId}", "${entry.action}", "${entry.target || ''}", "${entry.details || ''}"`;
            })
          ).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'audit_log_export.csv';
          a.click();
        }} className="btn-secondary py-2 px-4 rounded-xl flex items-center gap-2 text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition font-bold" title="Export CSV">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {auditLog.map(entry => {
                const actor = allUsers.find(u => u.id === entry.userId);
                const ts = new Date(entry.timestamp);
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {ts.toLocaleDateString()} {ts.toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="avatar-xs">{actor?.avatar || '?'}</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{actor?.name || entry.userId}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{actor?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${ACTION_COLOR[entry.action] || 'bg-slate-100 text-slate-600'}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-slate-600">{entry.target}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{entry.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
