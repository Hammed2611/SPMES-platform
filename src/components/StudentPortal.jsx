import React, { useState } from 'react';
import API_BASE from '../config/api.js';
import { BookOpen, CheckCircle2, Clock, Award, Star, MessageSquare, TrendingUp, Upload, X, AlertCircle, Sparkles, FileText, Plus } from 'lucide-react';

import { useApp } from '../context/AppContext';
import { getGradeLetter, getGradeBadgeClass } from '../data/mockData';
import { downloadProjectPDF } from '../utils/reportGenerator';
import { AddProjectModal } from './ProjectsView';


const RUBRIC_LABELS = {
  innovation:    'Innovation & Creativity',
  technical:     'Technical Execution',
  presentation:  'Presentation',
  documentation: 'Documentation',
};

export default function StudentPortal() {
  const { user, projects, allUsers, setSelectedProjectId, authFetch, refreshProjects, isInitialDataLoading } = useApp();

  const myProjects = projects.filter(p => p.studentId === user?.id);
  const graded     = myProjects.filter(p => p.finalScore !== null);
  const avg        = graded.length
    ? graded.reduce((s, p) => s + p.finalScore, 0) / graded.length
    : null;

  const [submitProjectId, setSubmitProjectId] = useState(null);
  const [file, setFile] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const addProject = async (projectData) => {
    try {
      const res = await authFetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        refreshProjects();
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Failed to add project:', err);
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!submitProjectId) return;
    setIsSubmitting(true);
    setSubmitError('');

    const formData = new FormData();
    if (file) formData.append('projectFile', file);

    try {
      const res = await authFetch(`${API_BASE}/api/projects/${submitProjectId}/submit`, {
        method: 'POST',
        // Omit Content-Type so browser sets boundary for multipart/form-data
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        setSubmitProjectId(null);
        setFile(null);
        refreshProjects();
      } else {
        const data = await res.json();
        setSubmitError(data.error || 'Failed to submit');
      }
    } catch (err) {
      setSubmitError('Network failure occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* High-Visibility Hero Section */}
      <div className="welcome-banner rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden mb-8 shadow-2xl shadow-primary-900/40 border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              </div>
              <span className="text-sky-100 text-xs font-black uppercase tracking-[0.3em]">Student Portal v2.0</span>
            </div>
            <p className="text-sky-100/70 text-lg font-medium">Hello, welcome back</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-1 bg-gradient-to-r from-white to-sky-100 bg-clip-text text-transparent italic">
              {user?.name}
            </h2>
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-sky-100/80 text-[11px] font-bold bg-white/10 py-2.5 px-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/15 transition-all cursor-default uppercase">
                🏛️ {user?.department || 'University'}
              </span>
              <span className="text-sky-100/80 text-[11px] font-bold bg-white/10 py-2.5 px-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/15 transition-all cursor-default">
                🆔 {user?.id}
              </span>
            </div>
          </div>
          
          <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/10 p-8 rounded-[2rem] backdrop-blur-2xl border border-white/10 text-center shadow-2xl overflow-hidden group hover:bg-white/15 transition-all min-w-[220px]">
               <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                 <CheckCircle2 size={48} />
               </div>
              <p className="text-[10px] text-sky-100/60 font-black uppercase tracking-[0.4em] mb-2">Academic Session</p>
              <p className="text-3xl font-black bg-gradient-to-b from-white to-sky-200 bg-clip-text text-transparent">24 / 25</p>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-emerald-400 font-black flex items-center justify-center gap-2 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Connection Active
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="banner-circle banner-circle-1" />
        <div className="banner-circle banner-circle-2" />
        <div className="banner-circle banner-circle-3" />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isInitialDataLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-3xl p-6 bg-slate-100 animate-pulse border border-slate-200">
              <div className="w-16 h-2 bg-slate-200 rounded mb-2"></div>
              <div className="w-12 h-8 bg-slate-300 rounded"></div>
            </div>
          ))
        ) : (
          [
            { label: 'My Projects', value: myProjects.length, color: 'from-blue-500 to-blue-600' },
            { label: 'Completed',  value: graded.length,      color: 'from-emerald-500 to-emerald-600' },
            { label: 'CGPA Avg',   value: avg ? `${avg.toFixed(1)}%` : '—', color: 'from-violet-500 to-violet-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-3xl p-6 bg-gradient-to-br ${color} text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all`}>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
              <p className="text-3xl font-black mt-1">{value}</p>
            </div>
          ))
        )}
        {/* ADD Project Card for Students */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="rounded-3xl p-6 bg-white border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary-400 hover:text-primary-600 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="p-3 bg-slate-50 group-hover:bg-primary-50 rounded-2xl transition-all">
            <Plus size={24} />
          </div>
          <span className="font-bold text-xs uppercase tracking-widest">Propose Project</span>
        </button>
      </div>

      {/* Project content area */}
      {myProjects.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center text-slate-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-bold">No projects assigned yet.</p>
          <p className="text-sm mt-1 mb-6">Your lecturer will add your project here, or you can propose one yourself.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} /> Propose New Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-black text-slate-800">Your Projects</h3>
          {myProjects.map(p => {
            const lecturer = allUsers.find(u => u.id === p.lecturerId);
            const isGraded = p.finalScore !== null;
            return (
              <div key={p.id} className="glass-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Top banner */}
                <div className={`h-1.5 w-full ${isGraded ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`} />

                <div className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-primary-50 text-primary-600 px-2 py-0.5 rounded uppercase tracking-wider">
                          {p.category}
                        </span>
                        {isGraded
                          ? <span className="badge badge-green"><CheckCircle2 size={10} className="inline mr-1"/>Graded</span>
                          : <span className="badge badge-orange"><Clock size={10} className="inline mr-1"/>Pending Submission</span>
                        }
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{p.title}</h3>
                      <p className="text-slate-500 text-sm mt-1">{p.description}</p>
                      
                      {p.status?.toLowerCase() === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => setSubmitProjectId(p.id)}
                            className="text-xs font-black bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                          >
                            <Upload size={14} /> Submit Final
                          </button>
                          <button 
                            onClick={() => { setEditingProject(p); setShowAddModal(true); }}
                            className="text-xs font-black bg-slate-100 text-slate-600 px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-slate-200 transition"
                          >
                            <FileText size={14} /> Edit Details
                          </button>
                        </div>
                      )}
                    </div>
                    {isGraded && (
                      <div className="shrink-0 text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200">
                        <p className={`text-4xl font-black ${getGradeBadgeClass(p.finalScore).replace('bg-', 'text-').split(' ')[0]}`}>
                          {getGradeLetter(p.finalScore)}
                        </p>
                        <p className="text-sm font-bold text-slate-700">{p.finalScore?.toFixed(1)}%</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Final Grade</p>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.isArray(p.tags) && p.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">{tag}</span>
                    ))}
                  </div>

                  {/* Rubric breakdown if graded */}
                  {isGraded && (
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp size={12} /> Score Breakdown
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {p.rubric && Object.entries(p.rubric).map(([key, data]) => (
                          <div key={key} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-600">{RUBRIC_LABELS[key] || key}</span>
                              <span className="font-bold text-slate-800">{data.score}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${data.score >= 80 ? 'bg-emerald-500' : data.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${data.score}%` }}
                              />
                            </div>
                            {data.comment && (
                              <p className="text-[11px] text-slate-500 italic">"{data.comment}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 flex justify-end">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const scLecturer = allUsers.find(u => u.id === p.lecturerId);
                            downloadProjectPDF(p, user, scLecturer);
                          }}
                          className="flex items-center gap-2 py-2.5 px-5 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-500/20"
                        >
                          <FileText size={14} /> Download Final Result Sheet
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Peer reviews */}
                  {p.peerReviews?.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Star size={12}/> Peer Reviews ({p.peerReviews.length})
                      </h4>
                      {p.peerReviews.map((rev, i) => {
                        const reviewer = allUsers.find(u => u.id === rev.reviewerId);
                        return (
                          <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl text-sm">
                            <div className="avatar-xs shrink-0">{reviewer?.avatar || '?'}</div>
                            <div>
                              <p className="font-bold text-slate-700">{reviewer?.name || 'Peer'}</p>
                              <p className="text-slate-500 text-xs mt-0.5">{rev.comment}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${getGradeBadgeClass(rev.score)}`}>
                                {rev.score}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                    <span>Submitted: {p.submittedAt || 'Not Submitted'}</span>
                    <span>Supervisor: {lecturer?.name || '—'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {submitProjectId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-fade-in relative">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                 <h3 className="font-black text-slate-900 text-xl">Submit Project</h3>
                 <p className="text-xs text-slate-500 mt-1">Confirm your file and final submission.</p>
              </div>
              <button onClick={() => { setSubmitProjectId(null); setFile(null); setSubmitError(''); }} className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-slate-600 transition-all border border-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitProject} className="p-8 space-y-6">
              {submitError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl text-xs font-bold border border-red-100">
                  <AlertCircle size={14} className="shrink-0" /> {submitError}
                </div>
              )}
              
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:bg-slate-50 hover:border-primary-400 transition-all relative cursor-pointer group">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-50 transition-all">
                  <Upload size={32} className="text-slate-400 group-hover:text-primary-600 transition-all" />
                </div>
                <p className="font-extrabold text-slate-800 text-sm">{file ? file.name : 'Click or drag file to upload'}</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold">PDF, ZIP, or RAR (Max 10MB)</p>
                <input 
                  type="file" 
                  onChange={e => setFile(e.target.files[0])} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".pdf,.zip,.rar,.docx"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => { setSubmitProjectId(null); setFile(null); }} className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 text-sm font-black hover:bg-slate-50 transition-all active:scale-95">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || !file} className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:scale-100 active:scale-95">
                  {isSubmitting ? 'Uploading...' : 'Final Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add/Edit Project Modal */}
      {showAddModal && (
        <AddProjectModal 
          onClose={() => { setShowAddModal(false); setEditingProject(null); }}
          initialData={editingProject}
        />
      )}
    </div>
  );
}
