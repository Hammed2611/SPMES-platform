import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API_BASE from '../config/api.js';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // UI State
  const [isAuthRestoring, setIsAuthRestoring] = useState(true);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Helper for authenticated requests
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    
    // Only set application/json if not sending FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(url, { ...options, headers });
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/projects`);
      if (res.ok) {
        const pData = await res.json();
        setProjects(pData);
      }
    } catch (err) { console.error(err); }
  }, [authFetch]);

  const refreshUsers = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/users`);
      if (res.ok) {
        const uData = await res.json();
        setAllUsers(uData);
      }
    } catch (err) { console.error(err); }
  }, [authFetch]);

  // Session Restoration
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthRestoring(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
      } finally {
        setIsAuthRestoring(false);
      }
    };
    restoreSession();
  }, []);

  // Fetch initial data & handle SSE when user logs in
  useEffect(() => {
    let sse;

    if (user) {
      const loadInitialData = async () => {
        setIsInitialDataLoading(true);
        try {
          const [pRes, nRes, uRes, aRes] = await Promise.all([
            authFetch(`${API_BASE}/api/projects`),
            authFetch(`${API_BASE}/api/system/notifications`),
            authFetch(`${API_BASE}/api/admin/users`),
            authFetch(`${API_BASE}/api/admin/audit`)
          ]);

          if (pRes.ok) setProjects(await pRes.json());
          if (uRes.ok) setAllUsers(await uRes.json());
          if (aRes.ok) setAuditLogs(await aRes.json());
          
          if (nRes.ok) {
            const nData = await nRes.json();
            setNotifications(nData);
            setUnreadCount(nData.filter(n => !n.read).length);
          }

          // Setup SSE
          const token = localStorage.getItem('token');
          if (token) {
            sse = new EventSource(`${API_BASE}/api/system/stream?token=${token}`);
            sse.onmessage = (event) => {
              try {
                const { type, data } = JSON.parse(event.data);
                if (type === 'NEW_NOTIFICATION') {
                  setNotifications(prev => [data, ...prev]);
                  setUnreadCount(c => c + 1);
                }
              } catch (e) {}
            };
            sse.onerror = () => {
              console.warn('SSE stream encountered an error.');
            };
          }
        } catch (err) {
          console.error('Initial data load failed:', err);
        } finally {
          setIsInitialDataLoading(false);
        }
      };
      loadInitialData();
    }

    return () => {
      if (sse) {
        console.log('Cleaning up SSE connection');
        sse.close();
      }
    };
  }, [user, authFetch]);

  // Auth Functions
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err) {
      return { success: false, error: 'Database connection failed' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err) {
      return { success: false, error: 'Database connection failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProjects([]);
    setNotifications([]);
    setUnreadCount(0);
  };

  const getProjectsForUser = useCallback(() => {
    if (!user) return [];
    if (user.role?.toUpperCase() === 'ADMIN') return projects;
    return projects.filter(p => p.studentId === user.id || p.lecturerId === user.id);
  }, [user, projects]);

  const saveGrade = async (projectId, rubric, finalScore) => {
    try {
      const res = await authFetch(`${API_BASE}/api/grading/${projectId}`, {
        method: 'POST',
        body: JSON.stringify({ rubric, finalScore })
      });
      if (res.ok) {
        refreshProjects();
        return true;
      }
    } catch (err) {
      console.error('Grade save failed:', err);
    }
    return false;
  };

  const markNotificationsRead = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/system/notifications/read`, { method: 'POST' });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <AppContext.Provider value={{
      user, setUser, login, register, logout,
      projects, refreshProjects,
      allUsers, refreshUsers,
      notifications, unreadCount, markNotificationsRead,
      auditLogs,
      isAuthRestoring, isInitialDataLoading,
      sidebarOpen, setSidebarOpen,
      selectedProjectId, setSelectedProjectId,
      authFetch, saveGrade, getProjectsForUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
