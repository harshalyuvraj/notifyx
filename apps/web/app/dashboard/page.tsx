"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

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


  async function loadNotifications() {
    setLoading(true);

    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);

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

    async function initializeDashboard() {
      await loadNotifications();
    }

    initializeDashboard();
  }, [router]);


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

    if (year < 2000 || year > 9999) {
      toast.error("Please enter a valid year.");
      return;
    }

    setCreating(true);

    try {

      const selectedDate = new Date(scheduledAt);

      if (selectedDate <= new Date()) {
        toast.error("Scheduled time must be in the future.");
        return;
      }


      let res;

      if (editingId) {
        res = await api.patch(`/notifications/${editingId}`, {
          title,
          message,
          channel,
          scheduledAt: new Date(scheduledAt).toISOString(),
        });
      } else {

        res = await api.post("/notifications", {
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


        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          <div className="space-y-6">
            {notifications.map((notification) => (
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

      </div>
    </main>
  );
}