import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function SignupPage() {
  const { isAuthenticated, signup } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  if (isAuthenticated) {
    return <Navigate to="/dashboard/posts" replace />;
  }

  async function onSubmit(data) {
    setFormError('');
    setLoading(true);
    try {
      signup({ name: data.name, email: data.email, password: data.password });
      navigate('/login');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="card p-8">
        <h1 className="mb-1 text-2xl font-bold">Create your account</h1>
        <p className="mb-6 text-sm text-gray-500">Join SocialApp and start sharing</p>

        {formError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/40">
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full name"
            error={errors.name?.message}
            {...register('name', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' },
            })}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
              pattern: {
                value: /^(?=.*[A-Z])(?=.*\d).+$/,
                message: 'Must include an uppercase letter and a number',
              },
            })}
          />
          <Input
            label="Confirm password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === watch('password') || 'Passwords do not match',
            })}
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            Sign up
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
