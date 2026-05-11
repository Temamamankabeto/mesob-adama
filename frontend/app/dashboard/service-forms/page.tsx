"use client";

import { useState } from "react";

import {
  useServiceForms,
  useCreateServiceForm,
  useUpdateServiceForm,
  useDeleteServiceForm,
} from "@/hooks/services/useServiceForms";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ServiceFormsPage() {
  const { data } = useServiceForms();

  const create = useCreateServiceForm();
  const update = useUpdateServiceForm();
  const remove = useDeleteServiceForm();

  const forms = data?.data || [];

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    id: null as any,
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
    setForm(item);
    setOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      service_id: form.service_id,
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

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Service Forms
        </h1>

        <Button onClick={handleOpenCreate}>
          + Create Form
        </Button>
      </div>

      {/* TABLE */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Service ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {forms.map((f: any) => (
              <TableRow key={f.id}>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.service_id}</TableCell>
                <TableCell className="font-medium">
                  {f.title}
                </TableCell>
                <TableCell className="text-gray-500">
                  {f.description}
                </TableCell>

                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(f)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() =>
                      remove.mutate(f.id)
                    }
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL (CREATE / EDIT) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Service Form" : "Create Service Form"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Service ID"
              value={form.service_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  service_id: e.target.value,
                })
              }
            />

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

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleSubmit}>
                {form.id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}