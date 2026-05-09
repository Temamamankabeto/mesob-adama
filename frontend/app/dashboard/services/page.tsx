"use client";

import { useState } from "react";

import { useServices } from "@/hooks/services/use-service";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Search, MoreVertical } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ServicePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useServices({
    page,
    search,
  });

  const services = data?.data || [];
  const meta = data?.meta || {};

  /* MODAL STATES */
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selected, setSelected] = useState<any>(null);

  /* OPEN VIEW */
  const handleView = (service: any) => {
    setSelected(service);
    setViewOpen(true);
  };

  /* OPEN EDIT */
  const handleEdit = (service: any) => {
    setSelected(service);
    setEditOpen(true);
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Services
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage system services
          </p>

          <div className="mt-2 text-sm font-medium">
            Total Services: {meta?.total || 0}
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            className="pl-10"
            placeholder="Search services..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Fee</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  No services found
                </td>
              </tr>
            ) : (
              services.map((s: any) => (
                <tr key={s.id} className="border-b">

                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.service_fee}</td>
                  <td className="p-3">{s.status}</td>

                  {/* ACTION */}
                  <td className="p-3 text-right">

                    <DropdownMenu>

                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">

                        <DropdownMenuItem
                          onClick={() => handleView(s)}
                        >
                          View
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleEdit(s)}
                        >
                          Edit
                        </DropdownMenuItem>

                      </DropdownMenuContent>

                    </DropdownMenu>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between">

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
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>

        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">

              <div>
                <strong>Name:</strong> {selected.name}
              </div>

              <div>
                <strong>Fee:</strong> {selected.service_fee}
              </div>

              <div>
                <strong>Status:</strong> {selected.status}
              </div>

              <div>
                <strong>Description:</strong>{" "}
                {selected.description || "-"}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= EDIT MODAL ================= */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">

              <Input
                defaultValue={selected.name}
              />

              <Input
                defaultValue={selected.service_fee}
              />

              <Input
                defaultValue={selected.status}
              />

              <Button className="w-full">
                Save Changes
              </Button>

            </div>
          )}

        </DialogContent>
      </Dialog>

    </div>
  );
}