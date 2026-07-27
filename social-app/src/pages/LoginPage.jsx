import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const infoMessage = location.state?.message;
  const from = location.state?.from || '/people';

  async function onSubmit(data) {
    setFormError('');
    setLoading(true);
    try {
      login(data.email, data.password);
      navigate(from);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email) {
    setValue('email', email);
    setValue('password', 'demo123');
  }

  return (
    <AuthLayout title="Welcome back">
      {infoMessage && (
        <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
          {infoMessage}
        </p>
      )}
      {formError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {formError}
        </p>
      )}

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
        <p className="mb-2 font-semibold text-slate-800 dark:text-slate-100">
          Demo accounts (use in a second tab)
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillDemo('alex@demo.com')}
            className="rounded-lg bg-white px-2 py-1 font-medium ring-1 ring-slate-200 hover:bg-brand-50 dark:bg-slate-900 dark:ring-slate-600"
          >
            alex@demo.com
          </button>
          <button
            type="button"
            onClick={() => fillDemo('sam@demo.com')}
            className="rounded-lg bg-white px-2 py-1 font-medium ring-1 ring-slate-200 hover:bg-brand-50 dark:bg-slate-900 dark:ring-slate-600"
          >
            sam@demo.com
          </button>
        </div>
        <p className="mt-2">Password: demo123</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' },
          })}
        />
        <Button type="submit" className="w-full" isLoading={loading}>
          Log in
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
        No account?{' '}
        <Link to="/signup" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
