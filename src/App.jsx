import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Components
import Login         from './components/Login';
import AdminLogin    from './components/AdminLogin';
import Sidebar       from './components/Sidebar';
import TopBar        from './components/TopBar';
import Dashboard     from './components/Dashboard';
import GradeForm     from './components/GradeForm';
import Analytics     from './components/AnalyticsDashboard';
import StudentsView  from './components/StudentsView';
import StudentPortal from './components/StudentPortal';
import ProjectsView  from './components/ProjectsView';
import Notifications from './components/Notifications';
import Settings      from './components/Settings';
import AdminUsers    from './components/AdminUsers';
import AdminAuditLog from './components/AdminAuditLog';
import AdminDashboard from './components/AdminDashboard'; // New
import AdminAssign   from './components/AdminAssign'; // New

// ─── Layout Wrappers ──────────────────────────────────────────────────────────

/**
 * Shared Layout mapping the sidebar and topbar.
 * Used for both Admin and Academic portals.
 */
function PortalLayout({ portalType }) {
  const { user, sidebarOpen } = useApp();
  
  if (!user) {
    return <Navigate to={portalType === 'ADMIN' ? '/admin/login' : '/app/login'} replace />;
  }
  
  // Guard
  const userRole = user.role?.toUpperCase() || '';
  if (portalType === 'ADMIN' && userRole !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  if (portalType === 'ACADEMIC' && userRole === 'ADMIN') {
    return <Navigate to="/app/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar portalType={portalType} />
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '16rem' : '4rem' }}
      >
        <TopBar portalType={portalType} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function RoleGuard({ allowedRoles }) {
  const { user } = useApp();
  const userRole = user?.role?.toUpperCase() || '';
  if (!allowedRoles.includes(userRole)) {
    return <div className="p-8 text-center text-red-500 font-bold">Access Denied: Insufficient Permissions</div>;
  }
  return <Outlet />;
}

// ─── Router Configuration ─────────────────────────────────────────────────────

function AppRouter() {
  const { isAuthRestoring, user } = useApp();
  
  // Only block the entire app while verifying a token (before user is set)
  if (isAuthRestoring && !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse text-sm">Synchronizing Session...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/app/login" replace />} />

        {/* ─── ADMIN PORTAL ─── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<PortalLayout portalType="ADMIN" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="projects" element={<ProjectsView />} />
          <Route path="assign" element={<AdminAssign />} />
          <Route path="audit" element={<AdminAuditLog />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ─── ACADEMIC PORTAL ─── */}
        <Route path="/app/login" element={<Login />} />

        <Route path="/app" element={<PortalLayout portalType="ACADEMIC" />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Lecturer Routes */}
          <Route element={<RoleGuard allowedRoles={['LECTURER']} />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ProjectsView />} />
            <Route path="students" element={<StudentsView />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="grade/:projectId" element={<GradeForm />} />
          </Route>

          {/* Student Routes */}
          <Route element={<RoleGuard allowedRoles={['STUDENT']} />}>
            <Route path="student/dashboard" element={<StudentPortal />} />
            <Route path="student/projects" element={<ProjectsView />} />
          </Route>

          {/* Shared Academic */}
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-All */}
        <Route path="*" element={<div className="p-8 text-center font-bold">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
