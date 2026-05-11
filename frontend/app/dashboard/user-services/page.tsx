"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useUsers } from "@/hooks/user/useUsers";
import { useAssignUserServices, useServices } from "@/hooks/services/use-service";

export default function UserServicePage() {
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<any | null>(null);
  const [assignmentType, setAssignmentType] = useState<"front" | "back">("front");

  const { data: usersData } = useUsers(1);
  const { data: servicesData } = useServices(1);

  const assignMutation = useAssignUserServices();

  const services = servicesData?.data?.data || [];
  const users = usersData?.data || [];

  const filteredServices = useMemo(() => {
    return services.filter((service: any) =>
      service.name?.toLowerCase()?.includes(serviceSearch.toLowerCase())
    );
  }, [services, serviceSearch]);

  const filteredOfficers = useMemo(() => {
    return users.filter((user: any) => {
      const role = (user.role || user.roles?.[0]?.name || "").toLowerCase();

      if (assignmentType === "front") {
        return role.includes("front");
      }

      return role.includes("back");
    });
  }, [users, assignmentType]);

  const currentAssignedOfficer = useMemo(() => {
    if (!selectedService) {
      return null;
    }

    const assignedUsers = selectedService.assigned_users || selectedService.assignedUsers || [];

    return assignedUsers.find((user: any) => {
      const role = (user.role || user.roles?.[0]?.name || "").toLowerCase();

      const isActive = user.pivot?.is_active === true || user.pivot?.is_active === 1;

      if (!isActive) {
        return false;
      }

      if (assignmentType === "front") {
        return role.includes("front");
      }

      return role.includes("back");
    });
  }, [selectedService, assignmentType]);

  const handleAssign = async () => {
    if (!selectedService || !selectedOfficer) {
      return;
    }

    try {
      await assignMutation.mutateAsync({
        userId: selectedOfficer.id,
        payload: {
          service_ids: [selectedService.id],
        },
      });

      alert("Service assigned successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to assign service");
    }
  };

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-12">
      <Card className="h-[calc(100vh-120px)] lg:col-span-5">
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

          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {filteredServices.map((service: any) => (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  setSelectedService(service);
                  setSelectedOfficer(null);
                }}
                className={`w-full rounded-xl border p-4 text-left transition ${selectedService?.id === service.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.status}</p>
                  </div>

                  <Badge>
                    {service.has_back_officer ? "Front + Back" : "Front Only"}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 lg:col-span-7">
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>

          <CardContent>
            {!selectedService ? (
              <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                Select service to continue
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-xl border p-4">
                  <h2 className="text-lg font-bold">{selectedService.name}</h2>
                  <p className="text-sm text-muted-foreground">Service Assignment Workflow</p>
                </div>

                <Tabs
                  defaultValue="front"
                  value={assignmentType}
                  onValueChange={(value) => {
                    setAssignmentType(value as "front" | "back");
                    setSelectedOfficer(null);
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="front">Assign Front Officer</TabsTrigger>

                    <TabsTrigger value="back" disabled={!selectedService.has_back_officer}>
                      Assign Back Officer
                    </TabsTrigger>
                  </TabsList>

                  {currentAssignedOfficer && (
                    <Alert className="mt-4 border-yellow-500">
                      <AlertTriangle className="h-4 w-4" />

                      <AlertDescription>
                        Current {assignmentType} officer:
                        <strong> {currentAssignedOfficer.name}</strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  <TabsContent value="front">
                    <div className="space-y-3">
                      {filteredOfficers.map((user: any) => {
                        const isAssigned = Number(currentAssignedOfficer?.id) === Number(user.id);

                        if (isAssigned) {
                          return (
                            <div
                              key={user.id}
                              className="pointer-events-none w-full cursor-not-allowed rounded-xl border border-green-500 bg-green-50 p-4 text-left opacity-50"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">{user.role}</p>
                                </div>

                                <Badge className="bg-green-600">Currently Assigned</Badge>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => setSelectedOfficer(user)}
                            className={`w-full rounded-xl border p-4 text-left transition ${selectedOfficer?.id === user.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                          >
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.role}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="back">
                    <div className="space-y-3">
                      {filteredOfficers.map((user: any) => {
                        const isAssigned = Number(currentAssignedOfficer?.id) === Number(user.id);

                        if (isAssigned) {
                          return (
                            <div
                              key={user.id}
                              className="pointer-events-none w-full cursor-not-allowed rounded-xl border border-green-500 bg-green-50 p-4 text-left opacity-50"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">{user.role}</p>
                                </div>

                                <Badge className="bg-green-600">Currently Assigned</Badge>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => setSelectedOfficer(user)}
                            className={`w-full rounded-xl border p-4 text-left transition ${selectedOfficer?.id === user.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                          >
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.role}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  <Button onClick={handleAssign} disabled={assignMutation.isPending || !selectedOfficer}>
                    <Plus className="mr-2 h-4 w-4" />
                    {assignMutation.isPending ? "Assigning..." : "Assign Service"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
