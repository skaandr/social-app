import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getUnreadCount } from '../api/notifications.api';
import { useAuth } from './AuthContext';

const Ctx = createContext({ unread: 0, refresh: () => {}, setUnread: () => {} });
export const useNotifications = () => useContext(Ctx);

export function NotificationsProvider({ children }) {
  const { isAuthed } = useAuth();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      const d = res.data;
      const n = typeof d === 'number' ? d : d?.unreadCount ?? d?.count ?? d?.unread ?? 0;
      setUnread(Number(n) || 0);
    } catch { /* badge is non-critical */ }
  }, []);

  useEffect(() => {
    if (!isAuthed) { setUnread(0); return; }
    refresh();
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [isAuthed, refresh]);

  const value = useMemo(() => ({ unread, refresh, setUnread }), [unread, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
