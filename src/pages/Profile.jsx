import { useCallback } from 'react';
import ProfileHeader from '../components/ProfileHeader';
import PostList from '../components/PostList';
import EmptyState from '../components/EmptyState';
import { PenSquare } from 'lucide-react';
import { getFeed } from '../api/posts.api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const fetchPage = useCallback((page, limit) => getFeed({ only: 'me', page, limit }), []);
  return (
    <div className="space-y-4">
      <ProfileHeader user={user} />
      <h2 className="px-1 pt-2 text-base font-bold text-slate-900">Your posts</h2>
      <PostList fetchPage={fetchPage} empty={<EmptyState icon={PenSquare} title="No posts yet" message="Posts you publish will appear here." />} />
    </div>
  );
}
