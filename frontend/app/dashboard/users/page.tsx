"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  useUsers,
  useDeleteUser,
} from "@/hooks/user/useUsers";

import { useToggleUserStatus } from "@/hooks/user/useToggleUserStatus";

/* UI */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* Dropdown */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreVertical, Search } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();

  /* PAGINATION + SEARCH STATE */
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  /* FETCH USERS */
  const { data, isLoading } = useUsers(page, search);

  const users = data?.data || [];
  const meta = data?.meta;

  const deleteUser = useDeleteUser();
  const toggleStatus = useToggleUserStatus();

  const handleDelete = (id: number) => {
    if (confirm("Delete user?")) {
      deleteUser.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>

        <Button onClick={() => router.push("/dashboard/users/add")}>
          + Add User
        </Button>
      </div>

      {/* SEARCH */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

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
                <TableHead>City</TableHead>
                <TableHead>Subcity</TableHead>
                <TableHead>Woreda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u: any) => (
                  <TableRow key={u.id}>

                    <TableCell>{u.name}</TableCell>

                    <TableCell>{u.email}</TableCell>

                    <TableCell>{u.phone}</TableCell>

               <TableCell>
  {u.role_names?.length > 0 ? (
    u.role_names.map((role: string, i: number) => (
      <span
        key={i}
        className="px-2 py-1 mr-1 rounded text-xs bg-blue-100 text-blue-700"
      >
        {role}
      </span>
    ))
  ) : (
    "-"
  )}
</TableCell>
                    <TableCell>{u.city?.name || "Adama"}</TableCell>
                    <TableCell>{u.subcity?.name || "-"}</TableCell>
                    <TableCell>{u.woreda?.name || "-"}</TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          Boolean(u.is_active)
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {Boolean(u.is_active)
                          ? "Active"
                          : "Disabled"}
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
                              router.push(
                                `/dashboard/users/${u.id}/edit`
                              )
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

                          {/* ENABLE/DISABLE */}
                          <DropdownMenuItem
                            onClick={() =>
                              toggleStatus.mutate(u.id)
                            }
                          >
                            {u.is_active
                              ? "Disable User"
                              : "Enable User"}
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
                ))
              )}

            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-6">

            <div className="text-sm text-muted-foreground">
              Showing page {meta?.current_page || 1} of{" "}
              {meta?.last_page || 1}
            </div>

            <div className="flex gap-2">

              {/* PREV */}
              <Button
                variant="outline"
                disabled={meta?.current_page === 1}
                onClick={() =>
                  setPage((prev) => Math.max(prev - 1, 1))
                }
              >
                Prev
              </Button>

              {/* NEXT */}
              <Button
                variant="outline"
                disabled={
                  meta?.current_page === meta?.last_page
                }
                onClick={() =>
                  setPage((prev) => prev + 1)
                }
              >
                Next
              </Button>

            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}