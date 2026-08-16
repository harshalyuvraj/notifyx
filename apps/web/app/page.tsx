import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="w-full overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Hero */}
          <section className="px-6 py-12 text-center sm:px-10 sm:py-16">
            <div className="mx-auto max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Notification Management
              </p>

              <h1 className="mt-4 text-5xl font-bold tracking-tight text-blue-600 sm:text-6xl">
                NotifyX
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
                Create, schedule, and manage email notifications with a simple
                and reliable workflow.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Get Started
                </Link>

                <Link
                  href="/login"
                  className="rounded-lg border border-blue-600 px-7 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="border-t bg-slate-50 px-6 py-10 sm:px-10">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-2xl">✉️</div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  Email Notifications
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Create notifications and deliver them through email when
                  they are scheduled.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-2xl">⏰</div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  Smart Scheduling
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Schedule notifications for a future date and time and let
                  NotifyX handle the delivery.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-2xl">⚡</div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  Reliable Processing
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Notifications are processed through BullMQ and Redis for
                  dependable background delivery.
                </p>
              </div>
            </div>
          </section>

          {/* Workflow */}
          <section className="border-t px-6 py-10 text-center sm:px-10">
            <h2 className="text-2xl font-bold text-gray-900">
              How NotifyX works
            </h2>

            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                  1
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  Create
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Write your notification.
                </p>
              </div>

              <div>
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                  2
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  Schedule
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Choose when it should be sent.
                </p>
              </div>

              <div>
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                  3
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  Deliver
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  NotifyX processes the delivery.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t bg-slate-50 px-6 py-5 text-center text-sm text-gray-500">
            NotifyX — Schedule and manage notifications with ease.
          </footer>
        </div>
      </div>
    </main>
  );
}