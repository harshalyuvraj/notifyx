"use client";

import Link from "next/link";
import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await api.post(
        "/auth/forgot-password",
        {
          email,
        },
      );

      toast.success(response.data.message);
    } catch (error) {
      console.error(error);

      // Keep the same generic message even on failure.
      toast.success(
        "If an account exists for this email, a password reset link has been sent.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            Forgot Password
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we&apos;ll send you a
            password reset link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <Link
            href="/login"
            className="block w-full rounded-lg bg-gray-200 p-3 text-center font-medium text-gray-700 transition hover:bg-gray-300"
          >
            Back to Login
          </Link>
        </form>
      </div>
    </main>
  );
}