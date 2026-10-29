import { useId, useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

/** onSubmit(text) must return a promise; the form clears only when it resolves. */
export default function CommentForm({ onSubmit, placeholder = 'Write a comment…', autoFocus = false, onCancel, initial = '', submitLabel = 'Post', showAvatar = true }) {
  const { user } = useAuth();
  const inputId = useId();
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const value = text.trim();
    if (!value) return setError('Write something first.');
    setBusy(true); setError('');
    try { await onSubmit(value); setText(''); }
    catch (err) { const m = getErrorMessage(err); setError(m); toast.error(m); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="flex items-start gap-2.5">
      {showAvatar && <Avatar user={user} size={34} />}
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={inputId}>Comment</label>
        <div className="flex items-end gap-2 rounded-2xl bg-slate-100 py-1.5 pl-3.5 pr-1.5 focus-within:ring-2 focus-within:ring-brand-200">
          <textarea id={inputId} value={text} onChange={(e) => setText(e.target.value)} rows={1} autoFocus={autoFocus} placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form.requestSubmit(); } }}
            className="max-h-32 min-h-[2.25rem] flex-1 resize-none bg-transparent py-1.5 text-sm placeholder:text-slate-500 focus:outline-none" />
          <button type="submit" disabled={busy} aria-label={submitLabel} className="rounded-xl bg-brand-600 p-2 text-white hover:bg-brand-700 disabled:opacity-60"><Send size={16} /></button>
        </div>
        {error && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{error}</p>}
        {onCancel && <button type="button" onClick={onCancel} className="mt-1 text-xs font-medium text-slate-500 hover:underline">Cancel</button>}
      </div>
    </form>
  );
}
