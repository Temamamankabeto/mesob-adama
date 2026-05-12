"use client";

import { useState, useMemo } from "react";

import {
  useServiceForms,
  useCreateServiceForm,
  useUpdateServiceForm,
  useDeleteServiceForm,
} from "@/hooks/services/useServiceForms";

import { useServices } from "@/hooks/services/use-service";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function ServiceFormsPage() {

  const { data, isLoading } =
    useServiceForms();

  const { data: servicesData } =
    useServices();

  const create =
    useCreateServiceForm();

  const update =
    useUpdateServiceForm();

  const remove =
    useDeleteServiceForm();

  /*
  |--------------------------------------------------------------------------
  | SAFE DATA
  |--------------------------------------------------------------------------
  */

  const services =
    Array.isArray(servicesData)
      ? servicesData
      : servicesData?.data?.data ||
        servicesData?.data ||
        [];

  const forms =
    Array.isArray(data)
      ? data
      : data?.data || [];

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] =
    useState("");

  const filteredForms =
    useMemo(() => {
      return forms.filter((f: any) => {

        const serviceName =
          services.find(
            (s: any) =>
              s.id == f.service_id
          )?.name || "";

        const keyword =
          search.toLowerCase();

        return (
          f.title
            ?.toLowerCase()
            .includes(keyword) ||

          f.description
            ?.toLowerCase()
            .includes(keyword) ||

          serviceName
            ?.toLowerCase()
            .includes(keyword)
        );
      });
    }, [forms, search, services]);

  /*
  |--------------------------------------------------------------------------
  | MODAL STATE
  |--------------------------------------------------------------------------
  */

  const [open, setOpen] =
    useState(false);

  const [form, setForm] = useState({
    id: null as number | null,
    service_id: "",
    title: "",
    description: "",
  });

  const reset = () => {
    setForm({
      id: null,
      service_id: "",
      title: "",
      description: "",
    });
  };

  const handleOpenCreate = () => {
    reset();
    setOpen(true);
  };

  const handleEdit = (item: any) => {
    setForm({
      id: item.id,
      service_id: String(item.service_id),
      title: item.title,
      description: item.description || "",
    });

    setOpen(true);
  };

  const handleSubmit = async () => {

    const payload = {
      service_id: Number(form.service_id),
      title: form.title,
      description: form.description,
    };

    if (form.id) {
      await update.mutateAsync({
        id: form.id,
        payload,
      });
    } else {
      await create.mutateAsync(payload);
    }

    setOpen(false);
    reset();
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">

      {/* HEADER CARD */}
      <Card>

        <CardHeader className="flex flex-row items-center justify-between">

          <CardTitle className="text-xl">
            Service Forms
          </CardTitle>

          <Button onClick={handleOpenCreate}>
            + Create Form
          </Button>

        </CardHeader>

        <CardContent>

          {/* SEARCH */}
          <div className="mb-4">
            <Input
              placeholder="Search forms..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {/* TABLE */}
          <div className="border rounded-md">

            <Table>

              <TableHeader>
                <TableRow>

                  <TableHead>ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>

                {filteredForms.length > 0 ? (
                  filteredForms.map((f: any) => (
                    <TableRow key={f.id}>

                      <TableCell>
                        {f.id}
                      </TableCell>

                      <TableCell>
                        {services.find(
                          (s: any) =>
                            s.id ==
                            f.service_id
                        )?.name ||
                          f.service?.name ||
                          f.service_id}
                      </TableCell>

                      <TableCell className="font-medium">
                        {f.title}
                      </TableCell>

                      <TableCell>
                        {f.description}
                      </TableCell>

                      <TableCell className="text-right">

                        <DropdownMenu>

                          <DropdownMenuTrigger asChild>

                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              ⋮
                            </Button>

                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">

                            <DropdownMenuItem
                              onClick={() =>
                                handleEdit(f)
                              }
                            >
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                remove.mutate(f.id)
                              }
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>

                          </DropdownMenuContent>

                        </DropdownMenu>

                      </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-gray-500"
                    >
                      No results found
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>

            </Table>

          </div>

        </CardContent>

      </Card>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>

        <DialogContent>

          <DialogHeader>

            <DialogTitle>
              {form.id
                ? "Edit Service Form"
                : "Create Service Form"}
            </DialogTitle>

          </DialogHeader>

          <div className="space-y-3">

            {/* SHADCN SELECT */}
            <Select
              value={form.service_id}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  service_id: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>

              <SelectContent>

                {services.map((s: any) => (
                  <SelectItem
                    key={s.id}
                    value={String(s.id)}
                  >
                    {s.name}
                  </SelectItem>
                ))}

              </SelectContent>

            </Select>

            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
            />

            <Input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-2">

              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleSubmit}>
                {form.id
                  ? "Update"
                  : "Create"}
              </Button>

            </div>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  );
}
