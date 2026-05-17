"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useMoveServiceToWindow,
  useServiceWindowBoard,
  useUnassignServiceWindow,
} from "@/hooks/service-window/use-service-window";
import { cn } from "@/lib/utils";

type ServiceItem = { id: number; name: string; description?: string | null };
type WindowItem = { id: number; name: string; services?: ServiceItem[] };

function DraggableService({ service, onRemove }: { service: ServiceItem; onRemove?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `service:${service.id}`,
    data: { service },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn("rounded-2xl border bg-background p-4 shadow-sm", isDragging && "opacity-60 ring-2 ring-primary")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <button type="button" {...listeners} {...attributes} className="mt-1 cursor-grab text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </button>
          <div>
            <p className="font-semibold">{service.name}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{service.description || "Drag to another window"}</p>
          </div>
        </div>
        {onRemove && (
          <Button type="button" size="icon" variant="ghost" onClick={onRemove}>
            <X className="h-4 w-4 text-red-600" />
          </Button>
        )}
      </div>
    </div>
  );
}

function WindowDropZone({ window, onRemove }: { window: WindowItem; onRemove: (serviceId: number) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `window:${window.id}`, data: { window } });
  const services = window.services || [];

  return (
    <Card ref={setNodeRef} className={cn("rounded-3xl transition", isOver && "border-primary bg-primary/5 ring-2 ring-primary/20")}>
      <CardHeader>
        <CardTitle className="text-base">{window.name}</CardTitle>
        <p className="text-xs text-muted-foreground">{services.length} service(s)</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.length ? (
          services.map((service) => <DraggableService key={service.id} service={service} onRemove={() => onRemove(service.id)} />)
        ) : (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Drop service here</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ServiceWindowListPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useServiceWindowBoard();
  const moveMutation = useMoveServiceToWindow();
  const unassignMutation = useUnassignServiceWindow();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const windows = useMemo(() => {
    const all = data?.windows || [];
    const key = search.toLowerCase();

    return all
      .map((window: WindowItem) => ({
        ...window,
        services: (window.services || []).filter((service) => !key || service.name?.toLowerCase().includes(key)),
      }))
      .filter((window: WindowItem) => (window.services || []).length > 0 || !key);
  }, [data?.windows, search]);

  async function onDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";
    if (!activeId.startsWith("service:") || !overId.startsWith("window:")) return;

    const serviceId = Number(activeId.replace("service:", ""));
    const windowId = Number(overId.replace("window:", ""));

    await moveMutation.mutateAsync({ service_id: serviceId, window_id: windowId });
    toast.success("Service moved to selected window");
  }

  async function removeFromWindow(serviceId: number) {
    await unassignMutation.mutateAsync(serviceId);
    toast.success("Service removed from window");
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="space-y-6 p-6">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Assigned Service Windows</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag services from one window to another to update assignment. Only your administrative scope is shown.
          </p>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assigned services..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="rounded-3xl border p-10 text-center text-muted-foreground">Loading...</div>
        ) : windows.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {windows.map((window: WindowItem) => <WindowDropZone key={window.id} window={window} onRemove={removeFromWindow} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
            No assigned services found.
          </div>
        )}
      </div>
    </DndContext>
  );
}
