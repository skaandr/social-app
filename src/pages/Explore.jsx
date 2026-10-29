import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostList from '../components/PostList';
import { getPosts } from '../api/posts.api';

export default function Explore() {
  const [params] = useSearchParams();
  const fetchPage = useCallback((page, limit) => getPosts({ page, limit }), []);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-slate-900">Explore</h1>
      <p className="-mt-2 text-sm text-slate-500">The latest public posts from everyone on Connectly.</p>
      <PostList fetchPage={fetchPage} query={params.get('q') || ''} />
    </div>
  );
}
