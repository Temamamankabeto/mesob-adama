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

type ServiceItem = {
  id: number;
  name: string;
  description?: string | null;
  service_fee?: number;
  status?: string;
};

type WindowItem = {
  id: number;
  name: string;
  services?: ServiceItem[];
};

function DraggableService({ service, assigned = false, onRemove }: { service: ServiceItem; assigned?: boolean; onRemove?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `service:${service.id}`,
    data: { service },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-2xl border bg-background p-4 shadow-sm transition",
        isDragging && "opacity-60 ring-2 ring-primary",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <button type="button" {...listeners} {...attributes} className="mt-1 cursor-grab text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <p className="truncate font-semibold">{service.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {service.description || "Drag this service into a window."}
            </p>
          </div>
        </div>

        {assigned && onRemove && (
          <Button type="button" size="icon" variant="ghost" onClick={onRemove}>
            <X className="h-4 w-4 text-red-600" />
          </Button>
        )}
      </div>
    </div>
  );
}

function WindowDropZone({ window, onRemove }: { window: WindowItem; onRemove: (serviceId: number) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `window:${window.id}`,
    data: { window },
  });

  const services = window.services || [];

  return (
    <Card ref={setNodeRef} className={cn("rounded-3xl transition", isOver && "border-primary bg-primary/5 ring-2 ring-primary/20")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">{window.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{services.length} assigned service(s)</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {services.length ? (
          services.map((service) => (
            <DraggableService key={service.id} service={service} assigned onRemove={() => onRemove(service.id)} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Drop service here
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ServiceWindowPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useServiceWindowBoard();
  const moveMutation = useMoveServiceToWindow();
  const unassignMutation = useUnassignServiceWindow();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const unassigned = useMemo(() => {
    const services = data?.unassigned_services || [];
    const key = search.toLowerCase();

    if (!key) return services;

    return services.filter((service: ServiceItem) => service.name?.toLowerCase().includes(key));
  }, [data?.unassigned_services, search]);

  const windows = data?.windows || [];

  async function onDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";

    if (!activeId.startsWith("service:") || !overId.startsWith("window:")) return;

    const serviceId = Number(activeId.replace("service:", ""));
    const windowId = Number(overId.replace("window:", ""));

    await moveMutation.mutateAsync({ service_id: serviceId, window_id: windowId });
    toast.success("Service assigned to window");
  }

  async function removeFromWindow(serviceId: number) {
    await unassignMutation.mutateAsync(serviceId);
    toast.success("Service removed from window");
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="space-y-6 p-6">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Service Window Assignment</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag a service into a window. Once assigned, the service is removed from the available service list.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="h-fit rounded-3xl lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
              <p className="text-sm text-muted-foreground">{unassigned.length} unassigned service(s)</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services..." className="pl-10" />
              </div>

              <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="py-10 text-center text-muted-foreground">Loading...</div>
                ) : unassigned.length ? (
                  unassigned.map((service: ServiceItem) => <DraggableService key={service.id} service={service} />)
                ) : (
                  <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No unassigned services
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            {windows.map((window: WindowItem) => (
              <WindowDropZone key={window.id} window={window} onRemove={removeFromWindow} />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
