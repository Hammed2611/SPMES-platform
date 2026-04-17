import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, ChevronRight, Plus, X, Download, FileText, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGradeBadgeClass, getGradeLetter, USERS } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { downloadProjectPDF } from '../utils/reportGenerator';
import API_BASE from '../config/api.js';

const STATUS_CONFIG = {
  graded:       { label: 'Graded',    cls: 'badge-green' },
  pending:      { label: 'Pending',   cls: 'badge-orange' },
  under_review: { label: 'In Review', cls: 'badge-blue' },
};

export function AddProjectModal({ onClose, onAdd, initialData }) {
  const { allUsers, user, authFetch, refreshProjects } = useApp();
  const [form, setForm] = useState({
    title: '', description: '', category: '', semester: '2024/2025 Sem 1',
    deadline: '', studentId: '', tags: '', lecturerId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        semester: initialData.semester || '2024/2025 Sem 1',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
        studentId: initialData.studentId || '',
        lecturerId: initialData.lecturerId || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''),
      });
    }
  }, [initialData]);

  const students = allUsers.filter(u => u.role === 'student');
  const lecturers = allUsers.filter(u => u.role === 'lecturer');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    // If student is creating/editing, they select a lecturer. If lecturer is creating, they are the lecturer.
    if (user?.role === 'student') {
      payload.studentId = user.id;
    } else if (user?.role === 'lecturer' && !initialData) {
      payload.lecturerId = user.id;
    }

    try {
      const url = initialData ? `${API_BASE}/api/projects/${initialData.id}` : `${API_BASE}/api/projects`;
      const method = initialData ? 'PUT' : 'POST';
      
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        refreshProjects();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save project');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-black text-slate-900">{initialData ? 'Edit Project' : 'Add New Project'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl">{error}</div>}
          <div>
            <label className="field-label">Project Title</label>
            <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. AI-Powered Chatbot" className="field-input w-full" />
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={3} placeholder="Brief project description…" className="field-input w-full resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Category</label>
              <input required value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} placeholder="e.g. AI & ML" className="field-input w-full" />
            </div>
            <div>
              <label className="field-label">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(p => ({...p, deadline: e.target.value}))} className="field-input w-full" />
            </div>
          </div>

          {user?.role !== 'student' ? (
            <div>
              <label className="field-label">Assign Student</label>
              <select required value={form.studentId} onChange={e => setForm(p => ({...p, studentId: e.target.value}))} className="field-input w-full">
                <option value="">Select a student…</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="field-label">Select Supervisor (Lecturer)</label>
              <select required value={form.lecturerId} onChange={e => setForm(p => ({...p, lecturerId: e.target.value}))} className="field-input w-full">
                <option value="">Select a supervisor…</option>
                {lecturers.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.department})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="field-label">Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} placeholder="Python, React, ML" className="field-input w-full" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving...' : initialData ? 'Update Project' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsView() {
  const { getProjectsForUser, setSelectedProjectId, user, allUsers } = useApp();
  const navigate = useNavigate();
  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const projects = getProjectsForUser();

  const filtered = projects.filter(p => {
    const student = allUsers.find(u => u.id === p.studentId);
    const matchSearch = p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        (student?.name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        p.category.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const canAdd = user?.role === 'lecturer' || user?.role === 'admin' || user?.role === 'student';

  const openAdd = () => { setEditingProject(null); setShowModal(true); };
  const openEdit = (p) => { setEditingProject(p); setShowModal(true); };

  return (
    <div className="space-y-6">
      {showModal && (
        <AddProjectModal
          onClose={() => setShowModal(false)}
          initialData={editingProject}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
            <ClipboardList size={20} className="text-primary-500" /> All Projects
          </h2>
          <p className="text-slate-500 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const csv = ['ID,Title,Category,Student,Lecturer,Status,Score'].concat(
              filtered.map(p => {
                const student = allUsers.find(u => u.id === p.studentId);
                const lecturer = allUsers.find(u => u.id === p.lecturerId);
                return `${p.id},"${p.title}","${p.category}","${student?.name || p.studentId}","${lecturer?.name || (p.lecturerId || 'Unassigned')}","${p.status}",${p.finalScore || ''}`;
              })
            ).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'projects_export.csv';
            a.click();
          }} className="btn-secondary py-2 px-4 rounded-xl flex items-center gap-2 text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition font-bold">
            <Download size={16} /> Export
          </button>
          {canAdd && (
            <button
              onClick={openAdd}
              className="btn-primary flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus size={17} /> Add Project
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field-input pl-9 text-sm w-full"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {['all', 'pending', 'under_review', 'graded'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'all' ? 'All' : f === 'under_review' ? 'In Review' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Project cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass-card rounded-2xl p-16 text-center text-slate-400">
            <ClipboardList size={40} className="mx-auto mb-2 opacity-20" />
            <p>No projects found.</p>
          </div>
        )}
        {filtered.map(p => {
          const student  = allUsers.find(u => u.id === p.studentId);
          const cfg      = STATUS_CONFIG[p.status?.toLowerCase()] || {};
          return (
            <div
              key={p.id}
              onClick={() => { setSelectedProjectId(p.id); navigate(`/app/grade/${p.id}`); }}
              className="glass-card rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer group border border-slate-100 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="avatar-sm shrink-0 bg-slate-100 text-slate-600 border border-slate-200">{student?.avatar || (student?.name?.charAt(0) || '?')}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase tracking-wider">{p.category}</span>
                      <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <h3 className="font-black text-slate-900 truncate text-lg group-hover:text-primary-600 transition-colors">{p.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Student: <span className="text-slate-800 font-bold">{student?.name}</span> · {p.semester}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-3">
                      {p.fileUrl && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`${API_BASE}/${p.fileUrl.replace(/\\/g, '/')}`, '_blank');
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <Download size={12} /> View Submission
                        </button>
                      )}
                      {(user?.role === 'admin' || user?.id === p.lecturerId || (user?.role === 'student' && p.status?.toLowerCase() === 'pending')) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(p);
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          <Edit2 size={12} /> Edit Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                  {p.finalScore !== null ? (
                    <div className="text-right">
                      <p className={`text-2xl font-black ${p.finalScore >= 80 ? 'text-emerald-600' : p.finalScore >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                        {p.finalScore.toFixed(1)}%
                      </p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getGradeBadgeClass(p.finalScore)}`}>
                        {getGradeLetter(p.finalScore)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-lg">Pending Evaluation</span>
                  )}
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
