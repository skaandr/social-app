import { Link } from 'react-router-dom';
import { ChevronRight, KeyRound, User } from 'lucide-react';

export default function Settings() {
  const row = 'flex items-center gap-3 px-4 py-4 hover:bg-slate-50';
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-slate-900">Settings</h1>
      <div className="card divide-y divide-slate-100 overflow-hidden">
        <Link to="/profile" className={row}><User size={20} className="text-brand-600" /><span className="flex-1"><span className="block text-sm font-semibold text-slate-900">Profile photo</span><span className="block text-xs text-slate-500">Update the picture shown on your posts and comments.</span></span><ChevronRight size={18} className="text-slate-400" /></Link>
        <Link to="/settings/change-password" className={row}><KeyRound size={20} className="text-brand-600" /><span className="flex-1"><span className="block text-sm font-semibold text-slate-900">Change password</span><span className="block text-xs text-slate-500">Choose a new password for your account.</span></span><ChevronRight size={18} className="text-slate-400" /></Link>
      </div>
    </div>
  );
}
