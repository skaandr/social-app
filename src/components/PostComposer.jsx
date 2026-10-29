import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPost, updatePost } from '../api/posts.api';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const MAX_IMAGE_MB = 8;

/** Create mode by default; pass `post` to edit an existing post. */
export default function PostComposer({ post, onSaved, onCancel, autoFocus = false, bare = false }) {
  const { user } = useAuth();
  const editing = Boolean(post);
  const [body, setBody] = useState(post?.body || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(post?.image || '');
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const pick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) return setError('Please choose an image file.');
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) return setError(`Images must be smaller than ${MAX_IMAGE_MB} MB.`);
    setError('');
    setFile(f);
    setRemoved(false);
    setPreview(URL.createObjectURL(f));
  };
  const clearImage = () => { setFile(null); setPreview(''); setRemoved(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const text = body.trim();
    if (!text && !preview) return setError('Write something or add a photo before publishing.');
    setBusy(true);
    setError('');
    try {
      if (editing) {
        await updatePost(post.id, { body: text, image: file, removeImage: removed && !file });
        toast.success('Post updated');
        onSaved?.({ body: text, imageChanged: Boolean(file) || removed });
      } else {
        await createPost({ body: text, image: file });
        toast.success('Post published');
        setBody(''); clearImage(); setRemoved(false);
        window.dispatchEvent(new Event('posts:changed'));
        onSaved?.();
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={bare ? '' : 'card p-4 sm:p-5'} aria-label={editing ? 'Edit post' : 'Create post'}>
      <div className="flex gap-3">
        {!editing && <Avatar user={user} size={42} />}
        <div className="min-w-0 flex-1">
          <label htmlFor={`composer-${post?.id || 'new'}`} className="sr-only">Post text</label>
          <textarea id={`composer-${post?.id || 'new'}`} value={body} onChange={(e) => setBody(e.target.value)} rows={editing ? 5 : 3} autoFocus={autoFocus}
            placeholder={`What's on your mind${user?.name ? `, ${user.name.split(' ')[0]}` : ''}?`}
            className="w-full resize-none rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-[15px] placeholder:text-slate-500 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200" />
          {preview && (
            <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-200">
              <img src={preview} alt="Selected upload preview" className="max-h-72 w-full object-cover" />
              <button type="button" onClick={clearImage} aria-label="Remove image" className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900"><X size={16} /></button>
            </div>
          )}
          {error && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-3 flex items-center justify-between gap-2">
            <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="sr-only" aria-label="Choose an image" tabIndex={-1} />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost -ml-2 !px-3 text-brand-600"><ImagePlus size={18} /> Photo</button>
            <div className="flex gap-2">
              {onCancel && <button type="button" className="btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>}
              <button type="submit" className="btn-primary" disabled={busy}>{busy ? (editing ? 'Saving…' : 'Publishing…') : editing ? 'Save changes' : 'Publish'}</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
