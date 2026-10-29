import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthShell from './AuthShell';
import FormField from '../components/FormField';
import { signin } from '../api/auth.api';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { startSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (values) => {
    setBusy(true); setError('');
    try {
      const res = await signin({ identifier: values.identifier.trim(), password: values.password });
      const token = res.data?.token ?? res.token;
      if (!token) throw new Error('The server did not return a session token.');
      await startSession(token, res.data?.user);
      toast.success('Welcome back!');
      navigate(location.state?.from || '/home', { replace: true });
    } catch (err) {
      setError(err.response?.status === 401 ? 'Incorrect email/username or password.' : getErrorMessage(err));
    } finally { setBusy(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to Connectly."
      footer={<>New to Connectly? <Link to="/auth/signup" className="font-semibold text-brand-600 hover:underline">Create an account</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="Email or username" autoComplete="username" error={errors.identifier?.message} {...register('identifier', { required: 'Enter your email or username.' })} />
        <FormField label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password', { required: 'Enter your password.' })} />
        {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthShell>
  );
}
