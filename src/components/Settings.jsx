import React, { useState, useEffect } from 'react';
import API_BASE from '../config/api.js';
import { User, Bell, Shield, Palette, LogOut, Save, CheckCircle2, Moon, Sun, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { user, logout, authFetch, setUser } = useApp();
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  // Load Preferences
  const [emailNotif, setEmailNotif] = useState(true);
  const [gradeAlert, setGradeAlert] = useState(true);
  const [deadlineReminder, setDeadlineReminder] = useState(true);

  useEffect(() => {
    const savedPrefs = localStorage.getItem('prefs');
    if (savedPrefs) {
      try {
        const p = JSON.parse(savedPrefs);
        setEmailNotif(p.emailNotif ?? true);
        setGradeAlert(p.gradeAlert ?? true);
        setDeadlineReminder(p.deadlineReminder ?? true);
      } catch(e) {}
    }
  }, []);

  const toggleDarkMode = (val) => {
    setDarkMode(val);
    if (val) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const [profile, setProfile] = useState({ name: user?.name || '', department: user?.department || '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg({ type: '', text: '' });
    
    try {
      let updatedUser = { ...user };

      // 1. Update Profile if changed
      if (profile.name !== user?.name || profile.department !== user?.department) {
        const pRes = await authFetch(`${API_BASE}/api/auth/profile`, {
          method: 'PUT',
          body: JSON.stringify(profile)
        });
        if (!pRes.ok) throw new Error('Failed to update profile');
        
        updatedUser = { ...updatedUser, ...profile };
      }

      // 2. Update Password if entered
      if (passwords.oldPassword && passwords.newPassword) {
        const pwRes = await authFetch(`${API_BASE}/api/auth/password`, {
          method: 'PUT',
          body: JSON.stringify(passwords)
        });
        const pwData = await pwRes.json();
        if (!pwRes.ok) throw new Error(pwData.error || 'Password update failed');
        
        setPasswords({ oldPassword: '', newPassword: '' });
      }

      // Sync Context
      setUser(updatedUser);

      // Persistence
      localStorage.setItem('prefs', JSON.stringify({ emailNotif, gradeAlert, deadlineReminder }));

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setStatusMsg({ type: 'success', text: 'Settings updated successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error saving settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const Toggle = ({ value, onChange, id }) => (
    <button
      id={id}
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-primary-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-6 max-w-2xl pb-10">
      {statusMsg.text && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${statusMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
           {statusMsg.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}
           {statusMsg.text}
        </div>
      )}
      
      {/* Profile */}
      <div className="glass-card rounded-2xl p-6 space-y-5 border border-slate-100 shadow-sm">
        <h3 className="font-black text-slate-800 flex items-center gap-2"><User size={18} className="text-primary-500"/> Profile</h3>

        <div className="flex items-center gap-4">
          <div className="avatar-xl bg-slate-100 text-slate-600 font-black border border-slate-200">{user?.avatar || user?.name?.charAt(0)}</div>
          <div>
            <p className="font-black text-slate-900 text-2xl leading-none">{user?.name}</p>
            <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
            <span className={`text-[10px] font-black mt-2 inline-block px-3 py-1 rounded-full capitalize ${
              user?.role === 'lecturer' ? 'bg-blue-100 text-blue-700' :
              user?.role === 'admin'   ? 'bg-violet-100 text-violet-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>{user?.role}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Full Name</label>
            <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="field-input w-full" />
          </div>
          <div>
            <label className="field-label">Email (Immutable)</label>
            <input value={user?.email || ''} type="email" className="field-input w-full bg-slate-50 text-slate-500" readOnly />
          </div>
          <div>
            <label className="field-label">Department</label>
            <input value={profile.department} onChange={e => setProfile({...profile, department: e.target.value})} className="field-input w-full" />
          </div>
          <div>
            <label className="field-label">Staff/Student ID</label>
            <input value={user?.id || ''} className="field-input w-full bg-slate-50 text-slate-500" readOnly />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-100 shadow-sm">
        <h3 className="font-black text-slate-800 flex items-center gap-2"><Bell size={18} className="text-amber-500"/> Notification Preferences</h3>
        {[
          { label: 'Email Notifications', sub: 'Receive updates via email', value: emailNotif, set: setEmailNotif, id: 'toggle-email' },
          { label: 'Grade Alerts',        sub: 'Be notified when a grade is posted', value: gradeAlert, set: setGradeAlert, id: 'toggle-grade' },
          { label: 'Deadline Reminders',  sub: 'Reminders 3 days before deadlines', value: deadlineReminder, set: setDeadlineReminder, id: 'toggle-deadline' },
        ].map(({ label, sub, value, set, id }) => (
          <div key={id} className="flex items-center justify-between py-1">
            <div>
              <p className="font-extrabold text-slate-800 text-sm">{label}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
            <Toggle value={value} onChange={set} id={id} />
          </div>
        ))}
      </div>

      {/* Appearance */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-100 shadow-sm">
        <h3 className="font-black text-slate-800 flex items-center gap-2"><Palette size={18} className="text-violet-500"/> Appearance</h3>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={18} className="text-slate-700"/> : <Sun size={18} className="text-amber-500"/>}
            <div>
              <p className="font-extrabold text-slate-800 text-sm">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-xs text-slate-500">Switch between light and dark theme</p>
            </div>
          </div>
          <Toggle value={darkMode} onChange={toggleDarkMode} id="toggle-dark" />
        </div>
      </div>

      {/* Security */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-100 shadow-sm">
        <h3 className="font-black text-slate-800 flex items-center gap-2"><Shield size={18} className="text-emerald-500"/> Security</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Current Password</label>
            <input type="password" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} placeholder="••••••••" className="field-input w-full" />
          </div>
          <div>
            <label className="field-label">New Password</label>
            <input type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} placeholder="••••••••" className="field-input w-full" />
          </div>
        </div>
        <p className="text-xs text-slate-400 font-medium italic">Use at least 8 characters with a mix of letters and numbers.</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-4">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 font-black text-sm transition-colors py-3 px-5 rounded-2xl bg-red-50/50 hover:bg-red-50"
        >
          <LogOut size={16} /> Sign Out
        </button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-emerald-600 font-black text-sm animate-fade-in">
              <CheckCircle2 size={16} /> Saved!
            </span>
          )}
          <button id="save-settings-btn" onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50 shadow-xl shadow-primary-500/20">
            {isSaving ? <span className="spinner w-4 h-4 border-white border-t-transparent" /> : <Save size={18}/>} 
            <span className="font-black">Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
