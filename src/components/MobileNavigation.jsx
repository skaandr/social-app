import { NavLink } from 'react-router-dom';
import { Bell, Compass, Home, Plus, User } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';

export default function MobileNavigation({ onCompose }) {
  const { unread } = useNotifications();
  const cls = ({ isActive }) => `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${isActive ? 'text-brand-600' : 'text-slate-500'}`;
  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-30 flex items-center border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <NavLink to="/home" className={cls}><Home size={22} /> Home</NavLink>
      <NavLink to="/explore" className={cls}><Compass size={22} /> Explore</NavLink>
      <button onClick={onCompose} aria-label="Create post" className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700"><Plus size={24} /></button>
      <NavLink to="/notifications" className={cls}>
        <Bell size={22} /> Alerts
        {unread > 0 && <span className="absolute right-[28%] top-1 h-2.5 w-2.5 rounded-full bg-red-500"><span className="sr-only">{unread} unread</span></span>}
      </NavLink>
      <NavLink to="/profile" className={cls}><User size={22} /> Profile</NavLink>
    </nav>
  );
}
