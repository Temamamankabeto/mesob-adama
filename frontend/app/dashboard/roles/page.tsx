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
  const { roles, meta, loading, error, fetchRoles } = useRoles();

  const [open, setOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const handleOpen = (roleId: number) => {
    setSelectedRoleId(roleId);
    setOpen(true);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  const safeRoles = roles ?? [];

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Roles Management</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Guard</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {safeRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No roles found
                  </TableCell>
                </TableRow>
              ) : (
                safeRoles.map((role: any) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.id}</TableCell>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.guard_name}</TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpen(role.id)}
                          >
                            Assign Permissions
                          </DropdownMenuItem>

                          {/* you can add more actions here later */}
                          <DropdownMenuItem>
                            Edit Role
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-red-600">
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

          {/* Pagination */}
          <div className="flex gap-2 pt-4">
            {Array.from({ length: meta?.last_page || 1 }).map((_, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => fetchRoles(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MODAL */}
      <AssignPermissionModal
        open={open}
        onClose={() => setOpen(false)}
        roleId={selectedRoleId}
      />
    </div>
  );
}