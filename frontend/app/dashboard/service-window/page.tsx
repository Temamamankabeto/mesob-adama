"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { useServices } from "@/hooks/services/use-service";

import { useWindows } from "@/hooks/windows/use-window";

import {
  useAssignServiceWindows,
  useServiceWindows,
} from "@/hooks/service-window/use-service-window";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ServiceWindowPage() {

  const [serviceSearch, setServiceSearch] = useState("");
  const [windowSearch, setWindowSearch] = useState("");
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const [selectedWindows, setSelectedWindows] = useState<
    {
      window_id: number;
      window_name?: string;
      step_order: number;
      is_required: boolean;
    }[]
  >([]);

  const { data: servicesData } = useServices(1);
  const { data: windowsData } = useWindows(1);

  const { data: assignedWindowsData } = useServiceWindows(
    selectedService || undefined
  );

  const assignMutation = useAssignServiceWindows();

  useEffect(() => {
    if (assignedWindowsData?.data?.windows) {
      const formatted = assignedWindowsData.data.windows.map(
        (window: any) => ({
          window_id: window.id,
          window_name: window.name,
          step_order: window.pivot.step_order,
          is_required: window.pivot.is_required,
        })
      );

      setSelectedWindows(formatted);
    } else {
      setSelectedWindows([]);
    }
  }, [assignedWindowsData]);

  // ✅ FIX: SAFE SERVICES ACCESS
  const services = servicesData?.data ?? [];

  const filteredServices = useMemo(() => {
    return services.filter((service: any) =>
      service.name
        .toLowerCase()
        .includes(serviceSearch.toLowerCase())
    );
  }, [services, serviceSearch]);

  const filteredWindows = useMemo(() => {
    return (
      windowsData?.data?.data?.filter((window) =>
        window.name
          .toLowerCase()
          .includes(windowSearch.toLowerCase())
      ) || []
    );
  }, [windowsData, windowSearch]);

  const handleAddWindow = (window: any) => {
    const exists = selectedWindows.find(
      (w) => w.window_id === window.id
    );

    if (exists) return;

    setSelectedWindows((prev) => [
      ...prev,
      {
        window_id: window.id,
        window_name: window.name,
        step_order: prev.length + 1,
        is_required: true,
      },
    ]);
  };

  const handleRemoveWindow = (windowId: number) => {
    const filtered = selectedWindows.filter(
      (window) => window.window_id !== windowId
    );

    const reordered = filtered.map((window, index) => ({
      ...window,
      step_order: index + 1,
    }));

    setSelectedWindows(reordered);
  };

  const handleStepChange = (windowId: number, value: number) => {
    setSelectedWindows((prev) =>
      prev.map((window) =>
        window.window_id === windowId
          ? { ...window, step_order: value }
          : window
      )
    );
  };

  const handleRequiredChange = (windowId: number, checked: boolean) => {
    setSelectedWindows((prev) =>
      prev.map((window) =>
        window.window_id === windowId
          ? { ...window, is_required: checked }
          : window
      )
    );
  };

  const handleAssign = async () => {
    if (!selectedService) {
      alert("Please select a service");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        serviceId: selectedService,
        payload: {
          windows: selectedWindows.map((window) => ({
            window_id: window.window_id,
            step_order: window.step_order,
            is_required: window.is_required,
          })),
        },
      });

      alert("Workflow saved successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-12">

      {/* LEFT PANEL */}
      <Card className="lg:col-span-4 h-[calc(100vh-120px)]">

        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>

        <CardContent className="flex h-full flex-col gap-4 overflow-hidden">

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search service..."
              className="pl-9"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
            />
          </div>

          {/* SERVICES FIXED */}
          <div className="flex-1 space-y-2 overflow-y-auto pr-2">

            {!services?.length && (
              <div className="text-sm text-muted-foreground text-center py-6">
                Loading services...
              </div>
            )}

            {services?.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">
                No services found
              </div>
            )}

            {filteredServices.map((service: any) => (
              <Button
                key={service.id}
                type="button"
                variant={
                  selectedService === service.id
                    ? "default"
                    : "outline"
                }
                className="w-full justify-start"
                onClick={() => setSelectedService(service.id)}
              >
                {service.name}
              </Button>
            ))}
          </div>

        </CardContent>
      </Card>

      {/* RIGHT PANEL (UNCHANGED) */}
      <div className="space-y-6 lg:col-span-8">

        <Card className="h-[420px]">
          <CardHeader>
            <CardTitle>Add Windows</CardTitle>
          </CardHeader>

          <CardContent className="flex h-full flex-col gap-4 overflow-hidden">

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search window..."
                className="pl-9"
                value={windowSearch}
                onChange={(e) => setWindowSearch(e.target.value)}
              />
            </div>

            <div className="grid flex-1 gap-3 overflow-y-auto pr-2 md:grid-cols-2">
              {filteredWindows.map((window) => {
                const exists = selectedWindows.find(
                  (w) => w.window_id === window.id
                );

                return (
                  <div
                    key={window.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{window.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {window.availability.join(", ")}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      disabled={!!exists}
                      onClick={() => handleAddWindow(window)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

          </CardContent>
        </Card>

        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Workflow Builder</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 overflow-y-auto">
            {selectedWindows.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                No windows selected
              </div>
            ) : (
              selectedWindows
                .sort((a, b) => a.step_order - b.step_order)
                .map((window, index) => (
                  <div
                    key={window.window_id}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          Step {window.step_order}
                        </p>
                        <p className="text-muted-foreground">
                          {window.window_name}
                        </p>
                      </div>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          handleRemoveWindow(window.window_id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleAssign}
                disabled={assignMutation.isPending}
              >
                {assignMutation.isPending ? "Saving..." : "Save Workflow"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}