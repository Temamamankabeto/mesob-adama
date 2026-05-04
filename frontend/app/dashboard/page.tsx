"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboard } from "@/lib/mesob-api";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("mesob_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    localStorage.clear();
    router.replace("/login");
  }

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">MESOB eService Dashboard</h1>
          <p className="text-sm text-gray-500">Adama City digital service management</p>
        </div>
        <button onClick={logout} className="rounded bg-red-600 px-4 py-2 text-white">Logout</button>
      </div>

      {error ? <div className="rounded bg-red-50 p-4 text-red-700">{error}</div> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat title="Total Users" value={data?.total_users ?? 0} />
          <Stat title="Customers" value={data?.total_customers ?? 0} />
          <Stat title="Service Requests" value={data?.total_requests ?? 0} />
          <Stat title="Pending Requests" value={data?.pending_requests ?? 0} />
          <Stat title="Active Users" value={data?.active_users ?? 0} />
          <Stat title="Suspended Users" value={data?.suspended_users ?? 0} />
          <Stat title="Completed Requests" value={data?.completed_requests ?? 0} />
        </div>
      )}
    </main>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return <div className="rounded bg-white p-5 shadow"><p className="text-sm text-gray-500">{title}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>;
}
