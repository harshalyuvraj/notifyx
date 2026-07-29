"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
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

  }, []);


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




  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">

        <h1 className="mb-8 text-4xl font-bold text-blue-600">
          NotifyX Dashboard
        </h1>

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