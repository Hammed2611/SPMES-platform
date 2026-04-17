import React, { useState } from 'react';
import API_BASE from '../config/api.js';
import { Users, Shield, Mail, GraduationCap, Calendar, Search, Plus, Trash2, X, AlertCircle, Download, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ROLE_BADGE = {
  lecturer: 'bg-blue-100 text-blue-700',
  student:  'bg-emerald-100 text-emerald-700',
  admin:    'bg-violet-100 text-violet-700',
};

export default function AdminUsers() {
  const { allUsers, projects, authFetch, refreshUsers, user: currentUser } = useApp();
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', department: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Leave blank for no change
      role: user.role || 'student',
      department: user.department || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'student', department: '' });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const url = editingUser ? `${API_BASE}/api/admin/users/${editingUser.id}` : `${API_BASE}/api/admin/users`;
      const method = editingUser ? 'PUT' : 'POST';
      
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        closeModal();
        refreshUsers();
      } else {
        setErrorMsg(data.error || 'Operation failed');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user ${name}?`)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) refreshUsers();
      else alert('Failed to delete user.');
    } catch (err) {
      alert('Error deleting user.');
    }
  };

  const filtered = allUsers.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
            <Users size={20} className="text-primary-500" /> User Management
          </h2>
          <p className="text-slate-500 text-sm">{allUsers.length} registered accounts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const csv = ['ID,Name,Email,Role,Department'].concat(
              filtered.map(u => `${u.id},"${u.name}","${u.email}",${u.role},"${u.department || ''}"`)
            ).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users_export.csv';
            a.click();
          }} className="btn-secondary py-2 px-4 rounded-xl flex items-center gap-2 text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition font-bold" title="Export CSV">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary py-2 px-4 rounded-xl flex items-center gap-2 text-sm">
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field-input pl-9 text-sm"
          />
        </div>
        {['all', 'lecturer', 'student', 'admin'].map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              roleFilter === r ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Projects</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => {
                const userProjects = projects.filter(p => p.studentId === u.id || p.lecturerId === u.id);
                const roleKey = u.role?.toLowerCase();
                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="avatar-sm shrink-0">{u.avatar || (u.name?.charAt(0) || '?')}</div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${ROLE_BADGE[roleKey] || 'bg-slate-100'}`}>
                        {roleKey || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{u.department}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 flex items-center gap-1">
                      <Mail size={11} className="text-slate-400" />{u.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                        {userProjects.length}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={11} className="text-slate-400" />{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : (u.joinDate || '—')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                       <div className="flex items-center justify-end gap-1">
                         <button onClick={() => openEditModal(u)} className="text-slate-400 hover:text-primary-500 transition-colors p-1" title="Edit User">
                           <Edit2 size={16} />
                         </button>
                         {u.id !== currentUser?.id && (
                           <button onClick={() => handleDeleteUser(u.id, u.name)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete User">
                             <Trash2 size={16} />
                           </button>
                         )}
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-20" />
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-slate-50/40 border-t border-slate-100 text-xs text-slate-400">
          Showing {filtered.length} of {allUsers.length} users
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-800">{editingUser ? 'Edit User' : 'Create New User'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-xs font-bold">
                  <AlertCircle size={14} className="shrink-0" /> {errorMsg}
                </div>
              )}
              
              <div>
                <label className="field-label">Full Name</label>
                <input required type="text" className="field-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
              </div>
              
              <div>
                <label className="field-label">Email Address</label>
                <input required type="email" className="field-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@university.edu" />
              </div>

              <div>
                <label className="field-label">{editingUser ? 'New Password (Optional)' : 'Temporary Password'}</label>
                <input required={!editingUser} type="password" minLength={6} className="field-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? 'Leave blank to keep current' : '••••••••'} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Role</label>
                  <select className="field-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Department</label>
                  <input type="text" className="field-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. Computer Science" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors disabled:opacity-50">
                  {isSubmitting ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
