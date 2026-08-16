"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/api";
import type { UserProfile } from "@/types/auth";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  scheduledAt: string;
}

interface AuditHistory {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  snapshot: any;
  previousSnapshot: any;
}

interface AuditLog {
  notificationId: string;
  latestAction: string;
  latestTime: string;
  history: AuditHistory[];
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getLatestHistoryEvent(history: AuditHistory[]) {
  if (!history.length) return null;

  return [...history].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  )[0];
}

function getStatusClasses(status: string) {
  switch (status) {
    case "SENT":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "FAILED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getActionClasses(action: string) {
  switch (action) {
    case "CREATE":
      return "bg-green-100 text-green-700";
    case "UPDATE":
      return "bg-yellow-100 text-yellow-700";
    case "DELETE":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("EMAIL");
  const [scheduledAt, setScheduledAt] = useState("");

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error(error);
        setProfileError("Unable to load profile");
      }
    }

    loadProfile();
  }, []);

  async function loadNotifications() {
    setLoading(true);

    try {
      const res = await api.get(
        `/notifications?page=${page}&limit=5&search=${encodeURIComponent(
          search,
        )}`,
      );

      setNotifications(res.data.notifications);
      setTotalPages(res.data.totalPages);

      const statsRes = await api.get("/notifications/stats");
      setStats(statsRes.data);

      const auditRes = await api.get("/audit?limit=10");
      setAuditLogs(auditRes.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadNotifications();
  }, [router, page, search]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not configured");
      return;
    }

    const socket = io(apiUrl);

    socket.on("notificationUpdated", async () => {
      await loadNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function createNotification(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    const yearMatch = scheduledAt.match(/^(\d{4})-/);

    if (!yearMatch) {
      toast.error("Please enter a valid 4-digit year.");
      return;
    }

    const year = Number(yearMatch[1]);

    if (year < 2026 || year > 9999) {
      toast.error("Please enter a valid year.");
      return;
    }

    const selectedDate = new Date(scheduledAt);

    if (isNaN(selectedDate.getTime())) {
      toast.error("Please enter a valid date and time.");
      return;
    }

    if (selectedDate <= new Date()) {
      toast.error("Scheduled time must be in the future.");
      return;
    }

    setCreating(true);

    try {
      if (editingId) {
        await api.patch(`/notifications/${editingId}`, {
          title,
          message,
          channel,
          scheduledAt: new Date(scheduledAt).toISOString(),
        });

        toast.success("Notification updated successfully!");
      } else {
        await api.post("/notifications", {
          title,
          message,
          channel,
          scheduledAt: new Date(scheduledAt).toISOString(),
        });

        toast.success("Notification created successfully!");
      }

      await loadNotifications();

      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Could not save notification.");
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setTitle("");
    setMessage("");
    setChannel("EMAIL");
    setScheduledAt("");
    setEditingId(null);
  }

  async function deleteNotification(id: string) {
    const confirmed = window.confirm(
      "Delete this notification?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/notifications/${id}`);

      await loadNotifications();

      toast.success("Notification deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete notification.");
    }
  }

  function editNotification(notification: Notification) {
    setEditingId(notification.id);

    setTitle(notification.title);
    setMessage(notification.message);
    setChannel(notification.channel);

    const date = new Date(notification.scheduledAt);

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);

    setScheduledAt(localDate);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const filteredNotifications = notifications.filter(
    (notification) => {
      const query = search.toLowerCase();

      const matchesSearch =
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        notification.status === statusFilter;

      return matchesSearch && matchesStatus;
    },
  );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                NotifyX
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Notification Dashboard
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Create, schedule, and track your notifications.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3">
                {profile ? (
                  <>
                    <p className="font-semibold text-gray-900">
                      {profile.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {profile.email}
                    </p>

                    {profile.role && (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {profile.role}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    {profileError || "Loading profile..."}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href="/change-password"
                  className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Change Password
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-500">
              {stats.pending}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Sent
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.sent}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Failed
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {stats.failed}
            </p>
          </div>
        </section>

        {/* Create / Edit */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              {editingId ? "Edit notification" : "New notification"}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {editingId
                ? "Update your notification"
                : "Create a notification"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Schedule an email notification for a future date and
              time.
            </p>
          </div>

          <form onSubmit={createNotification} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>

              <input
                id="title"
                type="text"
                placeholder="e.g. Weekly report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Message
              </label>

              <textarea
                id="message"
                rows={4}
                placeholder="Write the notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="channel"
                  className="block text-sm font-medium text-gray-700"
                >
                  Channel
                </label>

                <select
                  id="channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="EMAIL">Email</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="scheduledAt"
                  className="block text-sm font-medium text-gray-700"
                >
                  Scheduled time
                </label>

                <input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    const value = e.target.value;

                    // Native datetime-local values normally use:
                    // YYYY-MM-DDTHH:mm
                    //
                    // Keep only the first 4 digits of the year.
                    const match = value.match(/^(\d+)(-.*)$/);

                    if (match) {
                      const year = match[1].slice(0, 4);
                      setScheduledAt(`${year}${match[2]}`);
                    } else {
                      setScheduledAt(value);
                    }
                  }}
                  min="2026-01-01T00:00"
                  max="9999-12-31T23:59"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? editingId
                    ? "Updating..."
                    : "Creating..."
                  : editingId
                    ? "Update Notification"
                    : "Create Notification"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Search + filters */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full lg:max-w-xl">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700"
              >
                Search notifications
              </label>

              <input
                id="search"
                type="text"
                placeholder="Search by title or message..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === "ALL"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({stats.total})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter("PENDING");
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === "PENDING"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending ({stats.pending})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter("SENT");
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === "SENT"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Sent ({stats.sent})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter("FAILED");
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === "FAILED"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Failed ({stats.failed})
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Notifications
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Your scheduled notifications
              </h2>
            </div>

            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                Loading notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-900">
                No notifications found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <article
                  key={notification.id}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {notification.channel}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            notification.status,
                          )}`}
                        >
                          {notification.status}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900">
                        {notification.title}
                      </h3>

                      <p className="mt-2 text-gray-600">
                        {notification.message}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          editNotification(notification)
                        }
                        className="rounded-lg border border-yellow-500 px-4 py-2 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                        className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 border-t pt-4 text-sm text-gray-500 sm:grid-cols-2">
                    <div>
                      <span className="font-medium text-gray-700">
                        Scheduled:
                      </span>{" "}
                      {formatDateTime(notification.scheduledAt)}
                    </div>

                    <div className="sm:text-right">
                      <span className="font-medium text-gray-700">
                        Channel:
                      </span>{" "}
                      {notification.channel}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                disabled={page === 1}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1),
                  )
                }
                disabled={page === totalPages}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* Notification History */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Audit trail
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Notification History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              See how each notification was created, updated, or
              deleted.
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-700">
                No activity yet.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Changes to your notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {auditLogs.map((notification) => {
                const latestEvent = getLatestHistoryEvent(
                  notification.history,
                );

                const latestSnapshot = latestEvent?.snapshot;

                return (
                  <div
                    key={notification.notificationId}
                    className="rounded-xl border border-gray-200 bg-slate-50 p-5"
                  >
                    {/* Current state */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Current state
                        </p>

                        <h3 className="mt-1 text-xl font-bold text-gray-900">
                          {latestSnapshot?.title ??
                            "Deleted Notification"}
                        </h3>

                        {latestSnapshot?.channel && (
                          <p className="mt-1 text-sm text-gray-500">
                            {latestSnapshot.channel}
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getActionClasses(
                            notification.latestAction,
                          )}`}
                        >
                          {notification.latestAction}
                        </span>

                        {notification.latestTime && (
                          <p className="mt-2 text-xs text-gray-500">
                            {formatDateTime(notification.latestTime)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative mt-6 border-l-2 border-gray-200 pl-6">
                      {notification.history.map(
                        (event, index) => (
                          <div
                            key={event.id}
                            className="relative pb-6 last:pb-0"
                          >
                            <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow" />

                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${getActionClasses(
                                    event.action,
                                  )}`}
                                >
                                  {event.action}
                                </span>

                                <span className="text-xs text-gray-500">
                                  {formatDateTime(
                                    event.createdAt,
                                  )}
                                </span>
                              </div>

                              {event.action === "CREATE" &&
                                event.snapshot && (
                                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                                    <p>
                                      <strong>Title:</strong>{" "}
                                      {event.snapshot.title}
                                    </p>

                                    <p>
                                      <strong>Message:</strong>{" "}
                                      {event.snapshot.message}
                                    </p>

                                    <p>
                                      <strong>Scheduled:</strong>{" "}
                                      {formatDateTime(
                                        event.snapshot
                                          .scheduledAt,
                                      )}
                                    </p>
                                  </div>
                                )}

                              {event.action === "UPDATE" &&
                                event.snapshot &&
                                event.previousSnapshot && (
                                  <div className="mt-4 space-y-4 text-sm">
                                    {event.snapshot.title !==
                                      event.previousSnapshot
                                        .title && (
                                      <div>
                                        <p className="font-semibold text-gray-800">
                                          Title
                                        </p>

                                        <p className="mt-1 text-red-600">
                                          {event.previousSnapshot.title}
                                        </p>

                                        <p className="my-1 text-xs text-gray-400">
                                          changed to
                                        </p>

                                        <p className="text-green-600">
                                          {event.snapshot.title}
                                        </p>
                                      </div>
                                    )}

                                    {event.snapshot.message !==
                                      event.previousSnapshot
                                        .message && (
                                      <div>
                                        <p className="font-semibold text-gray-800">
                                          Message
                                        </p>

                                        <p className="mt-1 text-red-600">
                                          {event.previousSnapshot.message}
                                        </p>

                                        <p className="my-1 text-xs text-gray-400">
                                          changed to
                                        </p>

                                        <p className="text-green-600">
                                          {event.snapshot.message}
                                        </p>
                                      </div>
                                    )}

                                    {event.snapshot
                                      .scheduledAt !==
                                      event.previousSnapshot
                                        .scheduledAt && (
                                      <div>
                                        <p className="font-semibold text-gray-800">
                                          Scheduled time
                                        </p>

                                        <p className="mt-1 text-red-600">
                                          {formatDateTime(
                                            event.previousSnapshot
                                              .scheduledAt,
                                          )}
                                        </p>

                                        <p className="my-1 text-xs text-gray-400">
                                          changed to
                                        </p>

                                        <p className="text-green-600">
                                          {formatDateTime(
                                            event.snapshot
                                              .scheduledAt,
                                          )}
                                        </p>
                                      </div>
                                    )}

                                    {event.snapshot.channel !==
                                      event.previousSnapshot
                                        .channel && (
                                      <div>
                                        <p className="font-semibold text-gray-800">
                                          Channel
                                        </p>

                                        <p className="mt-1 text-red-600">
                                          {event.previousSnapshot.channel}
                                        </p>

                                        <p className="my-1 text-xs text-gray-400">
                                          changed to
                                        </p>

                                        <p className="text-green-600">
                                          {event.snapshot.channel}
                                        </p>
                                      </div>
                                    )}

                                    {event.snapshot.title ===
                                      event.previousSnapshot
                                        .title &&
                                      event.snapshot.message ===
                                        event.previousSnapshot
                                          .message &&
                                      event.snapshot.scheduledAt ===
                                        event.previousSnapshot
                                          .scheduledAt &&
                                      event.snapshot.channel ===
                                        event.previousSnapshot
                                          .channel && (
                                        <p className="text-gray-500">
                                          Notification updated
                                          without changes to the
                                          tracked fields.
                                        </p>
                                      )}
                                  </div>
                                )}

                              {event.action === "DELETE" && (
                                <div className="mt-4 text-sm">
                                  <p className="font-semibold text-red-600">
                                    Notification deleted.
                                  </p>

                                  {event.snapshot && (
                                    <div className="mt-3 space-y-1 text-gray-700">
                                      <p>
                                        <strong>
                                          Final title:
                                        </strong>{" "}
                                        {event.snapshot.title}
                                      </p>

                                      <p>
                                        <strong>
                                          Final message:
                                        </strong>{" "}
                                        {event.snapshot.message}
                                      </p>

                                      {event.snapshot
                                        .scheduledAt && (
                                        <p>
                                          <strong>
                                            Final scheduled time:
                                          </strong>{" "}
                                          {formatDateTime(
                                            event.snapshot
                                              .scheduledAt,
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {index <
                              notification.history.length - 1 && (
                              <div className="h-4" />
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}