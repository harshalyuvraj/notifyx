'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing.');
      return;
    }

    if (password.length < 6) {
      toast.error(
        'Password must be at least 6 characters.',
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        `/auth/reset-password?token=${encodeURIComponent(token)}`,
        {
          newPassword: password,
        },
      );

      toast.success(response.data.message);

      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error(
        'This reset link is invalid or has expired.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-200 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow"
      >
        <h1 className="text-3xl font-bold text-blue-600">
          Reset Password
        </h1>

        <p className="mt-2 text-gray-600">
          Enter your new password below.
        </p>

        <label className="mt-6 block text-sm font-semibold">
          New password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          className="mt-2 w-full rounded border p-3"
          placeholder="New password"
        />

        <label className="mt-4 block text-sm font-semibold">
          Confirm password
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          minLength={6}
          required
          className="mt-2 w-full rounded border p-3"
          placeholder="Confirm password"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-200 p-6">
      <div className="rounded-xl bg-white p-8 shadow">
        Loading...
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordContent />
    </Suspense>
  );
}