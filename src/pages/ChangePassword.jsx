import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import FormField from '../components/FormField';
import { changePassword } from '../api/users.api';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const { replaceToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (v) => {
    setBusy(true); setError('');
    try {
      const res = await changePassword({ current: v.current, next: v.next });
      const token = res.data?.token ?? res.token;
      if (token) replaceToken(token); // the API rotates the token on password change
      toast.success('Password changed');
      reset();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Link to="/settings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-600"><ArrowLeft size={16} /> Settings</Link>
      <div className="card max-w-lg p-5 sm:p-6">
        <h1 className="text-xl font-extrabold text-slate-900">Change password</h1>
        <p className="mb-5 mt-1 text-sm text-slate-500">Use at least 8 characters, with a letter and a number.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField label="Current password" type="password" autoComplete="current-password" error={errors.current?.message} {...register('current', { required: 'Enter your current password.' })} />
          <FormField label="New password" type="password" autoComplete="new-password" error={errors.next?.message}
            {...register('next', { required: 'Enter a new password.', minLength: { value: 8, message: 'Use at least 8 characters.' }, validate: (x) => (/[A-Za-z]/.test(x) && /\d/.test(x)) || 'Include at least one letter and one number.' })} />
          <FormField label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirm?.message}
            {...register('confirm', { required: 'Confirm your new password.', validate: (x) => x === watch('next') || 'Passwords do not match.' })} />
          {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Update password'}</button>
        </form>
      </div>
    </div>
  );
}
