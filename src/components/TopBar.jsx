import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title, subtitle, onSearch, portalType }) {
  const { user, unreadCount, setSidebarOpen, sidebarOpen } = useApp();
  const navigate = useNavigate();

  return (
    <header className="h-17 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setSidebarOpen(v => !v)}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={15} />
          <input
            type="text"
            placeholder="Search…"
            onChange={e => onSearch?.(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm bg-slate-100 hover:bg-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 border border-transparent rounded-xl outline-none transition-all w-48 focus:w-72"
          />
        </div>

        {/* Notification bell */}
        <button
          id="topbar-notifications"
          onClick={() => navigate(portalType === 'ADMIN' ? '/admin/audit' : '/app/notifications')}
          className={`relative p-2.5 rounded-xl transition-all group ${unreadCount > 0 ? 'text-primary-600 bg-primary-50/50' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'}`}
          title="Notifications"
        >
          <Bell size={20} className={unreadCount > 0 ? 'animate-shake' : 'group-hover:animate-shake'} strokeWidth={2.5} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm shadow-red-500/50" />
          )}
        </button>

        {/* Avatar */}
        <div className="avatar-sm cursor-default" title={user?.name}>{user?.avatar}</div>
      </div>
    </header>
  );
}
