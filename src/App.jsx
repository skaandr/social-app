import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Explore from './pages/Explore';
import PostDetails from './pages/PostDetails';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';

function Splash() {
  return <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading"><div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" /></div>;
}

function Protected() {
  const { isAuthed, booting, token } = useAuth();
  const location = useLocation();
  if (booting || (token && !isAuthed)) return <Splash />;
  if (!isAuthed) return <Navigate to="/auth" replace state={{ from: location.pathname + location.search }} />;
  return <AppLayout />;
}

function GuestOnly() {
  const { isAuthed, booting } = useAuth();
  if (booting) return <Splash />;
  return isAuthed ? <Navigate to="/home" replace /> : <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/auth" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
      </Route>
      <Route element={<Protected />}>
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/posts/:postId" element={<PostDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/change-password" element={<ChangePassword />} />
      </Route>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
