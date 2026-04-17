import React, { useState, useEffect } from 'react';
import API_BASE from '../config/api.js';
import { Users, Link as LinkIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminAssign() {
  const { authFetch } = useApp();
  const [unassigned, setUnassigned] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMatrix = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/matrix`);
      const data = await res.json();
      if (res.ok) {
        setUnassigned(data.unassigned || []);
        setLecturers(data.lecturers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  const handleAssign = async (lecturerId) => {
    if (!selectedProject) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/projects/${selectedProject.id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ lecturerId })
      });
      if (res.ok) {
        setUnassigned(prev => prev.filter(p => p.id !== selectedProject.id));
        setLecturers(prev => prev.map(l => 
          l.id === lecturerId ? { ...l, workload: l.workload + 1 } : l
        ));
        setSelectedProject(null);
      } else {
        alert("Assignment failed on server.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAutoAssign = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/auto-assign`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        loadMatrix();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <LinkIcon className="text-primary-600" /> Assignment Matrix
          </h1>
          <p className="text-slate-500 mt-1">Link students/projects to evaluating lecturers</p>
        </div>
        <button onClick={handleAutoAssign} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors">
          <RefreshCw size={18} />
          Auto-Assign Routine
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Unassigned Projects */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex justify-between">
            <span>Unassigned Projects ({unassigned.length})</span>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {loading ? (
              <div className="text-center text-slate-400 py-10">Loading Matrix...</div>
            ) : unassigned.length === 0 ? (
              <div className="text-center text-slate-400 py-10 flex flex-col items-center">
                <CheckCircle2 size={40} className="mb-2 text-emerald-400" />
                No pending assignments
              </div>
            ) : (
              unassigned.map(proj => (
                <div 
                  key={proj.id} 
                  onClick={() => setSelectedProject(proj)}
                  className={`p-4 rounded-xl border ${selectedProject?.id === proj.id ? 'border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-500' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 cursor-pointer'} transition-all`}
                >
                  <p className="font-bold text-slate-900">{proj.title}</p>
                  <p className="text-sm text-slate-500 mt-1">Student: {proj.student?.name || proj.studentId || 'Pending'}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-xs font-semibold text-slate-500 rounded">
                    {proj.category || 'General'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Lecturers */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex justify-between">
            <span>Lecturers Directory</span>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {!selectedProject && (
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 p-4 rounded-xl flex items-start gap-3 mb-4">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">Select an unassigned project from the left panel to assign it to a lecturer below.</p>
              </div>
            )}
            
            {lecturers.map(lecturer => (
              <div 
                key={lecturer.id} 
                className="p-4 rounded-xl border border-slate-200 flex justify-between items-center bg-white"
              >
                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    <Users size={16} className="text-slate-400" /> {lecturer.name}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-slate-100 text-xs font-semibold text-slate-500 rounded">
                      {lecturer.department}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      lecturer.workload > 6 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      Workload: {lecturer.workload} projects
                    </span>
                  </div>
                </div>
                
                {selectedProject && (
                  <button 
                    onClick={() => handleAssign(lecturer.id)}
                    className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-all"
                  >
                    Assign Here
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal icon def
const CheckCircle2 = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);

