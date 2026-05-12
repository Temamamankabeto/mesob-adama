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
import { Input } from "@/components/ui/input";

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

  const [selectedWindows, setSelectedWindows] = useState<any[]>([]);

  const { data: servicesData } = useServices(1);
  const { data: windowsData } = useWindows(1);

  const { data: assignedWindowsData } = useServiceWindows(
    selectedService || undefined
  );

  const assignMutation = useAssignServiceWindows();

  /*
  |--------------------------------------------------------------------------
  | SAFE SERVICES
  |--------------------------------------------------------------------------
  */

  const services = useMemo(() => {
    const raw = servicesData;

    return (
      raw?.data?.data ||
      raw?.data ||
      raw ||
      []
    );
  }, [servicesData]);

  /*
  |--------------------------------------------------------------------------
  | SAFE WINDOWS
  |--------------------------------------------------------------------------
  */

  const windows = useMemo(() => {
    const raw = windowsData;

    return (
      raw?.data?.data ||
      raw?.data ||
      raw ||
      []
    );
  }, [windowsData]);

  /*
  |--------------------------------------------------------------------------
  | ASSIGNED WINDOWS STATE
  |--------------------------------------------------------------------------
  */

  const assignedWindowIds = useMemo(() => {
    return (
      assignedWindowsData?.data?.windows?.map(
        (w: any) => w.id
      ) || []
    );
  }, [assignedWindowsData]);

  useEffect(() => {
    if (assignedWindowsData?.data?.windows) {
      const formatted = assignedWindowsData.data.windows.map(
        (w: any) => ({
          window_id: w.id,
          window_name: w.name,
          step_order: w.pivot.step_order,
          is_required: w.pivot.is_required,
        })
      );

      setSelectedWindows(formatted);
    } else {
      setSelectedWindows([]);
    }
  }, [assignedWindowsData]);

  /*
  |--------------------------------------------------------------------------
  | FILTER SERVICES
  |--------------------------------------------------------------------------
  */

  const filteredServices = useMemo(() => {
    if (!Array.isArray(services)) return [];

    return services.filter((service: any) =>
      service?.name
        ?.toLowerCase()
        .includes(serviceSearch.toLowerCase())
    );
  }, [services, serviceSearch]);

  /*
  |--------------------------------------------------------------------------
  | FILTER WINDOWS
  |--------------------------------------------------------------------------
  */

  const filteredWindows = useMemo(() => {
    if (!Array.isArray(windows)) return [];

    return windows.filter((w: any) =>
      w?.name
        ?.toLowerCase()
        .includes(windowSearch.toLowerCase())
    );
  }, [windows, windowSearch]);

  /*
  |--------------------------------------------------------------------------
  | ADD WINDOW
  |--------------------------------------------------------------------------
  */

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

  const handleRemoveWindow = (id: number) => {
    const filtered = selectedWindows.filter(
      (w) => w.window_id !== id
    );

    const reordered = filtered.map((w, i) => ({
      ...w,
      step_order: i + 1,
    }));

    setSelectedWindows(reordered);
  };

  /*
  |--------------------------------------------------------------------------
  | ASSIGN
  |--------------------------------------------------------------------------
  */

  const handleAssign = async () => {
    if (!selectedService) return alert("Select service first");

    await assignMutation.mutateAsync({
      serviceId: selectedService,
      payload: {
        windows: selectedWindows.map((w) => ({
          window_id: w.window_id,
          step_order: w.step_order,
          is_required: w.is_required,
        })),
      },
    });

    alert("Workflow saved");
  };

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-12">

      {/* LEFT */}
      <Card className="lg:col-span-4 h-[100vh]">

        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">

          <Input
            placeholder="Search services..."
            value={serviceSearch}
            onChange={(e) => setServiceSearch(e.target.value)}
          />

          <div className="overflow-y-auto space-y-2">

            {filteredServices.map((service: any) => (
              <Button
                key={service.id}
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

      {/* RIGHT */}
      <div className="lg:col-span-8 space-y-6">

        {/* WINDOWS */}
        <Card>
          <CardHeader>
            <CardTitle>Add Windows</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">

            <Input
              placeholder="Search windows..."
              value={windowSearch}
              onChange={(e) => setWindowSearch(e.target.value)}
            />

            <div className="grid md:grid-cols-2 gap-3">

              {filteredWindows.map((w: any) => {
                const isAssigned = assignedWindowIds.includes(w.id);

                return (
                  <div
                    key={w.id}
                    className={`border p-3 rounded flex justify-between items-center ${
                      isAssigned ? "opacity-50" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium">{w.name}</p>
                    </div>

                    <Button
                      size="icon"
                      disabled={isAssigned}
                      onClick={() => handleAddWindow(w)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                  </div>
                );
              })}

            </div>

          </CardContent>
        </Card>

        {/* WORKFLOW */}
        <Card>

          <CardHeader>
            <CardTitle>Workflow</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">

            {selectedWindows.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                No windows selected
              </div>
            ) : (
              selectedWindows.map((w) => (
                <div
                  key={w.window_id}
                  className="border p-3 rounded flex justify-between"
                >
                  <div>
                    <p className="font-medium">
                      Step {w.step_order}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {w.window_name}
                    </p>
                  </div>

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() =>
                      handleRemoveWindow(w.window_id)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                </div>
              ))
            )}

            <div className="flex justify-end">
              <Button onClick={handleAssign}>
                Save Workflow
              </Button>
            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}