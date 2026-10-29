import { useState } from 'react';
import { Heart, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import CommentForm from './CommentForm';
import ConfirmationModal from './ConfirmationModal';
import { createReply, deleteComment, getReplies, toggleCommentLike, updateComment } from '../api/comments.api';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getPagination, normalizeComment, pickList } from '../utils/normalize';
import { timeAgo } from '../utils/time';
import { readFlag } from './PostActions';

const REPLY_LIMIT = 5;

function Bubble({ comment, canDelete, onEdit, onDelete, onLike, likeBusy, onReply, isReply }) {
  return (
    <div className="flex gap-2.5">
      <Avatar user={comment.author} size={isReply ? 28 : 34} />
      <div className="min-w-0 flex-1">
        <div className="inline-block max-w-full rounded-2xl bg-slate-100 px-3.5 py-2">
          <p className="text-sm font-semibold text-slate-900">{comment.author?.name}</p>
          <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{comment.text}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs font-medium text-slate-500">
          <time dateTime={comment.createdAt}>{timeAgo(comment.createdAt)}</time>
          {onLike && (
            <button onClick={onLike} disabled={likeBusy} aria-pressed={comment.liked} className={`inline-flex items-center gap-1 hover:text-rose-600 ${comment.liked ? 'text-rose-600' : ''}`}>
              <Heart size={13} fill={comment.liked ? 'currentColor' : 'none'} /> {comment.likesCount > 0 ? comment.likesCount : 'Like'}
            </button>
          )}
          {onReply && <button onClick={onReply} className="hover:text-brand-600">Reply</button>}
          {comment.isMine && onEdit && <button onClick={onEdit} className="inline-flex items-center gap-1 hover:text-brand-600"><Pencil size={12} /> Edit</button>}
          {(comment.isMine || canDelete) && onDelete && <button onClick={onDelete} className="inline-flex items-center gap-1 hover:text-red-600"><Trash2 size={12} /> Delete</button>}
        </div>
      </div>
    </div>
  );
}

export default function CommentCard({ postId, comment: initial, postOwnerId, onDeleted }) {
  const { user } = useAuth();
  const [comment, setComment] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replies, setReplies] = useState(null); // null = not loaded
  const [repliesPage, setRepliesPage] = useState(1);
  const [moreReplies, setMoreReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const canDelete = Boolean(user?.id && postOwnerId === user.id);

  const like = async () => {
    if (likeBusy) return;
    setLikeBusy(true);
    try {
      const res = await toggleCommentLike(postId, comment.id);
      const liked = readFlag(res, ['liked', 'isLiked'], /like/i) ?? !comment.liked;
      setComment((c) => ({ ...c, liked, likesCount: Math.max(0, c.likesCount + (liked === c.liked ? 0 : liked ? 1 : -1)) }));
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLikeBusy(false); }
  };

  const saveEdit = async (text) => {
    await updateComment(postId, comment.id, text);
    setComment((c) => ({ ...c, text }));
    setEditing(false);
    toast.success('Comment updated');
  };

  const remove = async () => {
    setBusy(true);
    try { await deleteComment(postId, comment.id); toast.success('Comment deleted'); onDeleted(comment.id); }
    catch (err) { toast.error(getErrorMessage(err)); setBusy(false); setConfirm(false); }
  };

  const loadReplies = async (page = 1) => {
    setLoadingReplies(true);
    try {
      const res = await getReplies(postId, comment.id, { page, limit: REPLY_LIMIT });
      const list = pickList(res.data, ['replies']).map((r) => normalizeComment(r, user?.id));
      setReplies((prev) => (page === 1 ? list : [...(prev || []), ...list.filter((r) => !(prev || []).some((p) => p.id === r.id))]));
      setRepliesPage(page);
      setMoreReplies(getPagination(res.meta, list.length, REPLY_LIMIT, page).hasMore);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoadingReplies(false); }
  };

  const addReply = async (text) => {
    await createReply(postId, comment.id, text);
    toast.success('Reply posted');
    setComment((c) => ({ ...c, repliesCount: c.repliesCount + 1 }));
    setReplying(false);
    await loadReplies(1);
  };

  return (
    <li className="py-3">
      {editing ? (
        <CommentForm initial={comment.text} onSubmit={saveEdit} onCancel={() => setEditing(false)} submitLabel="Save" showAvatar={false} />
      ) : (
        <Bubble comment={comment} canDelete={canDelete} onLike={like} likeBusy={likeBusy} onEdit={() => setEditing(true)} onDelete={() => setConfirm(true)} onReply={() => setReplying((r) => !r)} />
      )}

      {comment.repliesCount > 0 && replies === null && (
        <button onClick={() => loadReplies(1)} disabled={loadingReplies} className="ml-11 mt-1 text-xs font-semibold text-brand-600 hover:underline">
          {loadingReplies ? 'Loading…' : `View ${comment.repliesCount} ${comment.repliesCount === 1 ? 'reply' : 'replies'}`}
        </button>
      )}
      {replies && replies.length > 0 && (
        <ul className="ml-11 mt-2 space-y-2">
          {replies.map((r) => <li key={r.id}><Bubble comment={r} isReply /></li>)}
          {moreReplies && <li><button onClick={() => loadReplies(repliesPage + 1)} disabled={loadingReplies} className="text-xs font-semibold text-brand-600 hover:underline">{loadingReplies ? 'Loading…' : 'Show more replies'}</button></li>}
        </ul>
      )}
      {replying && <div className="ml-11 mt-2"><CommentForm autoFocus placeholder={`Reply to ${comment.author?.name || 'comment'}…`} onSubmit={addReply} onCancel={() => setReplying(false)} submitLabel="Reply" /></div>}

      {confirm && <ConfirmationModal danger busy={busy} title="Delete comment?" message="This comment will be permanently removed." confirmLabel="Delete" onConfirm={remove} onClose={() => !busy && setConfirm(false)} />}
    </li>
  );
}
