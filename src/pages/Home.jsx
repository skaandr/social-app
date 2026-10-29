import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import PostComposer from '../components/PostComposer';
import PostList from '../components/PostList';
import EmptyState from '../components/EmptyState';
import { getFeed } from '../api/posts.api';

const TABS = [['all', 'All Posts'], ['following', 'Following'], ['me', 'My Posts']];

export default function Home() {
  const [only, setOnly] = useState('all');
  const [params] = useSearchParams();
  const fetchPage = useCallback((page, limit) => getFeed({ only, page, limit }), [only]);
  return (
    <div className="space-y-4">
      <PostComposer />
      <div role="tablist" aria-label="Feed filter" className="card flex gap-1 p-1.5">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={only === key} onClick={() => setOnly(key)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${only === key ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>
        ))}
      </div>
      <PostList fetchPage={fetchPage} query={params.get('q') || ''}
        empty={<EmptyState icon={PenSquare} title="Your feed is quiet" message={only === 'me' ? "You haven't posted yet. Share your first update above." : only === 'following' ? 'Posts from people you follow will appear here.' : 'Be the first to post something today.'} />} />
    </div>
  );
}
