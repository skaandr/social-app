import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import { getSuggestions } from '../api/users.api';
import { normalizeUser, pickList } from '../utils/normalize';

export default function Suggestions() {
  const [people, setPeople] = useState(null);
  useEffect(() => {
    let alive = true;
    getSuggestions({ page: 1, limit: 5 })
      .then((res) => alive && setPeople(pickList(res.data, ['suggestions', 'users']).map(normalizeUser)))
      .catch(() => alive && setPeople([]));
    return () => { alive = false; };
  }, []);
  if (people && people.length === 0) return null;
  return (
    <section className="card p-4" aria-label="People you may know">
      <h2 className="mb-3 text-sm font-bold text-slate-900">People you may know</h2>
      {!people ? (
        <div className="space-y-3" aria-hidden="true">{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-3"><div className="skeleton h-9 w-9 rounded-full" /><div className="skeleton h-3 w-28" /></div>)}</div>
      ) : (
        <ul className="space-y-3">
          {people.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <Avatar user={p} size={36} />
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>{p.username && <p className="truncate text-xs text-slate-500">@{p.username}</p>}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
