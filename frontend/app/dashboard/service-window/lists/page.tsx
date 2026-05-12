"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { Plus, Trash2, GripVertical } from "lucide-react";

import { useServices } from "@/hooks/services/use-service";
import { useWindows } from "@/hooks/windows/use-window";

import {
  useServiceWindows,
  useAssignServiceWindows,
} from "@/hooks/service-window/use-service-window";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ServiceWindowPage() {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: servicesData } = useServices();
  const { data: windowsData } = useWindows();

  const { data: assignedData } = useServiceWindows(
    selectedService || undefined
  );

  const assignMutation = useAssignServiceWindows();

  /* ================= SAFE DATA ================= */

  const services = useMemo(() => {
    const d = servicesData;
    return d?.data?.data || d?.data || [];
  }, [servicesData]);

  const windows = useMemo(() => {
    const d = windowsData;
    return d?.data?.data || d?.data || [];
  }, [windowsData]);

  /* ================= ASSIGNED STATE ================= */

  const [assignedWindows, setAssignedWindows] = useState<any[]>([]);

  useEffect(() => {
    if (assignedData?.data?.windows) {
      setAssignedWindows(
        assignedData.data.windows.map((w: any) => ({
          window_id: w.id,
          name: w.name,
          step_order: w.pivot?.step_order || 1,
          is_required: w.pivot?.is_required ?? true,
        }))
      );
    } else {
      setAssignedWindows([]);
    }
  }, [assignedData]);

  /* ================= FILTER ================= */

  const filteredServices = useMemo(() => {
    return services.filter((s: any) =>
      s?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [services, search]);

  const availableWindows = useMemo(() => {
    return windows.filter(
      (w: any) =>
        !assignedWindows.some((a) => a.window_id === w.id)
    );
  }, [windows, assignedWindows]);

  /* ================= ADD ================= */

  const addWindow = (w: any) => {
    setAssignedWindows((prev) => [
      ...prev,
      {
        window_id: w.id,
        name: w.name,
        step_order: prev.length + 1,
        is_required: true,
      },
    ]);
  };

  /* ================= REMOVE ================= */

  const removeWindow = (id: number) => {
    const filtered = assignedWindows.filter((w) => w.window_id !== id);

    setAssignedWindows(
      filtered.map((w, i) => ({
        ...w,
        step_order: i + 1,
      }))
    );
  };

  /* ================= TOGGLE ================= */

  const toggleRequired = (id: number) => {
    setAssignedWindows((prev) =>
      prev.map((w) =>
        w.window_id === id
          ? { ...w, is_required: !w.is_required }
          : w
      )
    );
  };

  /* ================= DRAG ================= */

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setAssignedWindows((items) => {
      const oldIndex = items.findIndex(
        (i) => i.window_id === active.id
      );

      const newIndex = items.findIndex(
        (i) => i.window_id === over.id
      );

      return arrayMove(items, oldIndex, newIndex).map((item, i) => ({
        ...item,
        step_order: i + 1,
      }));
    });
  };

  /* ================= SAVE ================= */

  const save = async () => {
    if (!selectedService) return;

    await assignMutation.mutateAsync({
      serviceId: selectedService,
      payload: {
        windows: assignedWindows.map((w, i) => ({
          window_id: w.window_id,
          step_order: i + 1,
          is_required: w.is_required,
        })),
      },
    });
  };

  /* ================= UI ================= */

  return (
    <div className="grid grid-cols-12 gap-6 p-6">

      {/* SERVICES */}
      <Card className="col-span-3 h-[85vh] flex flex-col">
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 overflow-y-auto">
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filteredServices.map((s: any) => (
            <Button
              key={s.id}
              variant={selectedService === s.id ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setSelectedService(s.id)}
            >
              {s.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* ASSIGNED (CENTER) */}
      <Card className="col-span-5 h-[85vh] flex flex-col">
        <CardHeader>
          <CardTitle>Assigned Windows</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={assignedWindows.map((w) => w.window_id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">

                {assignedWindows.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">
                    No windows assigned
                  </div>
                )}

                {assignedWindows.map((w) => (
                  <SortableItem
                    key={w.window_id}
                    w={w}
                    onRemove={removeWindow}
                    onToggle={toggleRequired}
                  />
                ))}

              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-4 flex justify-end">
            <Button onClick={save}>Save Changes</Button>
          </div>

        </CardContent>
      </Card>

      {/* AVAILABLE */}
      <Card className="col-span-4 h-[85vh] flex flex-col">
        <CardHeader>
          <CardTitle>Available Windows</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 overflow-y-auto">

          {availableWindows.map((w: any) => (
            <div
              key={w.id}
              className="border p-3 rounded flex justify-between"
            >
              <span>{w.name}</span>

              <Button size="icon" onClick={() => addWindow(w)}>
                <Plus className="w-4 h-4" />
              </Button>

            </div>
          ))}

        </CardContent>
      </Card>

    </div>
  );
}

/* ================= SORTABLE ITEM ================= */

function SortableItem({
  w,
  onRemove,
  onToggle,
}: any) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({ id: w.window_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border p-3 rounded flex justify-between items-center bg-white"
    >
      <div className="flex items-center gap-2">

        <div {...attributes} {...listeners}>
          <GripVertical className="w-4 h-4 cursor-grab" />
        </div>

        <div>
          <p className="font-medium">
            Step {w.step_order} - {w.name}
          </p>

          <label className="text-sm flex gap-2 items-center">
            <input
              type="checkbox"
              checked={w.is_required}
              onChange={() => onToggle(w.window_id)}
            />
            Required
          </label>
        </div>

      </div>

      <Button
        size="icon"
        variant="destructive"
        onClick={() => onRemove(w.window_id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}