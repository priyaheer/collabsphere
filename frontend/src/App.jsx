import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import Notes from './pages/Notes.jsx';
import NoteEditor from './pages/NoteEditor.jsx';
import Files from './pages/Files.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import ReadmeGenerator from './pages/ReadmeGenerator.jsx';
import Analytics from './pages/Analytics.jsx';
import Members from './pages/Members.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Notifications from './pages/Notifications.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PublicProject from './pages/PublicProject.jsx';
import NotFound from './pages/NotFound.jsx';

import { useAuth } from './context/AuthContext.jsx';
import { Spinner } from './components/common/Spinner.jsx';
import { LogoMark } from './components/common/Logo.jsx';

/** Boot screen shown while the session is restored from the token. */
function AppBoot() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base">
      <LogoMark size={34} />
      <Spinner size={18} className="text-muted" />
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AppBoot />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function RedirectIfAuthed({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AppBoot />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

/** Each navigation starts at the top and fades in — one motion, not many. */
function RouteTransition({ children }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}

const protect = (element) => (
  <RequireAuth>
    <RouteTransition>{element}</RouteTransition>
  </RequireAuth>
);

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/public/project/:projectId" element={<PublicProject />} />

      {/* Authentication */}
      <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
      <Route path="/register" element={<RedirectIfAuthed><Register /></RedirectIfAuthed>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Workspace */}
      <Route path="/dashboard" element={protect(<Dashboard />)} />
      <Route path="/projects" element={protect(<Projects scope="mine" />)} />
      <Route path="/projects/:projectId" element={protect(<ProjectDetails />)} />
      <Route path="/shared" element={protect(<Projects scope="shared" />)} />
      <Route path="/notes" element={protect(<Notes />)} />
      <Route path="/notes/new" element={protect(<NoteEditor />)} />
      <Route path="/notes/:noteId" element={protect(<NoteEditor />)} />
      <Route path="/files" element={protect(<Files />)} />
      <Route path="/ai" element={protect(<AIAssistant />)} />
      <Route path="/readme" element={protect(<ReadmeGenerator />)} />
      <Route path="/analytics" element={protect(<Analytics />)} />
      <Route path="/team" element={protect(<Members />)} />
      <Route path="/notifications" element={protect(<Notifications />)} />
      <Route path="/search" element={protect(<SearchPage />)} />
      <Route path="/profile" element={protect(<Profile />)} />
      <Route path="/settings" element={protect(<Settings />)} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
