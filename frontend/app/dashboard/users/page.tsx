"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, RefreshCw, Search } from "lucide-react";

import {
  useDeleteUser,
  useToggleUserStatus,
  useUsers,
} from "@/hooks/user/useUsers";

import { useCities } from "@/hooks/location/useCities";
import { useSubcities } from "@/hooks/location/useSubcities";
import { useWoredas } from "@/hooks/location/useWoredas";

import {
  locationLevelLabel,
  normalizeRoleName,
  roleLabel,
} from "@/config/roles.config";

import { authService } from "@/services/auth/auth.service";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function listFrom(value: any) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
}

function currentUserLevel(user: any) {
  if (user?.woreda_id) return "woreda";
  if (user?.subcity_id) return "subcity";
  if (user?.city_id) return "city";
  return user?.location_level || "";
}

function isSuperAdminUser(user: any) {
  const roles =
    user?.role_names ||
    user?.roles?.map((role: any) => role.name) ||
    [user?.role];

  return roles
    .filter(Boolean)
    .map((role: string) => normalizeRoleName(role))
    .includes("super_admin");
}

function canToggleUsers() {
  const user = authService.getStoredUser() as any;
  const roles = authService.getStoredRoles();
  const role = normalizeRoleName(roles?.[0] || user?.role);
  const level = currentUserLevel(user);

  if (role === "super_admin") return true;
  if (role === "admin" && level === "city") return true;

  return false;
}

export default function UsersPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [cityId, setCityId] = useState("");
  const [subcityId, setSubcityId] = useState("");
  const [woredaId, setWoredaId] = useState("");

  const { data: citiesData } = useCities();
  const { data: subcitiesData } = useSubcities();
  const { data: woredasData } = useWoredas();

  const cities = listFrom(citiesData);
  const subcities = listFrom(subcitiesData);
  const woredas = listFrom(woredasData);

  const {
    data,
    isLoading,
    refetch,
  } = useUsers({
    page,
    search,
    status,
    role,
    city_id: cityId,
    subcity_id: subcityId,
    woreda_id: woredaId,
  });

  const authUser = authService.getStoredUser() as any;

  const users = (data?.data || [])
    .filter((user: any) => {
      if (Number(user?.id) === Number(authUser?.id)) return false;
      if (isSuperAdminUser(user)) return false;
      return true;
    })
    .sort((first: any, second: any) => Number(first.id) - Number(second.id));

  const meta = data?.meta || {};

  const deleteUser = useDeleteUser();
  const toggleStatus = useToggleUserStatus();

  const showToggleAction = canToggleUsers();

  function rowNumber(index: number) {
    const currentPage = Number(meta?.current_page || page || 1);
    const perPage = Number(meta?.per_page || 10);

    return (currentPage - 1) * perPage + index + 1;
  }

  function canToggleRow(user: any) {
    return showToggleAction && Number(user?.id) !== Number(authUser?.id) && !isSuperAdminUser(user);
  }

  function canDeleteRow(user: any) {
    return Number(user?.id) !== Number(authUser?.id) && !isSuperAdminUser(user);
  }

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser.mutate(id);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setRole("");
    setCityId("");
    setSubcityId("");
    setWoredaId("");
    setPage(1);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage users by role and location hierarchy.
          </p>
        </div>

        <Button onClick={() => router.push("/dashboard/users/add")}>
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setStatus(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent className="z-[9999]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={role || "all"}
              onValueChange={(value) => {
                setRole(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>

              <SelectContent className="z-[9999]">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="back_officer">Back Officer</SelectItem>
                <SelectItem value="front_officer">Front Officer</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={cityId || "all"}
              onValueChange={(value) => {
                const selected = value === "all" ? "" : value;
                setCityId(selected);
                setSubcityId("");
                setWoredaId("");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>

              <SelectContent className="z-[9999]">
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city: any) => (
                  <SelectItem key={city.id} value={String(city.id)}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={subcityId || "all"}
              onValueChange={(value) => {
                const selected = value === "all" ? "" : value;
                setSubcityId(selected);
                setWoredaId("");
                setPage(1);
              }}
              disabled={!cityId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Subcity" />
              </SelectTrigger>

              <SelectContent className="z-[9999]">
                <SelectItem value="all">All Subcities</SelectItem>
                {subcities
                  .filter((subcity: any) => !cityId || Number(subcity.city_id) === Number(cityId))
                  .map((subcity: any) => (
                    <SelectItem key={subcity.id} value={String(subcity.id)}>
                      {subcity.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select
              value={woredaId || "all"}
              onValueChange={(value) => {
                setWoredaId(value === "all" ? "" : value);
                setPage(1);
              }}
              disabled={!subcityId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Woreda" />
              </SelectTrigger>

              <SelectContent className="z-[9999]">
                <SelectItem value="all">All Woredas</SelectItem>
                {woredas
                  .filter((woreda: any) => !subcityId || Number(woreda.subcity_id) === Number(subcityId))
                  .map((woreda: any) => (
                    <SelectItem key={woreda.id} value={String(woreda.id)}>
                      {woreda.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Subcity</TableHead>
                  <TableHead>Woreda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: any, index: number) => (
                    <TableRow key={user.id}>
                      <TableCell>{rowNumber(index)}</TableCell>

                      <TableCell className="font-medium">{user.name}</TableCell>

                      <TableCell>{user.email}</TableCell>

                      <TableCell>{user.phone || "-"}</TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(user.role_names || [user.role])
                            .filter(Boolean)
                            .map((item: string) => (
                              <span
                                key={item}
                                className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                              >
                                {roleLabel(item)}
                              </span>
                            ))}
                        </div>
                      </TableCell>

                      <TableCell>{locationLevelLabel(user.location_level) || "-"}</TableCell>

                      <TableCell>{user.city?.name || "-"}</TableCell>

                      <TableCell>{user.subcity?.name || "-"}</TableCell>

                      <TableCell>{user.woreda?.name || "-"}</TableCell>

                      <TableCell>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.is_active ? "Active" : "Disabled"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/users/${user.id}`)}
                              >
                                View
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}
                              >
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/users/${user.id}/change-password`)}
                              >
                                Change Password
                              </DropdownMenuItem>

                              {canToggleRow(user) && (
                                <DropdownMenuItem onClick={() => toggleStatus.mutate(user.id)}>
                                  {user.is_active ? "Disable" : "Enable"}
                                </DropdownMenuItem>
                              )}

                              {canDeleteRow(user) && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              Page {meta?.current_page || 1} of {meta?.last_page || 1}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={Number(meta?.current_page || 1) <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Prev
              </Button>

              <Button
                variant="outline"
                disabled={Number(meta?.current_page || 1) >= Number(meta?.last_page || 1)}
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, Number(meta?.last_page || current))
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
