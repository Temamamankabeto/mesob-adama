"use client";

import { useMyApplications } from "@/hooks/useApplications";
import StatusBadge from "@/components/application/StatusBadge";

export default function MyApplicationsPage() {

  const { data, isLoading } =
    useMyApplications();

  const applications =
    data?.data?.data || [];

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        My Applications
      </h1>

      <div className="overflow-hidden rounded-xl border">

        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                Tracking Number
              </th>

              <th className="p-3 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {applications.map((item: any) => (
              <tr
                key={item.id}
                className="border-t"
              >
                <td className="p-3">
                  {item.tracking_number}
                </td>

                <td className="p-3">
                  <StatusBadge
                    status={item.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
