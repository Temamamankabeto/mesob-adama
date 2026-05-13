"use client";

import { useState } from "react";
import { useRoles } from "@/hooks/roles/useRoles";
import AssignPermissionModal from "@/components/roles/AssignPermissionModal";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreVertical } from "lucide-react";

export default function RolesPage() {
  const {
    roles,
    loading,
    error,
    addRole,
    editRole,
    removeRole,
  } = useRoles();

  const [open, setOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] =
    useState<number | null>(null);

  const [newRoleName, setNewRoleName] = useState("");

  const handleOpen = (roleId: number) => {
    setSelectedRoleId(roleId);
    setOpen(true);
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;

    await addRole(newRoleName);

    setNewRoleName("");
  };

  const handleEditRole = async (
    id: number,
    currentName: string
  ) => {
    const newName = prompt(
      "Enter new role name",
      currentName
    );

    if (!newName) return;

    await editRole(id, newName);
  };

  const handleDeleteRole = async (
    id: number,
    name: string
  ) => {
    const confirmed = confirm(
      `Delete role "${name}"?`
    );

    if (!confirmed) return;

    await removeRole(id);
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (error) {
    return (
      <p className="p-6 text-red-500">
        {error}
      </p>
    );
  }

  const safeRoles = roles ?? [];

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Roles Management</CardTitle>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New role name"
              value={newRoleName}
              onChange={(e) =>
                setNewRoleName(e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm"
            />

            <Button onClick={handleCreateRole}>
              Create Role
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>

                <TableHead>Name</TableHead>

                <TableHead>Guard</TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
  {safeRoles.length === 0 ? (
    <TableRow>
      <TableCell
        colSpan={4}
        className="text-center py-6"
      >
        No roles found
      </TableCell>
    </TableRow>
  ) : (
    safeRoles.map((role: any, index: number) => (
      <TableRow key={role.id}>
        <TableCell>
          {index + 1}
        </TableCell>

        <TableCell>
          {role.name}
        </TableCell>

        <TableCell>
          {role.guard_name}
        </TableCell>

        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  handleOpen(role.id)
                }
              >
                Assign Permissions
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  handleEditRole(
                    role.id,
                    role.name
                  )
                }
              >
                Edit Role
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-600"
                onClick={() =>
                  handleDeleteRole(
                    role.id,
                    role.name
                  )
                }
              >
                Delete Role
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ASSIGN PERMISSION MODAL */}
      <AssignPermissionModal
        open={open}
        onClose={() => setOpen(false)}
        roleId={selectedRoleId}
      />
    </div>
  );
}