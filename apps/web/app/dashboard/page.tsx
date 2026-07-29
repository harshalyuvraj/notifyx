"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

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

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadNotifications() {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();

  }, [router]);


  async function createNotification(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setCreating(true);

    try {
      const res = await api.post("/notifications", {
        title,
        message,
        channel,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });

      setNotifications((prev) => [
        res.data,
        ...prev,
      ]);

      setTitle("");
      setMessage("");
      setChannel("EMAIL");
      setScheduledAt("");
    } catch (err) {
      console.error(err);
      alert("Could not create notification.");
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

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    } catch (err) {
      console.error(err);
      alert("Could not delete notification.");
    }
  }



  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }




  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-blue-600">
            NotifyX Dashboard
          </h1>

          <button
            onClick={logout}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
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
              ? "Creating..."
              : "Create Notification"}
          </button>
        </form>


        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-lg bg-white p-5 shadow"
              >
                <h2 className="text-xl font-semibold">
                  {notification.title}
                </h2>

                <p className="mt-2">
                  {notification.message}
                </p>


                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Delete
                </button>

                <div className="mt-4 text-sm text-gray-500">
                  <p>Channel: {notification.channel}</p>
                  <p>Status: {notification.status}</p>
                  <p>
                    Scheduled:
                    {" "}
                    {new Date(
                      notification.scheduledAt,
                    ).toLocaleString()}
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