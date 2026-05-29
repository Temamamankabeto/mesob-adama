"use client";

import { useMemo, useState } from "react";
import { MoreVertical } from "lucide-react";

import {
  useCreateWindow,
  useDeleteWindow,
  useUpdateWindow,
  useWindows,
} from "@/hooks/windows/use-window";

import {
  Window as AppWindow,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormState = {
  name: string;
  availability: WindowAvailability[];
};

const LEVELS: WindowAvailability[] = ["city", "subcity", "woreda"];

const emptyForm: FormState = {
  name: "",
  availability: [],
};

function normalizeAvailability(value: unknown): WindowAvailability[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).toLowerCase())
      .filter((item): item is WindowAvailability =>
        LEVELS.includes(item as WindowAvailability)
      );
  }

  if (typeof value === "string") {
    try {
      return normalizeAvailability(JSON.parse(value));
    } catch {
      return LEVELS.includes(value as WindowAvailability)
        ? [value as WindowAvailability]
        : [];
    }
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (Array.isArray(record.levels)) {
      return normalizeAvailability(record.levels);
    }

    if (Array.isArray(record.administrative_levels)) {
      return normalizeAvailability(record.administrative_levels);
    }

    return LEVELS.filter((level) => Boolean(record[level]));
  }

  return [];
}

function WindowForm({
  formData,
  setFormData,
  loading,
  submitLabel,
  loadingLabel,
  onSubmit,
  onCancel,
}: {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  function toggleLevel(level: WindowAvailability, checked: boolean) {
    setFormData((current) => ({
      ...current,
      availability: checked
        ? Array.from(new Set([...current.availability, level]))
        : current.availability.filter((item) => item !== level),
    }));
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="window-name">Name</Label>
        <Input
          id="window-name"
          autoComplete="off"
          placeholder="Enter window name"
          value={formData.name}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
        />
      </div>

      <div className="space-y-3">
        <Label>Availability</Label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LEVELS.map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition hover:bg-muted"
            >
              <Checkbox
                checked={formData.availability.includes(level)}
                onCheckedChange={(checked) =>
                  toggleLevel(level, Boolean(checked))
                }
              />
              <span className="text-sm font-medium capitalize">
                {level}
              </span>
            </label>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Select the administrative levels where this window is available.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          type="button"
          disabled={
            loading ||
            !formData.name.trim() ||
            formData.availability.length === 0
          }
          onClick={onSubmit}
        >
          {loading ? loadingLabel : submitLabel}
        </Button>
      </div>
    </div>
  );
}

export default function WindowPage() {
  const [page] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedWindow, setSelectedWindow] =
    useState<AppWindow | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);

  const { data, isLoading } = useWindows(page);
  const createMutation = useCreateWindow();
  const updateMutation = useUpdateWindow();
  const deleteMutation = useDeleteWindow();

  const windows = useMemo(() => {
    const rows = data?.data?.data || [];

    return [...rows].sort((a: AppWindow, b: AppWindow) => {
      return Number(a.id) - Number(b.id);
    });
  }, [data]);

  function resetForm() {
    setFormData(emptyForm);
    setSelectedWindow(null);
  }

  function closeCreateDialog() {
    setCreateOpen(false);
    resetForm();
  }

  function closeEditDialog() {
    setEditOpen(false);
    resetForm();
  }

  async function handleCreate() {
    await createMutation.mutateAsync({
      name: formData.name.trim(),
      availability: formData.availability,
    });

    closeCreateDialog();
  }

  function openEditDialog(item: AppWindow) {
    setSelectedWindow(item);

    setFormData({
      name: item.name || "",
      availability: normalizeAvailability(item.availability),
    });

    setEditOpen(true);
  }

  async function handleUpdate() {
    if (!selectedWindow) return;

    await updateMutation.mutateAsync({
      id: selectedWindow.id,
      payload: {
        name: formData.name.trim(),
        availability: formData.availability,
      },
    });

    closeEditDialog();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this window?")) return;
    await deleteMutation.mutateAsync(id);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-3 sm:p-6">
      <div className="flex flex-col gap-4 rounded-3xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Windows</h1>
          <p className="text-sm text-muted-foreground">
            Manage service windows and administrative availability.
          </p>
        </div>

        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>Create Window</Button>
          </DialogTrigger>

          <DialogContent
            className="z-[80] max-h-[90vh] overflow-y-auto sm:max-w-lg"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Create Window</DialogTitle>
            </DialogHeader>

            <WindowForm
              formData={formData}
              setFormData={setFormData}
              loading={createMutation.isPending}
              submitLabel="Create"
              loadingLabel="Creating..."
              onSubmit={handleCreate}
              onCancel={closeCreateDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-24 p-4 text-left">#</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Availability</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground"
                  >
                    Loading windows...
                  </td>
                </tr>
              ) : windows.length > 0 ? (
                windows.map((item: AppWindow) => {
                  const availability = normalizeAvailability(
                    item.availability
                  );

                  return (
                    <tr key={item.id} className="border-t">
                      <td className="p-4">Window {item.id}</td>
                      <td className="p-4 font-medium">{item.name}</td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {availability.length ? (
                            availability.map((level) => (
                              <span
                                key={level}
                                className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize"
                              >
                                {level}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              className="z-[70]"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  document.body.click();

                                  globalThis.setTimeout(() => {
                                    openEditDialog(item);
                                  }, 80);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  document.body.click();

                                  globalThis.setTimeout(() => {
                                    handleDelete(item.id);
                                  }, 80);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No windows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent
          className="z-[80] max-h-[90vh] overflow-y-auto sm:max-w-lg"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Update Window</DialogTitle>
          </DialogHeader>

          <WindowForm
            formData={formData}
            setFormData={setFormData}
            loading={updateMutation.isPending}
            submitLabel="Update"
            loadingLabel="Updating..."
            onSubmit={handleUpdate}
            onCancel={closeEditDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}