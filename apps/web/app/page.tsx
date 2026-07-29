import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-lg p-10">
        <h1 className="text-5xl font-bold text-blue-600">NotifyX</h1>

        <p className="mt-4 text-gray-600 text-lg">
          Schedule and manage notifications with ease.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50"
          >
            Register
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">📧 Email Notifications</h2>
            <p className="mt-2 text-sm text-gray-600">
              Send scheduled email notifications.
            </p>
          </div>

          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">⏰ Scheduling</h2>
            <p className="mt-2 text-sm text-gray-600">
              Schedule notifications for any future date and time.
            </p>
          </div>

          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">⚡ Queue Processing</h2>
            <p className="mt-2 text-sm text-gray-600">
              Powered by BullMQ and Redis for reliable delivery.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}