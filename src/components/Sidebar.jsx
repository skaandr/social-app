import { NavLink } from 'react-router-dom';
import { Bell, Compass, Home, LogOut, PenSquare, Settings, User } from 'lucide-react';
import Logo from './Logo';
import { useNotifications } from '../context/NotificationsContext';

export const NAV = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: true },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ onCompose, onLogout }) {
  const { unread } = useNotifications();
  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`;
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
      <NavLink to="/home" className="px-2" aria-label="Connectly home"><Logo /></NavLink>
      <nav aria-label="Main" className="mt-8 flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, badge }) => (
          <NavLink key={to} to={to} className={link}>
            <Icon size={20} /> <span className="flex-1">{label}</span>
            {badge && unread > 0 && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">{unread > 99 ? '99+' : unread}</span>}
          </NavLink>
        ))}
        <button onClick={onCompose} className="btn-primary mt-4"><PenSquare size={18} /> Create Post</button>
      </nav>
      <button onClick={onLogout} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"><LogOut size={20} /> Logout</button>
    </aside>
  );
}
