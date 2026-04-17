import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, UserPlus, User, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config/api.js';

export default function Login() {
  const { login, register } = useApp();
  const navigate = useNavigate();

  // Mode: 'login' | 'register' | '2fa' | 'forgot'
  const [mode, setMode] = useState('login');

  // Login state
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [totp, setTotp]         = useState('');

  // Register state
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', role: 'student', department: '', matricNumber: '', staffId: ''
  });
  const [showRegPw, setShowRegPw] = useState(false);

  // Forgot Password state
  const [forgotForm, setForgotForm] = useState({
    email: '', role: 'student', idNumber: '', newPassword: ''
  });
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuccessfulLogin = (userRole) => {
    const role = userRole?.toLowerCase();
    if (role === 'student') navigate('/app/student/dashboard');
    else navigate('/app/dashboard');
  };

  // ── Login Submit ──────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
      } else {
        handleSuccessfulLogin(result.user.role);
      }
    } else {
      // 2FA verification (demo bypass)
      if (totp.length === 6 && totp === '000000') {
        const result = await login(email, password);
        if (!result.success) { setError(result.error); switchMode('login'); }
        else handleSuccessfulLogin(result.user.role);
      } else {
        setError('Invalid verification code.');
      }
    }
    setLoading(false);
  };

  // ── Register Submit ───────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(regForm);
    if (!result.success) {
      setError(result.error);
    } else {
      handleSuccessfulLogin(result.user.role);
    }
    setLoading(false);
  };

  // ── Forgot Password Submit ────────────────────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotForm)
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMsg(data.message);
        setTimeout(() => switchMode('login'), 3000);
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError('Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setTotp('');
  };

  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-4">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className={`w-16 h-16 bg-gradient-to-br from-primary-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary-500/30 transition-transform duration-500 ${mode === '2fa' ? 'scale-75' : ''}`}>
              {mode === '2fa' ? <Lock size={24} className="text-white" /> : <GraduationCap size={32} className="text-white" />}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : mode === '2fa' ? 'Secure Verification' : 'SPMES Portal'}
            </h1>
            <p className="text-slate-500 text-sm mt-1 text-center">
              {mode === 'register'
                ? 'Join SPMES with your own details'
                : mode === 'forgot'
                ? 'Verify your identity to reset password'
                : mode === '2fa'
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Student Project Management & Evaluation System'}
            </p>
          </div>

          {/* Tab switcher (Login / Register) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'register' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="field-label">Email Address</label>
                <div className="relative">
                  <Mail className="field-icon" size={16} />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="field-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Password</label>
                <div className="relative">
                  <Lock className="field-icon" size={16} />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="field-input pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm">
                  {successMsg}
                </div>
              )}

              <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-base mt-2">
                {loading ? <span className="spinner" /> : <><ArrowRight size={18}/> Sign In</>}
              </button>
              
              <div className="text-center mt-4">
                <button type="button" onClick={() => switchMode('forgot')} className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline">
                  Forgot your password?
                </button>
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="field-label">Full Name</label>
                <div className="relative">
                  <User className="field-icon" size={16} />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regForm.name}
                    onChange={e => setRegForm({...regForm, name: e.target.value})}
                    placeholder="e.g. James Wilson"
                    className="field-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Email Address</label>
                <div className="relative">
                  <Mail className="field-icon" size={16} />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regForm.email}
                    onChange={e => setRegForm({...regForm, email: e.target.value})}
                    placeholder="you@university.edu"
                    className="field-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Password</label>
                <div className="relative">
                  <Lock className="field-icon" size={16} />
                  <input
                    id="reg-password"
                    type={showRegPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regForm.password}
                    onChange={e => setRegForm({...regForm, password: e.target.value})}
                    placeholder="Min. 6 characters"
                    className="field-input pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowRegPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showRegPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">I am a...</label>
                  <select
                    id="reg-role"
                    value={regForm.role}
                    onChange={e => setRegForm({...regForm, role: e.target.value})}
                    className="field-input w-full"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Department</label>
                  <div className="relative">
                    <Building className="field-icon" size={16} />
                    <input
                      id="reg-department"
                      type="text"
                      value={regForm.department}
                      onChange={e => setRegForm({...regForm, department: e.target.value})}
                      placeholder="e.g. CS"
                      className="field-input pl-10"
                    />
                  </div>
                </div>
              </div>
                
              <div>
                {regForm.role === 'student' ? (
                  <div>
                    <label className="field-label">Matriculation No.</label>
                    <div className="relative">
                      <User className="field-icon" size={16} />
                      <input
                        id="reg-matric"
                        type="text"
                        required
                        value={regForm.matricNumber}
                        onChange={e => setRegForm({...regForm, matricNumber: e.target.value})}
                        placeholder="e.g. 19/CS/001"
                        className="field-input pl-10"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="field-label">Staff ID</label>
                    <div className="relative">
                      <User className="field-icon" size={16} />
                      <input
                        id="reg-staff"
                        type="text"
                        required
                        value={regForm.staffId}
                        onChange={e => setRegForm({...regForm, staffId: e.target.value})}
                        placeholder="e.g. STF-001"
                        className="field-input pl-10"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
              )}

              <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-base mt-2">
                {loading ? <span className="spinner" /> : <><UserPlus size={18}/> Create Account</>}
              </button>
            </form>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4 animate-fade-in">
               <div>
                <label className="field-label">Account Role</label>
                <select
                  value={forgotForm.role}
                  onChange={e => setForgotForm({...forgotForm, role: e.target.value})}
                  className="field-input w-full"
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                </select>
              </div>

              <div>
                <label className="field-label">Email Address</label>
                <div className="relative">
                  <Mail className="field-icon" size={16} />
                  <input
                    type="email"
                    required
                    value={forgotForm.email}
                    onChange={e => setForgotForm({...forgotForm, email: e.target.value})}
                    placeholder="you@university.edu"
                    className="field-input pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="field-label">{forgotForm.role === 'student' ? 'Matriculation No.' : 'Staff ID'}</label>
                <div className="relative">
                  <User className="field-icon" size={16} />
                  <input
                    type="text"
                    required
                    value={forgotForm.idNumber}
                    onChange={e => setForgotForm({...forgotForm, idNumber: e.target.value})}
                    placeholder={forgotForm.role === 'student' ? 'e.g. 19/CS/001' : 'e.g. STF-001'}
                    className="field-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">New Password</label>
                <div className="relative">
                  <Lock className="field-icon" size={16} />
                  <input
                    type={showForgotPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={forgotForm.newPassword}
                    onChange={e => setForgotForm({...forgotForm, newPassword: e.target.value})}
                    placeholder="Min. 6 characters"
                    className="field-input pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowForgotPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showForgotPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm">
                  {successMsg}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-base mt-2">
                {loading ? <span className="spinner" /> : 'Reset Password'}
              </button>
              
              <div className="text-center mt-4">
                <button type="button" onClick={() => switchMode('login')} className="text-sm font-bold text-slate-400 hover:text-slate-600 underline">
                  Back to login
                </button>
              </div>
            </form>
          )}

          {/* ── 2FA FORM ── */}
          {mode === '2fa' && (
            <div className="animate-fade-in space-y-6">
              <form onSubmit={handleLoginSubmit} className="space-y-6 text-center">
                <div className="relative group">
                  <div className="flex justify-center gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-12 h-14 bg-slate-100 border-2 rounded-xl flex items-center justify-center transition-all ${totp.length === i ? 'border-primary-500 shadow-md scale-105' : 'border-slate-200'}`}
                      >
                        <span className="text-xl font-black text-primary-600">{totp[i] || ''}</span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    autoComplete="one-time-code"
                    value={totp}
                    onChange={e => setTotp(e.target.value.replace(/\D/g, ''))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                  />
                </div>

                <p className="text-xs text-slate-400">Type the 6-digit code above</p>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm justify-center">
                    <AlertCircle size={14} className="shrink-0" /> {error}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <button type="submit" disabled={loading || totp.length < 6} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-base disabled:opacity-50">
                    {loading ? <span className="spinner" /> : 'Verify & Sign In'}
                  </button>
                  <button type="button" onClick={() => switchMode('login')} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline">
                    Back to login
                  </button>
                </div>
              </form>

              <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                <p className="text-[10px] text-primary-700 font-bold leading-relaxed text-center italic">
                  Demo Mode: Use <strong>000000</strong> as the verification code.
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">SPMES v2.0 &bull; Secured by 256-bit TLS</p>
        </div>
      </div>
    </div>
  );
}
