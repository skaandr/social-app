import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Link2, MoreHorizontal, Pencil, Repeat2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import PostActions from './PostActions';
import { timeAgo } from '../utils/time';

function Menu({ post, onEdit, onBookmark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);
  const item = 'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50';
  const copy = async () => {
    setOpen(false);
    try { await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`); toast.success('Link copied'); }
    catch { toast.error('Could not copy the link'); }
  };
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Post actions" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><MoreHorizontal size={20} /></button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {post.isMine && <button role="menuitem" className={item} onClick={() => { setOpen(false); onEdit(post); }}><Pencil size={16} /> Edit post</button>}
          <button role="menuitem" className={item} onClick={() => { setOpen(false); onBookmark(); }}><Bookmark size={16} /> {post.bookmarked ? 'Remove bookmark' : 'Bookmark'}</button>
          <button role="menuitem" className={item} onClick={copy}><Link2 size={16} /> Copy link</button>
        </div>
      )}
    </div>
  );
}

export default function PostCard({ post, onUpdate, onEdit, detail = false }) {
  const bookmarkFromMenu = () => document.getElementById(`bm-${post.id}`)?.click();
  return (
    <article className="card p-4 sm:p-5">
      <header className="flex items-start gap-3">
        <Avatar user={post.author} size={42} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{post.author?.name}</p>
          <p className="truncate text-xs text-slate-500">
            {post.author?.username ? `@${post.author.username} · ` : ''}
            <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </p>
        </div>
        <Menu post={post} onEdit={onEdit} onBookmark={bookmarkFromMenu} />
      </header>

      {post.body && (
        detail ? <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-slate-800">{post.body}</p>
          : <Link to={`/posts/${post.id}`} state={{ post }} className="mt-3 block whitespace-pre-wrap break-words text-[15px] leading-relaxed text-slate-800">{post.body}</Link>
      )}
      {post.image && <img src={post.image} alt="Attached to post" loading="lazy" className="mt-3 max-h-[28rem] w-full rounded-xl border border-slate-100 object-cover" />}

      {post.shared && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500"><Repeat2 size={14} /> Shared post</p>
          <div className="flex items-center gap-2"><Avatar user={post.shared.author} size={28} /><span className="text-sm font-semibold">{post.shared.author?.name}</span></div>
          {post.shared.body && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{post.shared.body}</p>}
          {post.shared.image && <img src={post.shared.image} alt="Attached to shared post" loading="lazy" className="mt-2 max-h-72 w-full rounded-lg object-cover" />}
        </div>
      )}

      <div className="mt-3">
        <PostActions post={post} onUpdate={onUpdate} detail={detail} bookmarkId={`bm-${post.id}`} />
      </div>
    </article>
  );
}
