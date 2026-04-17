import React, { useState } from 'react';
import { Bell, CheckCheck, AlertCircle, Clock, Star, Monitor } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TYPE_CONFIG = {
  grade:      { icon: Star,         color: 'text-amber-500',   bg: 'bg-amber-50' },
  submission: { icon: AlertCircle,  color: 'text-blue-500',    bg: 'bg-blue-50' },
  deadline:   { icon: Clock,        color: 'text-red-500',     bg: 'bg-red-50' },
  review:     { icon: Star,         color: 'text-violet-500',  bg: 'bg-violet-50' },
  system:     { icon: Monitor,      color: 'text-slate-500',   bg: 'bg-slate-50' },
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllRead } = useApp();

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-slate-800 text-lg">Notifications</h2>
          <p className="text-slate-500 text-sm">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:underline"
          >
            <CheckCheck size={16}/> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center text-slate-400">
            <Bell size={40} className="mx-auto mb-2 opacity-20" />
            <p>You're all caught up!</p>
          </div>
        )}
        {notifications.map(n => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
          const Icon = cfg.icon;
          return (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`glass-card rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-md ${
                !n.read ? 'border-l-4 border-primary-500' : 'opacity-70'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${cfg.bg} ${cfg.color} shrink-0`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.read ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">{n.date}</p>
              </div>
              {!n.read && (
                <span className="w-2.5 h-2.5 bg-primary-500 rounded-full shrink-0 mt-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
