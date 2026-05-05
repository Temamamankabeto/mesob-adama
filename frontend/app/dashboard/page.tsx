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
      .catch((err) => setError(err?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    localStorage.clear();
    router.replace("/login");
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <main className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <Card title="Users" value={data?.total_users} />
        <Card title="Customers" value={data?.total_customers} />
        <Card title="Requests" value={data?.total_requests} />
        <Card title="Pending" value={data?.pending_requests} />
      </div>
    </main>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p>{title}</p>
      <h2 className="text-2xl">{value || 0}</h2>
    </div>
  );
}
