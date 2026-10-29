import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOff, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { ListSkeleton, RowSkeleton } from '../components/LoadingSkeleton';
import { getNotifications, markAllRead, markRead } from '../api/notifications.api';
import { getErrorMessage } from '../api/client';
import { useNotifications } from '../context/NotificationsContext';
import { getPagination, normalizeNotification, pickList } from '../utils/normalize';

const LIMIT = 15;

export default function Notifications() {
  const navigate = useNavigate();
  const { refresh } = useNotifications();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [more, setMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const req = useRef(0);

  const load = useCallback(async (p = 1, append = false) => {
    const id = ++req.current;
    if (append) setMore(true); else setStatus('loading');
    try {
      const res = await getNotifications({ page: p, limit: LIMIT });
      if (id !== req.current) return;
      const list = pickList(res.data, ['notifications']).map(normalizeNotification);
      setItems((prev) => (append ? [...prev, ...list.filter((n) => !prev.some((o) => o.id === n.id))] : list));
      setPage(p); setHasMore(getPagination(res.meta, list.length, LIMIT, p).hasMore); setStatus('ready');
    } catch (err) {
      if (id !== req.current) return;
      if (append) toast.error(getErrorMessage(err)); else { setError(getErrorMessage(err)); setStatus('error'); }
    } finally { if (id === req.current) setMore(false); }
  }, []);
  useEffect(() => { load(1); }, [load]);

  const open = async (n) => {
    if (!n.read) {
      try {
        await markRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
        refresh();
      } catch (err) { toast.error(getErrorMessage(err)); }
    }
    if (n.postId) navigate(`/posts/${n.postId}`);
  };

  const readAll = async () => {
    setMarkingAll(true);
    try {
      await markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      refresh();
      toast.success('All notifications marked as read');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setMarkingAll(false); }
  };

  const hasUnread = items.some((n) => !n.read);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-slate-900">Notifications</h1>
        <button className="btn-outline" onClick={readAll} disabled={markingAll || !hasUnread}><CheckCheck size={16} /> {markingAll ? 'Marking…' : 'Mark all as read'}</button>
      </div>
      {status === 'loading' ? <div className="card"><ListSkeleton count={5} Item={RowSkeleton} /></div>
        : status === 'error' ? <ErrorState message={error} onRetry={() => load(1)} />
        : items.length === 0 ? <EmptyState icon={BellOff} title="You're all caught up" message="Likes, comments and shares on your posts will show up here." />
        : (
          <div className="card overflow-hidden">
            <ul className="divide-y divide-slate-100">{items.map((n) => <NotificationItem key={n.id} item={n} onOpen={open} />)}</ul>
            {hasMore && <div className="flex justify-center border-t border-slate-100 p-3"><button className="btn-outline" onClick={() => load(page + 1, true)} disabled={more}>{more ? 'Loading…' : 'Load more'}</button></div>}
          </div>
        )}
    </div>
  );
}
