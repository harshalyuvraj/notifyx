'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');

  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await api.get(
          `/auth/verify-email?token=${encodeURIComponent(token)}`,
        );

        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        console.error(error);

        setStatus('error');
        setMessage(
          'This verification link is invalid or has expired.',
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-200 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow">
        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold">
              Verifying your email...
            </h1>

            <p className="mt-3 text-gray-500">
              Please wait.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-green-600">
              Email verified
            </h1>

            <p className="mt-3 text-gray-600">
              {message}
            </p>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-6 rounded bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-red-600">
              Verification failed
            </h1>

            <p className="mt-3 text-gray-600">
              {message}
            </p>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-6 rounded bg-gray-600 px-5 py-3 text-white hover:bg-gray-700"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function VerifyEmailLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-200 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold">
          Loading...
        </h1>

        <p className="mt-3 text-gray-500">
          Preparing email verification.
        </p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}