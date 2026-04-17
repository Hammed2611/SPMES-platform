import React, { useState } from 'react';
import {
  LayoutDashboard, Users, ClipboardList, BarChart2,
  Settings, LogOut, GraduationCap, Bell, ChevronLeft,
  ChevronRight, Shield, BookOpen, Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
const NAV_ITEMS = {
  lecturer: [
    { id: 'dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'projects',   label: 'Projects',       icon: ClipboardList },
    { id: 'analytics',  label: 'Analytics',      icon: BarChart2 },
    { id: 'students',   label: 'Students',       icon: Users },
  ],
  student: [
    { id: 'dashboard',  label: 'My Dashboard',   icon: LayoutDashboard },
    { id: 'projects',   label: 'My Project',      icon: BookOpen },
  ],
  admin: [
    { id: 'dashboard',  label: 'Overview',        icon: LayoutDashboard },
    { id: 'users',      label: 'Users',           icon: Users },
    { id: 'projects',   label: 'All Projects',    icon: ClipboardList },
    { id: 'analytics',  label: 'Analytics',       icon: BarChart2 },
    { id: 'audit',      label: 'Audit Log',       icon: Shield },
  ],
};

export default function Sidebar() {
  const { user, logout, unreadCount, sidebarOpen, setSidebarOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const items = NAV_ITEMS[user?.role?.toLowerCase()] || [];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        bg-slate-900 text-white transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-16'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 min-h-[68px]">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap size={20} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-black text-sm tracking-tight leading-none">SPMES</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Grading Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {items.map(({ id, label, icon: Icon }) => {
            const role = user?.role?.toUpperCase() || '';
            const path = role === 'ADMIN' ? `/admin/${id}` : `/app/${role === 'STUDENT' ? 'student/' : ''}${id}`;
            const active = location.pathname.includes(path);
            return (
              <button
                key={id}
                id={`nav-${id}`}
                onClick={() => navigate(path)}
                title={!sidebarOpen ? label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group relative
                  ${active
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon size={18} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
                {!sidebarOpen && (
                  <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-2 space-y-1">
          {/* Notifications bell */}
          <button
            id="nav-notifications"
            onClick={() => navigate(user?.role?.toUpperCase() === 'ADMIN' ? '/admin/dashboard' : '/app/notifications')}
            title={!sidebarOpen ? 'Notifications' : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all text-slate-400 hover:bg-white/10 hover:text-white relative
              ${location.pathname.includes('notifications') ? 'bg-white/10 text-white' : ''}
            `}
          >
            <div className="relative shrink-0">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {sidebarOpen && <span>Notifications</span>}
          </button>

          <button
            id="nav-settings"
            onClick={() => {
              const role = user?.role?.toUpperCase();
              navigate(role === 'ADMIN' ? '/admin/settings' : '/app/settings');
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all text-slate-400 hover:bg-white/10 hover:text-white
              ${location.pathname.includes('settings') ? 'bg-white/10 text-white' : ''}
            `}
          >
            <Settings size={18} className="shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </button>

          {/* User info */}
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-3 mt-1 bg-white/5 rounded-xl">
              <div className="avatar-sm shrink-0">{user?.avatar || '?'}</div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                <LogOut size={15} />
              </button>
            </div>
          )}
          {!sidebarOpen && (
            <button onClick={logout} className="w-full flex items-center justify-center py-2.5 text-slate-500 hover:text-red-400 transition-colors rounded-xl hover:bg-white/10" title="Logout">
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-600 transition-colors shadow-lg"
        >
          {sidebarOpen ? <ChevronLeft size={12}/> : <ChevronRight size={12}/>}
        </button>
      </aside>
    </>
  );
}
