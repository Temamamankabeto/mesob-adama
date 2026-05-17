"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Search } from "lucide-react";

import { useUsers, useDeleteUser } from "@/hooks/user/useUsers";
import { useToggleUserStatus } from "@/hooks/user/useToggleUserStatus";

import { locationLevelLabel, normalizeRoleName, roleLabel } from "@/config/roles.config";
import { authService } from "@/services/auth/auth.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function canToggleUsers() {
  const user = authService.getStoredUser() as any;
  const roles = authService.getStoredRoles();

  const role = normalizeRoleName(roles?.[0] || user?.role);

  if (role === "super_admin") {
    return true;
  }

  if (role !== "admin") {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | Activation rule
  |--------------------------------------------------------------------------
  | Only City Admin has final activation authority.
  | Subcity Admin and Woreda Admin should not see Enable/Disable action.
  */
  return user?.location_level === "city" || (user?.city_id && !user?.subcity_id && !user?.woreda_id);
}

export default function UsersPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useUsers({
    page,
    search,
  });

  const users = data?.data || [];
  const meta = data?.meta || {};

  const deleteUser = useDeleteUser();
  const toggleStatus = useToggleUserStatus();

  const showToggleAction = canToggleUsers();

  const handleDelete = (id: number) => {
    if (confirm("Delete user?")) {
      deleteUser.mutate(id);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage users by role and location scope.
          </p>
        </div>

        <Button onClick={() => router.push("/dashboard/users/add")}>
          Add User
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
                <TableHead>Level</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Subcity</TableHead>
                <TableHead>Woreda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any, index: number) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>

                    <TableCell>
                      {(user.role_names || [user.role])
                        .filter(Boolean)
                        .map((role: string) => (
                          <span
                            key={role}
                            className="mr-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                          >
                            {roleLabel(role)}
                          </span>
                        ))}
                    </TableCell>

                    <TableCell>
                      {locationLevelLabel(user.location_level) || "-"}
                    </TableCell>

                    <TableCell>{user.city?.name || "-"}</TableCell>
                    <TableCell>{user.subcity?.name || "-"}</TableCell>
                    <TableCell>{user.woreda?.name || "-"}</TableCell>

                    <TableCell>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          user.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.is_active ? "Active" : "Disabled"}
                      </span>
                    </TableCell>

                    {/* ACTION */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/users/${user.id}`)
                            }
                          >
                            View
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/users/${user.id}/edit`)
                            }
                          >
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/users/${user.id}/change-password`
                              )
                            }
                          >
                            Change Password
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => toggleStatus.mutate(user.id)}
                          >
                            {user.is_active ? "Disable" : "Enable"}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(user.id)}
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
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {meta?.current_page || 1} of {meta?.last_page || 1}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={meta?.current_page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Prev
              </Button>

              <Button
                variant="outline"
                disabled={meta?.current_page >= meta?.last_page}
                onClick={() =>
                  setPage((p) =>
                    Math.min(p + 1, meta?.last_page || p)
                  )
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