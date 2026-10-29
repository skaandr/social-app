import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import Modal from '../components/Modal';
import CommentCard from '../components/CommentCard';
import CommentForm from '../components/CommentForm';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { ListSkeleton, RowSkeleton, PostSkeleton } from '../components/LoadingSkeleton';
import { createComment, getComments } from '../api/comments.api';
import { getFeed } from '../api/posts.api';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getPagination, normalizeComment, normalizePost, pickList } from '../utils/normalize';

const LIMIT = 10;

export default function PostDetails() {
  const { postId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const [post, setPost] = useState(state?.post?.id === postId ? state.post : null);
  const [postError, setPostError] = useState('');
  const [editing, setEditing] = useState(false);
  const [comments, setComments] = useState([]);
  const [cStatus, setCStatus] = useState('loading');
  const [cError, setCError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const req = useRef(0);

  // The API has no "get one post" endpoint, so when the page is opened directly we look for it in the feed.
  const findPost = useCallback(async () => {
    setPostError('');
    try {
      for (let p = 1; p <= 10; p += 1) {
        const res = await getFeed({ only: 'all', page: p, limit: 20 });
        const list = pickList(res.data, ['posts']).map((x) => normalizePost(x, user?.id));
        const hit = list.find((x) => x.id === postId);
        if (hit) { setPost(hit); return; }
        if (!getPagination(res.meta, list.length, 20, p).hasMore) break;
      }
      setPostError('We could not find this post. It may have been removed, or it is too far back in the feed to load directly.');
    } catch (err) { setPostError(getErrorMessage(err)); }
  }, [postId, user?.id]);

  useEffect(() => {
    if (state?.post?.id === postId) setPost(state.post); else { setPost(null); findPost(); }
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadComments = useCallback(async (p = 1, append = false) => {
    const id = ++req.current;
    if (append) setLoadingMore(true); else setCStatus('loading');
    try {
      const res = await getComments(postId, { page: p, limit: LIMIT });
      if (id !== req.current) return;
      const list = pickList(res.data, ['comments']).map((c) => normalizeComment(c, user?.id));
      setComments((prev) => (append ? [...prev, ...list.filter((n) => !prev.some((o) => o.id === n.id))] : list));
      setPage(p); setHasMore(getPagination(res.meta, list.length, LIMIT, p).hasMore); setCStatus('ready');
    } catch (err) {
      if (id !== req.current) return;
      if (append) toast.error(getErrorMessage(err)); else { setCError(getErrorMessage(err)); setCStatus('error'); }
    } finally { if (id === req.current) setLoadingMore(false); }
  }, [postId, user?.id]);

  useEffect(() => { setComments([]); loadComments(1); }, [loadComments]);

  const addComment = async (text) => {
    await createComment(postId, text);
    toast.success('Comment posted');
    setPost((p) => p && { ...p, commentsCount: p.commentsCount + 1 });
    await loadComments(1);
  };
  const removed = (id) => { setComments((c) => c.filter((x) => x.id !== id)); setPost((p) => p && { ...p, commentsCount: Math.max(0, p.commentsCount - 1) }); };

  return (
    <div className="space-y-4">
      <Link to="/home" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-600"><ArrowLeft size={16} /> Back to feed</Link>

      {postError ? <ErrorState title="Post not available" message={postError} onRetry={findPost} />
        : !post ? <PostSkeleton />
        : <PostCard detail post={post} onUpdate={(_, patch) => setPost((p) => ({ ...p, ...patch }))} onEdit={() => setEditing(true)} />}

      <section className="card p-4 sm:p-5" aria-label="Comments">
        <h2 className="mb-4 text-base font-bold text-slate-900">Comments{post ? ` (${post.commentsCount})` : ''}</h2>
        <CommentForm onSubmit={addComment} />
        <div className="mt-2">
          {cStatus === 'loading' ? <ListSkeleton count={3} Item={RowSkeleton} />
            : cStatus === 'error' ? <ErrorState message={cError} onRetry={() => loadComments(1)} />
            : comments.length === 0 ? <EmptyState icon={MessageCircle} title="No comments yet" message="Start the conversation with the first comment." />
            : (
              <ul className="divide-y divide-slate-100">
                {comments.map((c) => <CommentCard key={c.id} postId={postId} comment={c} postOwnerId={post?.author?.id} onDeleted={removed} />)}
              </ul>
            )}
          {hasMore && <div className="flex justify-center pt-3"><button className="btn-outline" disabled={loadingMore} onClick={() => loadComments(page + 1, true)}>{loadingMore ? 'Loading…' : 'Load more comments'}</button></div>}
        </div>
      </section>

      {editing && post && (
        <Modal title="Edit post" onClose={() => setEditing(false)}>
          <PostComposer bare post={post} autoFocus onCancel={() => setEditing(false)}
            onSaved={({ body, imageChanged }) => { setEditing(false); if (imageChanged) findPost(); else setPost((p) => ({ ...p, body })); }} />
        </Modal>
      )}
    </div>
  );
}
