import { useCallback, useEffect, useRef, useState } from 'react';
import { Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';
import PostCard from './PostCard';
import Modal from './Modal';
import PostComposer from './PostComposer';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { ListSkeleton } from './LoadingSkeleton';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getPagination, normalizePost, pickList } from '../utils/normalize';

const LIMIT = 10;

/** fetchPage(page, limit) must be memoised by the caller (useCallback). */
export default function PostList({ fetchPage, query = '', empty }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [editing, setEditing] = useState(null);
  const reqId = useRef(0);

  const load = useCallback(async (p, append) => {
    const id = ++reqId.current; // ignore stale responses (filter switches, fast clicks)
    if (append) setLoadingMore(true); else if (p === 1) setStatus((s) => (s === 'ready' ? s : 'loading'));
    try {
      const res = await fetchPage(p, LIMIT);
      if (id !== reqId.current) return;
      const list = pickList(res.data, ['posts']).map((x) => normalizePost(x, user?.id));
      const pg = getPagination(res.meta, list.length, LIMIT, p);
      setItems((prev) => (append ? [...prev, ...list.filter((n) => !prev.some((o) => o.id === n.id))] : list));
      setPage(p); setHasMore(pg.hasMore); setStatus('ready');
    } catch (err) {
      if (id !== reqId.current) return;
      const msg = getErrorMessage(err);
      if (append) toast.error(msg); else { setError(msg); setStatus('error'); }
    } finally {
      if (id === reqId.current) setLoadingMore(false);
    }
  }, [fetchPage, user?.id]);

  useEffect(() => { setStatus('loading'); setItems([]); load(1, false); }, [load]);
  useEffect(() => {
    const refresh = () => load(1, false);
    window.addEventListener('posts:changed', refresh);
    return () => window.removeEventListener('posts:changed', refresh);
  }, [load]);

  const update = (id, patch) => setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const q = query.trim().toLowerCase();
  const visible = q ? items.filter((p) => `${p.body} ${p.author?.name} ${p.author?.username}`.toLowerCase().includes(q)) : items;

  if (status === 'loading') return <ListSkeleton />;
  if (status === 'error') return <ErrorState message={error} onRetry={() => { setStatus('loading'); load(1, false); }} />;

  return (
    <div className="space-y-4">
      {visible.length === 0 ? (
        q ? <EmptyState icon={Newspaper} title="No matching posts" message={`Nothing loaded so far matches “${query}”. Load more posts or try another word.`} />
          : empty || <EmptyState icon={Newspaper} title="No posts yet" message="When people post, it shows up here." />
      ) : visible.map((post) => <PostCard key={post.id} post={post} onUpdate={update} onEdit={setEditing} />)}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button className="btn-outline" onClick={() => load(page + 1, true)} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Load more posts'}</button>
        </div>
      )}
      {editing && (
        <Modal title="Edit post" onClose={() => setEditing(null)}>
          <PostComposer bare post={editing} autoFocus onCancel={() => setEditing(null)}
            onSaved={({ body, imageChanged }) => { if (imageChanged) load(1, false); else update(editing.id, { body }); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}
