"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/user/useUsers";

/* UI */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToggleUserStatus } from "@/hooks/user/useToggleUserStatus";
/* Dropdown */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreVertical } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();

  const { data } = useUsers(1);
  const users = data?.data || [];
  const meta = data?.meta;

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleDelete = (id: number) => {
    if (confirm("Delete user?")) deleteUser.mutate(id);
  };

  const toggleStatus = useToggleUserStatus();

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Users</h1>

        <Button onClick={() => router.push("/dashboard/users/add")}>
          + Add User
        </Button>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u.id}>

                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>

                  {/* ✅ Spatie single role */}
                  <TableCell>{u.role || "-"}</TableCell>

                  {/* STATUS */}
                  <TableCell>
  <span
    className={`px-2 py-1 rounded text-xs font-medium ${
      Boolean(u.is_active)
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {Boolean(u.is_active) ? "Active" : "Disabled"}
  </span>
</TableCell>

                  {/* ACTION MENU */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">

                        {/* VIEW */}
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/users/${u.id}`)
                          }
                        >
                          View
                        </DropdownMenuItem>

                        {/* EDIT */}
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/users/${u.id}/edit`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>

                        {/* CHANGE PASSWORD */}
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/users/${u.id}/change-password`
                            )
                          }
                        >
                          Change Password
                        </DropdownMenuItem>

                   <DropdownMenuItem onClick={() => toggleStatus.mutate(u.id)}>
  {u.is_active ? "Disable User" : "Enable User"}
</DropdownMenuItem>

                        {/* DELETE */}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(u.id)}
                        >
                          Delete
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>

          </Table>
        </CardContent>
      </Card>

      {/* PAGINATION */}
      <div className="flex gap-2">
        <Button disabled={meta?.current_page === 1}>
          Prev
        </Button>

        <span>Page {meta?.current_page}</span>

        <Button>
          Next
        </Button>
      </div>
    </div>
  );
}