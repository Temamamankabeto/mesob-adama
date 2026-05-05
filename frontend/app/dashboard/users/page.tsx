import React from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
};

const users: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "Inactive" },
  { id: 3, name: "Michael Lee", email: "michael@example.com", role: "User", status: "Active" },
];

export default function UsersPage() {
  return (
    <div className="p-6">
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-semibold">User List</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 border-b">#</th>
                <th className="p-3 border-b">Name</th>
                <th className="p-3 border-b">Email</th>
                <th className="p-3 border-b">Role</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{user.id}</td>
                  <td className="p-3 border-b">{user.name}</td>
                  <td className="p-3 border-b">{user.email}</td>
                  <td className="p-3 border-b">{user.role}</td>
                  <td className="p-3 border-b">
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 border-b text-center space-x-2">
                    <button className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}