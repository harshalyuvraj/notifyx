"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getProfile } from "@/lib/api";

interface UserStats {
  id: string;
  name: string;
  email: string;
  role: string;
  total: number;
  sent: number;
  pending: number;
  failed: number;
}

interface Overview {
  totalUsers: number;
  totalNotifications: number;
  sent: number;
  pending: number;
  failed: number;
}

interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileRes, overviewRes, usersRes] =
          await Promise.all([
            getProfile(),
            api.get("/users/admin/overview"),
            api.get("/users/admin/stats"),
          ]);

          if (profileRes.role !== "ADMIN") {
            router.replace("/dashboard");
            return;
          }

        setAdmin(profileRes);

        setOverview(overviewRes.data);

        setUsers(usersRes.data);
      } catch (error) {
        console.error("Failed loading admin dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        user.email
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleDeleteUser = async (
    id: string,
    name: string
  ) => {
    const confirmDelete = window.confirm(
      `Delete ${name}?`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${id}`);

      setUsers((prev) =>
        prev.filter((u) => u.id !== id)
      );

      setOverview((prev) =>
        prev
          ? {
              ...prev,
              totalUsers: prev.totalUsers - 1,
            }
          : prev
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              NOTIFYX ADMIN
            </p>

            <h1 className="mt-2 text-5xl font-bold text-slate-900">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-slate-500">
              Manage users and monitor
              notification activity.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <h2 className="font-bold">
                {admin?.name}
              </h2>

              <p className="text-sm text-slate-500">
                {admin?.email}
              </p>

              <span className="text-sm font-semibold text-blue-600">
                {admin?.role}
              </span>
            </div>

            <button
              onClick={() =>
                router.push("/change-password")
              }
              className="rounded-xl border border-blue-600 px-5 py-3 font-semibold text-blue-600"
            >
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}

        <div className="mb-8 grid gap-4 md:grid-cols-5">
          <StatCard
            title="Users"
            value={overview?.totalUsers ?? 0}
          />

          <StatCard
            title="Notifications"
            value={
              overview?.totalNotifications ?? 0
            }
          />

          <StatCard
            title="Sent"
            value={overview?.sent ?? 0}
          />

          <StatCard
            title="Pending"
            value={overview?.pending ?? 0}
          />

          <StatCard
            title="Failed"
            value={overview?.failed ?? 0}
          />
        </div>

        {/* User Management */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                User Management
              </h2>

              <p className="text-slate-500">
                View and manage users.
              </p>
            </div>
          </div>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by name or email..."
            className="mb-6 w-full rounded-xl border p-3"
          />

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Sent</th>
                  <th className="p-4">Pending</th>
                  <th className="p-4">Failed</th>
                  <th className="p-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b"
                  >
                    <td className="p-4">
                      {user.name}
                    </td>

                    <td className="p-4">
                      {user.email}
                    </td>

                    <td className="p-4">
                      {user.role}
                    </td>

                    <td className="p-4">
                      {user.total}
                    </td>

                    <td className="p-4 text-green-600 font-semibold">
                      {user.sent}
                    </td>

                    <td className="p-4 text-yellow-600 font-semibold">
                      {user.pending}
                    </td>

                    <td className="p-4 text-red-600 font-semibold">
                      {user.failed}
                    </td>

                    <td className="p-4">
                      {user.role !== "ADMIN" && (
                        <button
                          onClick={() =>
                            handleDeleteUser(
                              user.id,
                              user.name
                            )
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-white"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="py-10 text-center text-slate-500">
                No users found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold">
        {value}
      </h3>
    </div>
  );
}