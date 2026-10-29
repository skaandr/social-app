import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, KeyRound, LogOut, User } from 'lucide-react';
import Avatar from './Avatar';
import Logo from './Logo';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';

export default function Topbar({ onLogout }) {
  const { user } = useAuth();
  const { unread } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);

  const item = 'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50';
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/home" className="lg:hidden" aria-label="Connectly home"><Logo /></Link>
        <SearchBar className="hidden max-w-md flex-1 sm:block" />
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => navigate('/notifications')} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} className="relative rounded-full p-2.5 text-slate-600 hover:bg-slate-100">
            <Bell size={21} />
            {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread > 99 ? '99+' : unread}</span>}
          </button>
          <div className="relative" ref={ref}>
            <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" className="rounded-full"><Avatar user={user} size={38} /></button>
            {open && (
              <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <div className="border-b border-slate-100 px-3.5 py-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                  {user?.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
                </div>
                <Link role="menuitem" to="/profile" className={item} onClick={() => setOpen(false)}><User size={16} /> My Profile</Link>
                <Link role="menuitem" to="/settings/change-password" className={item} onClick={() => setOpen(false)}><KeyRound size={16} /> Change password</Link>
                <button role="menuitem" className={`${item} text-red-600`} onClick={() => { setOpen(false); onLogout(); }}><LogOut size={16} /> Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 sm:hidden"><SearchBar /></div>
    </header>
  );
}
