"use client";

import { useState } from "react";

import {
  useCreateWindow,
  useDeleteWindow,
  useUpdateWindow,
  useWindows,
} from "@/hooks/windows/use-window";

import { Window } from "@/types/windows/window";

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

import { Checkbox } from "@/components/ui/checkbox";

export default function WindowPage() {
  const [page] = useState(1);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [selectedWindow, setSelectedWindow] =
    useState<Window | null>(null);

  const [formData, setFormData] =
    useState({
      name: "",

      availability: [] as string[],
    });

  const { data, isLoading } =
    useWindows(page);

  const createMutation =
    useCreateWindow();

  const updateMutation =
    useUpdateWindow();

  const deleteMutation =
    useDeleteWindow();

  const resetForm = () => {
    setFormData({
      name: "",

      availability: [],
    });
  };

  const handleCreate = async () => {
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

  const handleEdit = (
    window: Window
  ) => {
    setSelectedWindow(window);

    setFormData({
      name: window.name,

      availability:
        window.availability,
    });

    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedWindow) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedWindow.id,

        payload: formData,
      });

      setEditOpen(false);

      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    const confirmed = confirm(
      "Delete this window?"
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Windows
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage service windows
          </p>
        </div>

        {/* CREATE */}
        <Dialog
          open={createOpen}
          onOpenChange={setCreateOpen}
        >
          <DialogTrigger asChild>
            <Button>
              Create Window
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Create Window
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* NAME */}
              <div className="space-y-2">
                <Label>Name</Label>

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

              {/* AVAILABILITY */}
              <div className="space-y-3">
                <Label>
                  Availability
                </Label>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    "city",
                    "subcity",
                    "woreda",
                  ].map((item) => (
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
                          if (checked) {
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
                  ))}
                </div>
              </div>

              {/* ACTION */}
              <div className="flex justify-end">
                <Button
                  onClick={
                    handleCreate
                  }
                  disabled={
                    createMutation.isPending
                  }
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-background">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Availability
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
                  colSpan={3}
                  className="p-6 text-center"
                >
                  Loading...
                </td>
              </tr>
            ) : (
              data?.data?.data?.map(
                (window) => (
                  <tr
                    key={window.id}
                    className="border-t"
                  >
                    <td className="p-4">
                      {window.name}
                    </td>

                    <td className="p-4 capitalize">
                      {window.availability.join(
                        ", "
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEdit(
                              window
                            )
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDelete(
                              window.id
                            )
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* UPDATE */}
      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Update Window
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* NAME */}
            <div className="space-y-2">
              <Label>Name</Label>

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

            {/* AVAILABILITY */}
            <div className="space-y-3">
              <Label>
                Availability
              </Label>

              <div className="grid grid-cols-2 gap-3">
                {[
                  "city",
                  "subcity",
                  "woreda",
                ].map((item) => (
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
                        if (checked) {
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
                ))}
              </div>
            </div>

            {/* ACTION */}
            <div className="flex justify-end">
              <Button
                onClick={handleUpdate}
                disabled={
                  updateMutation.isPending
                }
              >
                {updateMutation.isPending
                  ? "Updating..."
                  : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}