import { useRef, useState } from 'react';
import { Camera, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import { uploadPhoto } from '../api/users.api';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfileHeader({ user }) {
  const { refreshUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file.');
    setBusy(true);
    try {
      await uploadPhoto(file);
      await refreshUser();
      toast.success('Profile photo updated');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <section className="card overflow-hidden">
      <div className="h-28 bg-gradient-to-r from-brand-600 to-indigo-400 sm:h-36" aria-hidden="true" />
      <div className="px-5 pb-5 sm:px-7">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-3 sm:-mt-14">
          <div className="relative rounded-full ring-4 ring-white">
            <Avatar user={user} size={104} />
            <button onClick={() => input.current?.click()} disabled={busy} aria-label="Change profile photo"
              className="absolute bottom-0 right-0 rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow hover:bg-slate-50 disabled:opacity-60"><Camera size={16} /></button>
            <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={onPick} aria-label="Upload profile photo" />
          </div>
          <button className="btn-outline" onClick={() => input.current?.click()} disabled={busy}>{busy ? 'Uploading…' : 'Change photo'}</button>
        </div>
        <h1 className="mt-3 text-xl font-extrabold text-slate-900">{user.name}</h1>
        {user.username && <p className="text-sm text-slate-500">@{user.username}</p>}
        {user.bio && <p className="mt-2 max-w-xl text-sm text-slate-700">{user.bio}</p>}
        {user.email && <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500"><Mail size={15} /> {user.email}</p>}
      </div>
    </section>
  );
}
