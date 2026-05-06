"use client";
import { useServiceRequestsQuery } from "@/hooks/services/use-service";

export default function ServiceRequestsPage() {
  const { data, isLoading } = useServiceRequestsQuery( { assigned: true });
  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Assigned Requests</h1>
      {isLoading ? <p>Loading...</p> : (
        <div className="rounded-md border bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="p-2 text-left">ID</th><th className="p-2 text-left">Service</th><th className="p-2 text-left">Status</th></tr></thead>
            <tbody>{items.map((item: any) => <tr key={item.id} className="border-b"><td className="p-2">{item.id}</td><td className="p-2">{item.service_name}</td><td className="p-2">{item.status}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
