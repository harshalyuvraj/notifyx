"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

interface Notification {
  id: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  scheduledAt: string;
}

export default function DashboardPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("EMAIL");
  const [scheduledAt, setScheduledAt] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
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


  async function loadNotifications() {
    setLoading(true);

    try {
      const res = await api.get(
        `/notifications?page=${page}&limit=5&search=${encodeURIComponent(search)}`,
      );

      setNotifications(res.data.notifications);

      setTotalPages(res.data.totalPages);

      const statsRes = await api.get("/notifications/stats");
      setStats(statsRes.data);
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
    const socket = io("http://localhost:3001");

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

    const selectedDate = new Date(scheduledAt);

    if (isNaN(selectedDate.getTime())) {
      toast.error("Please enter a valid date and time.");
      return;
    }

    const year = selectedDate.getFullYear();

    if (year < 2026 || year > 9999) {
      toast.error("Please enter a valid year.");
      return;
    }

    setCreating(true);

    try {

      if (selectedDate <= new Date()) {
        toast.error("Scheduled time must be in the future.");
        return;
      }

      if (editingId) {
        await api.patch(`/notifications/${editingId}`, {
          title,
          message,
          channel,
          scheduledAt: new Date(scheduledAt).toISOString(),
        });
      } else {

        await api.post("/notifications", {
          title,
          message,
          channel,
          scheduledAt: new Date(scheduledAt).toISOString(),
        });
      }

      await loadNotifications();

      if (editingId) {
        toast.success("Notification updated successfully!");
      } else {
        toast.success("Notification created successfully!");
      }

      setTitle("");
      setMessage("");
      setChannel("EMAIL");
      setScheduledAt("");
      setEditingId(null);
    } catch (err) {
      console.error(err);
      toast.error("Could not save notification.");
    } finally {
      setCreating(false);
    }
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
  }



  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const filteredNotifications = notifications.filter((notification) => {
    const query = search.toLowerCase();

    const matchesSearch =
      notification.title.toLowerCase().includes(query) ||
      notification.message.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" ||
      notification.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  return (
    <main className="min-h-screen bg-slate-200 p-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8 flex items-center justify-between">

          <h1 className="text-5xl font-extrabold text-blue-600">
            NotifyX Dashboard
          </h1>

          <button
            onClick={logout}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>


        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-5 shadow transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Total</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {stats.total}
            </h2>
          </div>

          <div className="rounded-lg bg-white p-5 shadow transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Pending</p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-500">
              {stats.pending}
            </h2>
          </div>

          <div className="rounded-lg bg-white p-5 shadow transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Sent</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {stats.sent}
            </h2>
          </div>

          <div className="rounded-lg bg-white p-5 shadow transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Failed</p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {stats.failed}
            </h2>
          </div>
        </div>

        <form
          onSubmit={createNotification}
          className="mb-10 rounded-lg bg-white p-6 shadow space-y-4"
        >
          <h2 className="text-2xl font-semibold">
            Create Notification
          </h2>

          <input
            className="w-full rounded border p-3"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full rounded border p-3"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <select
            className="w-full rounded border p-3"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="EMAIL">EMAIL</option>
          </select>

          <input
            type="datetime-local"
            className="w-full rounded border p-3"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />

          <button
            disabled={creating}
            className="rounded bg-blue-600 px-5 py-3 text-white"
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
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setMessage("");
                setChannel("EMAIL");
                setScheduledAt("");
              }}
              className="ml-3 rounded bg-gray-500 px-5 py-3 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          )}


        </form>

        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-semibold">
            Search Notifications
          </h2>

          <input
            type="text"
            placeholder="Search by title or message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ALL");
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 font-medium transition ${
              statusFilter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
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
            className={`rounded-full px-4 py-2 font-medium transition ${
              statusFilter === "PENDING"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
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
            className={`rounded-full px-4 py-2 font-medium transition ${
              statusFilter === "SENT"
                ? "bg-green-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
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
            className={`rounded-full px-4 py-2 font-medium transition ${
              statusFilter === "FAILED"
                ? "bg-red-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Failed ({stats.failed})
          </button>
        </div>


        {loading ? (
          <p>Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <p className="rounded-lg bg-white p-6 text-center text-gray-500 shadow">
            No notifications match your search.
          </p>
        ) : (
          <div className="space-y-6">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-xl bg-white p-6 shadow transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    📧 {notification.channel}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      notification.status === "SENT"
                        ? "bg-green-100 text-green-700"
                        : notification.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {notification.status}
                  </span>
                </div>

                <h2 className="text-2xl font-bold">
                  {notification.title}
                </h2>

                <p className="mt-2 text-gray-600">
                  {notification.message}
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => editNotification(notification)}
                    className="rounded bg-yellow-500 px-4 py-2 text-white transition hover:bg-yellow-600"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                  >
                    🗑 Delete
                  </button>
                </div>

                <div className="mt-5 border-t pt-4 text-sm text-gray-500">
                  <p>
                    📅{" "}
                    {new Date(notification.scheduledAt).toLocaleDateString()}
                  </p>

                  <p>
                    🕒{" "}
                    {new Date(notification.scheduledAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded bg-gray-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="rounded-lg bg-white px-4 py-2 shadow">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}  

      </div>
    </main>
  );
}