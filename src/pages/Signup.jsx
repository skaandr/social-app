import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthShell from './AuthShell';
import FormField from '../components/FormField';
import { signup } from '../api/auth.api';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { startSession } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (v) => {
    setBusy(true); setError('');
    try {
      const res = await signup({ ...v, name: v.name.trim(), username: v.username.trim(), email: v.email.trim() });
      const token = res.data?.token ?? res.token;
      if (token) {
        await startSession(token, res.data?.user);
        toast.success('Account created. Welcome to Connectly!');
        navigate('/home', { replace: true });
      } else {
        toast.success('Account created. Please sign in.');
        navigate('/auth', { replace: true });
      }
    } catch (err) {
      setError(err.response?.status === 409 ? 'That email or username is already taken.' : getErrorMessage(err));
    } finally { setBusy(false); }
  };

  const req = (m) => ({ required: m });
  return (
    <AuthShell title="Create your account" subtitle="It only takes a minute."
      footer={<>Already have an account? <Link to="/auth" className="font-semibold text-brand-600 hover:underline">Sign in</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="Full name" autoComplete="name" error={errors.name?.message} {...register('name', { ...req('Enter your name.'), minLength: { value: 3, message: 'Use at least 3 characters.' } })} />
        <FormField label="Username" autoComplete="username" error={errors.username?.message} {...register('username', { ...req('Choose a username.'), pattern: { value: /^[a-zA-Z0-9_.]{3,30}$/, message: '3–30 letters, numbers, dots or underscores.' } })} />
        <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email', { ...req('Enter your email.'), pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' } })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date of birth" type="date" max={new Date().toISOString().slice(0, 10)} error={errors.dateOfBirth?.message} {...register('dateOfBirth', req('Enter your date of birth.'))} />
          <div>
            <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-slate-700">Gender</label>
            <select id="gender" className="input" defaultValue="" aria-invalid={Boolean(errors.gender)} {...register('gender', req('Select a gender.'))}>
              <option value="" disabled>Select…</option><option value="male">Male</option><option value="female">Female</option>
            </select>
            {errors.gender && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.gender.message}</p>}
          </div>
        </div>
        <FormField label="Password" type="password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message} {...register('password', { ...req('Create a password.'), minLength: { value: 8, message: 'Use at least 8 characters.' }, validate: (x) => (/[A-Za-z]/.test(x) && /\d/.test(x)) || 'Include at least one letter and one number.' })} />
        <FormField label="Confirm password" type="password" autoComplete="new-password" error={errors.rePassword?.message}
          {...register('rePassword', { ...req('Confirm your password.'), validate: (x) => x === watch('password') || 'Passwords do not match.' })} />
        {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}
