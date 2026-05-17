"use client";

import { useState } from "react";

import {
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
} from "@/hooks/services/use-service";

import {
  Service,
  ServiceAvailability,
} from "@/types/services/service";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { Checkbox } from "@/components/ui/checkbox";

import { MoreVertical, Search } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FormState = {
  name: string;
  description: string;
  has_back_officer: boolean;
  service_fee: number;
  availability: ServiceAvailability[];
  status: "active" | "inactive";
};

export default function ServicePage() {

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const [page, setPage] =
    useState(1);

  /*
  |--------------------------------------------------------------------------
  | FILTERS
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] =
    useState("");

  const [statusFilter,
    setStatusFilter] =
    useState("all");

  /*
  |--------------------------------------------------------------------------
  | DIALOGS
  |--------------------------------------------------------------------------
  */

  const [createOpen,
    setCreateOpen] =
    useState(false);

  const [editOpen,
    setEditOpen] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | SELECTED SERVICE
  |--------------------------------------------------------------------------
  */

  const [selectedService,
    setSelectedService] =
    useState<Service | null>(
      null
    );

  /*
  |--------------------------------------------------------------------------
  | FORM DATA
  |--------------------------------------------------------------------------
  */

  const [formData,
    setFormData] =
    useState<FormState>({
      name: "",
      description: "",
      has_back_officer: false,
      service_fee: 0,
      availability: [],
      status: "active",
    });

  /*
  |--------------------------------------------------------------------------
  | QUERIES
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading,
  } = useServices(page);

  /*
  |--------------------------------------------------------------------------
  | FILTERED SERVICES
  |--------------------------------------------------------------------------
  */

  const filteredServices =
    data?.data?.data?.filter(
      (
        service: Service
      ) => {

        const matchesSearch =
          service.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesStatus =
          statusFilter ===
          "all"
            ? true
            : service.status ===
              statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    ) || [];

  /*
  |--------------------------------------------------------------------------
  | MUTATIONS
  |--------------------------------------------------------------------------
  */

  const createMutation =
    useCreateService();

  const updateMutation =
    useUpdateService();

  const deleteMutation =
    useDeleteService();

  /*
  |--------------------------------------------------------------------------
  | RESET FORM
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {

    setFormData({
      name: "",
      description: "",
      has_back_officer: false,
      service_fee: 0,
      availability: [],
      status: "active",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  const handleCreate =
    async () => {

      try {

        await createMutation.mutateAsync(
          formData
        );

        setCreateOpen(false);

        resetForm();

      } catch (error) {

        console.error(error);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  const handleEdit = (
    service: Service
  ) => {

    setSelectedService(
      service
    );

    setFormData({
      name: service.name,
      description:
        service.description ||
        "",
      has_back_officer:
        service.has_back_officer,
      service_fee:
        service.service_fee,
      availability:
        service.availability,
      status:
        service.status,
    });

    setEditOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  const handleUpdate =
    async () => {

      if (!selectedService)
        return;

      try {

        await updateMutation.mutateAsync({

          id:
            selectedService.id,

          payload: formData,
        });

        setEditOpen(false);

        setSelectedService(
          null
        );

        resetForm();

      } catch (error) {

        console.error(error);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async (
      id: number
    ) => {

      const confirmed =
        confirm(
          "Delete this service?"
        );

      if (!confirmed)
        return;

      try {

        await deleteMutation.mutateAsync(
          id
        );

      } catch (error) {

        console.error(error);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE STATUS
  |--------------------------------------------------------------------------
  */

  const handleToggleStatus =
    async (
      service: Service
    ) => {

      try {

        await updateMutation.mutateAsync({

          id: service.id,

          payload: {

            ...service,

            status:
              service.status ===
              "active"
                ? "inactive"
                : "active",
          },
        });

      } catch (error) {

        console.error(error);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | REUSABLE FORM
  |--------------------------------------------------------------------------
  */

  const ServiceForm = ({
    isEdit = false,
  }: {
    isEdit?: boolean;
  }) => (

    <div className="space-y-4">

      {/* NAME */}

      <div className="space-y-2">

        <Label>
          Name
        </Label>

        <Input
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name:
                e.target.value,
            })
          }
        />

      </div>

      {/* DESCRIPTION */}

      <div className="space-y-2">

        <Label>
          Description
        </Label>

        <Textarea
          value={
            formData.description
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              description:
                e.target.value,
            })
          }
        />

      </div>

      {/* FEE */}

      <div className="space-y-2">

        <Label>
          Service Fee
        </Label>

        <Input
          type="number"
          value={
            formData.service_fee
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              service_fee:
                Number(
                  e.target.value
                ),
            })
          }
        />

      </div>

      {/* BACK OFFICER */}

      <div className="flex items-center gap-3">

        <Checkbox
          checked={
            formData.has_back_officer
          }
          onCheckedChange={(
            checked
          ) =>
            setFormData({
              ...formData,
              has_back_officer:
                !!checked,
            })
          }
        />

        <Label>
          Has Back Officer
        </Label>

      </div>

      {/* AVAILABILITY */}

      <div className="space-y-3">

        <Label>
          Level
        </Label>

        <div className="grid grid-cols-2 gap-3">

          {(
            [
              "city",
              "subcity",
              "woreda",
            ] as ServiceAvailability[]
          ).map(
            (item) => (

              <div
                key={item}
                className="flex items-center gap-2"
              >

                <Checkbox
                  checked={formData.availability.includes(
                    item
                  )}
                  onCheckedChange={(
                    checked
                  ) => {

                    if (
                      checked
                    ) {

                      setFormData({
                        ...formData,

                        availability:
                          [
                            ...formData.availability,
                            item,
                          ],
                      });

                    } else {

                      setFormData({
                        ...formData,

                        availability:
                          formData.availability.filter(
                            (
                              i
                            ) =>
                              i !==
                              item
                          ),
                      });
                    }
                  }}
                />

                <Label className="capitalize">
                  {item}
                </Label>

              </div>
            )
          )}

        </div>

      </div>

      {/* STATUS */}

      <div className="space-y-2">

        <Label>
          Status
        </Label>

        <Select
          value={
            formData.status
          }
          onValueChange={(
            value
          ) =>
            setFormData({
              ...formData,
              status:
                value as
                  | "active"
                  | "inactive",
            })
          }
        >

          <SelectTrigger>

            <SelectValue />

          </SelectTrigger>

          <SelectContent>

            <SelectItem value="active">
              Active
            </SelectItem>

            <SelectItem value="inactive">
              Inactive
            </SelectItem>

          </SelectContent>

        </Select>

      </div>

      {/* ACTIONS */}

      <div className="flex justify-end gap-3 pt-4">

        <Button
          variant="outline"
          onClick={() => {

            if (isEdit) {

              setEditOpen(false);

            } else {

              setCreateOpen(false);
            }
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={
            isEdit
              ? handleUpdate
              : handleCreate
          }
        >

          {isEdit
            ? "Update"
            : "Create"}

        </Button>

      </div>

    </div>
  );

  return (

    <div className="space-y-6 p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            {/* // total services count */}
            Services Configured With windows ({
              filteredServices.length
            })

          </h1>

          <p className="text-sm text-muted-foreground">
            Manage system services
          </p>

        </div>

        <Dialog
          open={createOpen}
          onOpenChange={(open) => {

            setCreateOpen(open);

            if (!open) {
              resetForm();
            }
          }}
        >

          <DialogTrigger asChild>

            <Button>
              Create Service
            </Button>

          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">

            <DialogHeader>

              <DialogTitle>
                Create Service
              </DialogTitle>

            </DialogHeader>

            <ServiceForm />

          </DialogContent>

        </Dialog>

      </div>

      {/* FILTERS */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex flex-1 flex-col gap-4 md:flex-row">

          {/* SEARCH */}

          <div className="relative w-full md:max-w-sm">

            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search service..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="pl-10"
            />

          </div>

          {/* STATUS FILTER */}

          <div className="w-full md:w-52">

            <Select
              value={
                statusFilter
              }
              onValueChange={
                setStatusFilter
              }
            >

              <SelectTrigger>

                <SelectValue placeholder="Status" />

              </SelectTrigger>

              <SelectContent>

                <SelectItem value="all">
                  All Status
                </SelectItem>

                <SelectItem value="active">
                  Active
                </SelectItem>

                <SelectItem value="inactive">
                  Inactive
                </SelectItem>

              </SelectContent>

            </Select>

          </div>

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border bg-background">

        <table className="w-full">

          <thead className="bg-muted/50">

            <tr>

              <th className="p-4 w-10">
                #
              </th>

              <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Fee
              </th>

              <th className="p-4 text-left">
                Level
              </th>

              <th className="p-4 text-left">
                Back Officer
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-right">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {isLoading ? (

              <tr>

                <td
                  colSpan={7}
                  className="p-6 text-center"
                >
                  Loading...
                </td>

              </tr>

            ) : filteredServices.length ===
              0 ? (

              <tr>

                <td
                  colSpan={7}
                  className="p-6 text-center text-muted-foreground"
                >
                  No services found
                </td>

              </tr>

            ) : (

              filteredServices.map(
                (
                  service: Service
                ) => (

                  <tr
                    key={
                      service.id
                    }
                    className="border-t"
                  >

                    <td className="p-4">
                      {service.id}
                    </td>

                    <td className="p-4">
                      {service.name}
                    </td>

                    <td className="p-4">
                      {
                        service.service_fee
                      }
                    </td>

                    <td className="p-4 capitalize">

                      {service.availability.join(
                        ", "
                      )}

                    </td>

                    <td className="p-4">

                      {service.has_back_officer
                        ? "Yes"
                        : "No"}

                    </td>

                    <td className="p-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          service.status ===
                          "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >

                        {
                          service.status
                        }

                      </span>

                    </td>

                    <td className="p-4">

                      <div className="flex justify-end">

                        <DropdownMenu>

                          <DropdownMenuTrigger
                            asChild
                          >

                            <Button
                              variant="ghost"
                              size="sm"
                            >

                              <MoreVertical className="h-4 w-4" />

                            </Button>

                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">

                            <DropdownMenuItem
                              onClick={() =>
                                handleEdit(
                                  service
                                )
                              }
                            >
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(
                                  service
                                )
                              }
                            >

                              {service.status ===
                              "active"
                                ? "Disable"
                                : "Enable"}

                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleDelete(
                                  service.id
                                )
                              }
                            >
                              Delete
                            </DropdownMenuItem>

                          </DropdownMenuContent>

                        </DropdownMenu>

                      </div>

                    </td>

                  </tr>
                )
              )

            )}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      <div className="flex items-center justify-between">

        <div className="text-sm text-muted-foreground">

          Page {data?.data?.current_page || 1} of{" "}
          {data?.data?.last_page || 1}

        </div>

        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            size="sm"
            disabled={
              !data?.data?.prev_page_url
            }
            onClick={() =>
              setPage((prev) =>
                Math.max(
                  prev - 1,
                  1
                )
              )
            }
          >
            Previous
          </Button>

          {Array.from(
            {
              length:
                data?.data?.last_page ||
                1,
            },
            (_, i) => i + 1
          ).map((pageNumber) => (

            <Button
              key={pageNumber}
              variant={
                page ===
                pageNumber
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                setPage(
                  pageNumber
                )
              }
            >
              {pageNumber}
            </Button>

          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={
              !data?.data?.next_page_url
            }
            onClick={() =>
              setPage((prev) =>
                prev + 1
              )
            }
          >
            Next
          </Button>

        </div>

      </div>

      {/* UPDATE MODAL */}

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {

          setEditOpen(open);

          if (!open) {

            setSelectedService(
              null
            );

            resetForm();
          }
        }}
      >

        <DialogContent className="sm:max-w-lg">

          <DialogHeader>

            <DialogTitle>
              Update Service
            </DialogTitle>

          </DialogHeader>

          <ServiceForm isEdit />

        </DialogContent>

      </Dialog>

    </div>
  );
}