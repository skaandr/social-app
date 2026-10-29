import { Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SearchBar({ className = '' }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q').toString().trim();
    navigate(q ? `/home?q=${encodeURIComponent(q)}` : '/home');
  };
  return (
    <form onSubmit={submit} role="search" className={`relative ${className}`}>
      <label htmlFor="global-search" className="sr-only">Search loaded posts</label>
      <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input id="global-search" name="q" key={params.get('q') || ''} defaultValue={params.get('q') || ''} placeholder="Search posts in your feed"
        className="w-full rounded-full border border-transparent bg-slate-100 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-500 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200" />
    </form>
  );
}
