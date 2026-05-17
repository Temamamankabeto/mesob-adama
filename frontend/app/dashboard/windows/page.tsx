"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";

import {
  useCreateWindow,
  useDeleteWindow,
  useUpdateWindow,
  useWindows,
} from "@/hooks/windows/use-window";

import {
  Window,
  WindowAvailability,
} from "@/types/windows/window";

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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FormState = {
  name: string;
  availability: WindowAvailability[];
};

const WINDOW_AVAILABILITY: WindowAvailability[] = [
  "city",
  "subcity",
  "woreda",
];

const emptyForm: FormState = {
  name: "",
  availability: [],
};

function WindowForm({
  formData,
  setFormData,
  loading,
  submitLabel,
  loadingLabel,
  onSubmit,
}: {
  formData: FormState;
  setFormData: (value: FormState) => void;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  onSubmit: () => void;
}) {
  function toggleAvailability(
    item: WindowAvailability,
    checked: boolean
  ) {
    if (checked) {
      setFormData({
        ...formData,
        availability: Array.from(
          new Set([
            ...formData.availability,
            item,
          ])
        ),
      });

      return;
    }

    setFormData({
      ...formData,
      availability:
        formData.availability.filter(
          (level) => level !== item
        ),
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Name</Label>

        <Input
          value={formData.name}
          placeholder="Enter window name"
          onChange={(event) =>
            setFormData({
              ...formData,
              name: event.target.value,
            })
          }
        />
      </div>

      <div className="space-y-3">
        <Label>Availability</Label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {WINDOW_AVAILABILITY.map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition hover:bg-muted"
            >
              <Checkbox
                checked={formData.availability.includes(
                  item
                )}
                onCheckedChange={(checked) =>
                  toggleAvailability(
                    item,
                    Boolean(checked)
                  )
                }
              />

              <span className="text-sm font-medium capitalize">
                {item}
              </span>
            </label>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Select the administrative levels where this window is available.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          onClick={onSubmit}
          disabled={
            loading ||
            !formData.name.trim() ||
            formData.availability.length === 0
          }
        >
          {loading ? loadingLabel : submitLabel}
        </Button>
      </div>
    </div>
  );
}

export default function WindowPage() {
  const [page] = useState(1);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [selectedWindow, setSelectedWindow] =
    useState<Window | null>(null);

  const [formData, setFormData] =
    useState<FormState>(emptyForm);

  const { data, isLoading } =
    useWindows(page);

  const createMutation = useCreateWindow();
  const updateMutation = useUpdateWindow();
  const deleteMutation = useDeleteWindow();

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedWindow(null);
  };

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        availability: formData.availability,
      });

      setCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (window: Window) => {
    setSelectedWindow(window);

    setFormData({
      name: window.name || "",
      availability: Array.isArray(
        window.availability
      )
        ? window.availability
        : [],
    });

    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedWindow) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedWindow.id,
        payload: {
          name: formData.name.trim(),
          availability: formData.availability,
        },
      });

      setEditOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
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

  const windows = data?.data?.data || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Windows
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage service windows and administrative availability.
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
            <Button>Create Window</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Create Window
              </DialogTitle>
            </DialogHeader>

            <WindowForm
              formData={formData}
              setFormData={setFormData}
              loading={createMutation.isPending}
              submitLabel="Create"
              loadingLabel="Creating..."
              onSubmit={handleCreate}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl border bg-background">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left">
                #
              </th>

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
                  colSpan={4}
                  className="p-6 text-center"
                >
                  Loading...
                </td>
              </tr>
            ) : windows.length > 0 ? (
              windows.map((window: Window) => (
                <tr
                  key={window.id}
                  className="border-t"
                >
                  <td className="p-4">
                    Window {window.id}
                  </td>

                  <td className="p-4 font-medium">
                    {window.name}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {(window.availability || []).map(
                        (item) => (
                          <span
                            key={item}
                            className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize"
                          >
                            {item}
                          </span>
                        )
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
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
                              handleEdit(window)
                            }
                          >
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleDelete(
                                window.id
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
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-muted-foreground"
                >
                  No windows found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);

          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Update Window
            </DialogTitle>
          </DialogHeader>

          <WindowForm
            formData={formData}
            setFormData={setFormData}
            loading={updateMutation.isPending}
            submitLabel="Update"
            loadingLabel="Updating..."
            onSubmit={handleUpdate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
