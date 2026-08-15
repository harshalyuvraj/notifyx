'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await api.post(
        '/auth/forgot-password',
        {
          email,
        },
      );

      toast.success(response.data.message);
    } catch (error) {
      console.error(error);

      // Keep the same generic message even on failure.
      toast.success(
        'If an account exists for this email, a password reset link has been sent.',
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
          Forgot Password
        </h1>

        <p className="mt-2 text-gray-600">
          Enter your email and we'll send you a reset link.
        </p>

        <label className="mt-6 block text-sm font-semibold">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full rounded border p-3"
          placeholder="you@example.com"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="mt-4 w-full rounded bg-gray-200 px-5 py-3 text-gray-700"
        >
          Back to Login
        </button>
      </form>
    </main>
  );
}