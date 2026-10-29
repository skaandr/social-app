import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { toggleBookmark, toggleLike, sharePost } from '../api/posts.api';
import { getErrorMessage } from '../api/client';
import Modal from './Modal';

/** Read an explicit boolean from a toggle response, if the API provides one. */
export function readFlag(res, keys, onRegex) {
  const d = res?.data;
  for (const k of keys) {
    if (typeof d?.[k] === 'boolean') return d[k];
    if (typeof d?.post?.[k] === 'boolean') return d.post[k];
  }
  if (onRegex && typeof res?.message === 'string') {
    if (/\b(remov|un)/i.test(res.message)) return false;
    if (onRegex.test(res.message)) return true;
  }
  return undefined;
}

export default function PostActions({ post, onUpdate, detail = false, bookmarkId }) {
  const [pending, setPending] = useState({});
  const [sharing, setSharing] = useState(false);
  const [shareText, setShareText] = useState('');
  const lock = (k, v) => setPending((p) => ({ ...p, [k]: v }));

  const like = async () => {
    if (pending.like) return;
    lock('like', true);
    try {
      const res = await toggleLike(post.id);
      const liked = readFlag(res, ['liked', 'isLiked'], /like/i) ?? !post.liked;
      onUpdate(post.id, { liked, likesCount: Math.max(0, post.likesCount + (liked === post.liked ? 0 : liked ? 1 : -1)) });
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { lock('like', false); }
  };

  const bookmark = async () => {
    if (pending.bookmark) return;
    lock('bookmark', true);
    try {
      const res = await toggleBookmark(post.id);
      const saved = readFlag(res, ['bookmarked', 'isBookmarked'], /bookmark|saved/i) ?? !post.bookmarked;
      onUpdate(post.id, { bookmarked: saved });
      toast.success(saved ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { lock('bookmark', false); }
  };

  const share = async () => {
    if (pending.share) return;
    lock('share', true);
    try {
      await sharePost(post.id, shareText.trim());
      toast.success('Shared to your profile');
      onUpdate(post.id, { sharesCount: post.sharesCount + 1 });
      setSharing(false); setShareText('');
      window.dispatchEvent(new Event('posts:changed'));
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { lock('share', false); }
  };

  const base = 'btn-ghost flex-1 !px-2 !py-2 text-slate-600';
  return (
    <>
      <div className="flex items-center gap-1 border-t border-slate-100 pt-2">
        <button onClick={like} disabled={pending.like} aria-pressed={post.liked} className={`${base} ${post.liked ? '!text-rose-600' : ''}`}>
          <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} /> <span>{post.likesCount}</span><span className="sr-only">likes</span>
        </button>
        {detail ? (
          <span className={`${base} cursor-default`}><MessageCircle size={18} /> {post.commentsCount}<span className="sr-only">comments</span></span>
        ) : (
          <Link to={`/posts/${post.id}`} state={{ post }} className={base}><MessageCircle size={18} /> {post.commentsCount}<span className="sr-only">comments</span></Link>
        )}
        <button onClick={() => setSharing(true)} className={base}><Share2 size={18} /> <span className="hidden sm:inline">Share</span><span className="sr-only sm:hidden">Share</span></button>
        <button id={bookmarkId} onClick={bookmark} disabled={pending.bookmark} aria-pressed={Boolean(post.bookmarked)} aria-label="Bookmark" className={`${base} ${post.bookmarked ? '!text-brand-600' : ''}`}>
          <Bookmark size={18} fill={post.bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
      {sharing && (
        <Modal title="Share this post" onClose={() => !pending.share && setSharing(false)}>
          <label htmlFor="share-text" className="sr-only">Add a comment</label>
          <textarea id="share-text" rows={3} value={shareText} onChange={(e) => setShareText(e.target.value)} placeholder="Say something about this (optional)" className="input resize-none" />
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn-outline" onClick={() => setSharing(false)} disabled={pending.share}>Cancel</button>
            <button className="btn-primary" onClick={share} disabled={pending.share}>{pending.share ? 'Sharing…' : 'Share now'}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
