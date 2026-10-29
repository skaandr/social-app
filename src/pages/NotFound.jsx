import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-8" />
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-bold text-slate-900">This page doesn't exist</h1>
      <p className="mt-1 text-sm text-slate-500">The link may be broken, or the page may have moved.</p>
      <Link to="/home" className="btn-primary mt-6">Go to Home</Link>
    </div>
  );
}
