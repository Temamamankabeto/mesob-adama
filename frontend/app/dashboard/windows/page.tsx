"use client";

import { useMemo, useState } from "react";
import { MoreVertical, Search } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateWindow,
  useDeleteWindow,
  useUpdateWindow,
  useWindows,
} from "@/hooks/windows/use-window";
import { authService } from "@/services/auth/auth.service";

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
  city_title: string;
  subcity_title: string;
  woreda_title: string;
};

const LEVELS: WindowAvailability[] = ["city", "subcity", "woreda"];

const emptyForm: FormState = {
  name: "",
  availability: [],
  city_title: "",
  subcity_title: "",
  woreda_title: "",
};

function levelLabel(level?: string | null) {
  if (!level) return "-";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function actorLevel(user: any): WindowAvailability | "" {
  if (user?.woreda_id) return "woreda";
  if (user?.subcity_id) return "subcity";
  if (user?.city_id) return "city";
  return user?.location_level || "";
}

function normalizeLevels(value: any): WindowAvailability[] {
  if (Array.isArray(value)) return value as WindowAvailability[];
  if (Array.isArray(value?.levels)) return value.levels;
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
  allowedLevels,
}: {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
  allowedLevels: WindowAvailability[];
}) {
  function toggleLevel(level: WindowAvailability, checked: boolean) {
    setFormData((current) => {
      const levels = checked
        ? Array.from(new Set([...current.availability, level]))
        : current.availability.filter((item) => item !== level);

      return {
        ...current,
        availability: levels,
        city_title: levels.includes("city") ? current.city_title : "",
        subcity_title: levels.includes("subcity") ? current.subcity_title : "",
        woreda_title: levels.includes("woreda") ? current.woreda_title : "",
      };
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="window-name">Window Name</Label>
        <Input
          id="window-name"
          value={formData.name}
          autoComplete="off"
          placeholder="Example: Window 1"
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
        />
      </div>

      <div className="space-y-3">
        <Label>Administrative Level</Label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {allowedLevels.map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition hover:bg-muted"
            >
              <Checkbox
                checked={formData.availability.includes(level)}
                onCheckedChange={(checked) => toggleLevel(level, Boolean(checked))}
              />
              <span className="text-sm font-medium">
                {levelLabel(level)} Level
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {formData.availability.includes("city") && (
          <div className="space-y-2">
            <Label>City Window Title</Label>
            <Input
              value={formData.city_title}
              placeholder="Example: Land Services"
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  city_title: event.target.value,
                }))
              }
            />
          </div>
        )}

        {formData.availability.includes("subcity") && (
          <div className="space-y-2">
            <Label>Subcity Window Title</Label>
            <Input
              value={formData.subcity_title}
              placeholder="Example: Business Registration Services"
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  subcity_title: event.target.value,
                }))
              }
            />
          </div>
        )}

        {formData.availability.includes("woreda") && (
          <div className="space-y-2">
            <Label>Woreda Window Title</Label>
            <Input
              value={formData.woreda_title}
              placeholder="Example: Resident Identification Services"
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  woreda_title: event.target.value,
                }))
              }
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground">
        Window Name is shared. Titles are dynamic per selected level:
        City Window Title, Subcity Window Title, and Woreda Window Title.
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={
            loading ||
            !formData.name.trim() ||
            formData.availability.length === 0 ||
            (formData.availability.includes("city") && !formData.city_title.trim()) ||
            (formData.availability.includes("subcity") && !formData.subcity_title.trim()) ||
            (formData.availability.includes("woreda") && !formData.woreda_title.trim())
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
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<WindowAvailability | "">("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<AppWindow | null>(null);
  const [detailWindow, setDetailWindow] = useState<AppWindow | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);

  const authUser = authService.getStoredUser() as any;
  const currentLevel = actorLevel(authUser);

  const allowedLevels: WindowAvailability[] =
    currentLevel === "subcity"
      ? ["subcity"]
      : currentLevel === "woreda"
        ? ["woreda"]
        : LEVELS;

  const { data, isLoading } = useWindows(page, {
    search,
    level: levelFilter,
  });

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

  function openDetailDialog(item: AppWindow) {
    setDetailWindow(item);
    setDetailOpen(true);
  }

  function closeDetailDialog() {
    setDetailOpen(false);
    setDetailWindow(null);
  }

  function titleDisplay(item: AppWindow, level: WindowAvailability) {
    const value =
      level === "city"
        ? item.city_title
        : level === "subcity"
          ? item.subcity_title
          : item.woreda_title;

    return value ? `${item.name} - ${value}` : "-";
  }

  async function handleCreate() {
    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        availability: formData.availability,
        city_title: formData.city_title.trim() || null,
        subcity_title: formData.subcity_title.trim() || null,
        woreda_title: formData.woreda_title.trim() || null,
      });

      toast.success("Window created successfully");
      closeCreateDialog();
    } catch (error: any) {
      const errors = error?.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)?.[0] as any;
        toast.error(Array.isArray(first) ? first[0] : "Validation failed");
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to create window");
    }
  }

  function openEditDialog(item: AppWindow) {
    setSelectedWindow(item);

    setFormData({
      name: item.name || "",
      availability: normalizeLevels(item.availability),
      city_title: item.city_title || "",
      subcity_title: item.subcity_title || "",
      woreda_title: item.woreda_title || "",
    });

    setEditOpen(true);
  }

  async function handleUpdate() {
    if (!selectedWindow) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedWindow.id,
        payload: {
          name: formData.name.trim(),
          availability: formData.availability,
          city_title: formData.city_title.trim() || null,
          subcity_title: formData.subcity_title.trim() || null,
          woreda_title: formData.woreda_title.trim() || null,
        },
      });

      toast.success("Window updated successfully");
      closeEditDialog();
    } catch (error: any) {
      const errors = error?.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)?.[0] as any;
        toast.error(Array.isArray(first) ? first[0] : "Validation failed");
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to update window");
    }
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
            Manage shared window names and dynamic titles per administrative level.
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
            className="z-[80] max-h-[90vh] overflow-y-auto sm:max-w-2xl"
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
              allowedLevels={allowedLevels}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-3xl border bg-card p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search window name or title..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>

          <select
            className="rounded-md border bg-background p-2"
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value as any)}
          >
            <option value="">All Levels</option>
            {allowedLevels.map((level) => (
              <option key={level} value={level}>
                {levelLabel(level)} Level
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-20 p-4 text-left">#</th>
                <th className="p-4 text-left">Window Name</th>
                <th className="p-4 text-left">Administrative Level</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Loading windows...
                  </td>
                </tr>
              ) : windows.length > 0 ? (
                windows.map((item: AppWindow, index: number) => {
                  const levels = normalizeLevels(item.availability);

                  return (
                    <tr key={item.id} className="border-t">
                      <td className="p-4">{index + 1}</td>
                      <td className="p-4 font-medium">{item.name}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {levels.map((level) => (
                            <span
                              key={level}
                              className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                            >
                              {levelLabel(level)}
                            </span>
                          ))}
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

                            <DropdownMenuContent align="end" className="z-[70]">
                              <DropdownMenuItem
                                onClick={() => {
                                  document.body.click();
                                  globalThis.setTimeout(() => openDetailDialog(item), 80);
                                }}
                              >
                                Details
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  document.body.click();
                                  globalThis.setTimeout(() => openEditDialog(item), 80);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  document.body.click();
                                  globalThis.setTimeout(() => handleDelete(item.id), 80);
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
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No windows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) closeDetailDialog();
        }}
      >
        <DialogContent
          className="z-[80] max-h-[90vh] overflow-y-auto sm:max-w-2xl"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Window Details</DialogTitle>
          </DialogHeader>

          {detailWindow && (
            <div className="space-y-5">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Window Name</p>
                <p className="mt-1 text-lg font-semibold">{detailWindow.name}</p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-sm font-medium">Administrative Levels</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {normalizeLevels(detailWindow.availability).map((level) => (
                    <span
                      key={level}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                    >
                      {levelLabel(level)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">City Window Title</p>
                  <p className="mt-2 font-medium">
                    {titleDisplay(detailWindow, "city")}
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Subcity Window Title</p>
                  <p className="mt-2 font-medium">
                    {titleDisplay(detailWindow, "subcity")}
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Woreda Window Title</p>
                  <p className="mt-2 font-medium">
                    {titleDisplay(detailWindow, "woreda")}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                The same Window Name can be reused across levels. Each level has its own title used in service assignment,
                officer assignment, application sharing, and workflow routing.
              </div>

              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={closeDetailDialog}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent
          className="z-[80] max-h-[90vh] overflow-y-auto sm:max-w-2xl"
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
            allowedLevels={allowedLevels}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
