// ============================================================
// FILE: app/dashboard/user-service/page.tsx
// ============================================================

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

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { useUsers } from "@/hooks/user/useUsers";

import { useServices } from "@/hooks/services/use-service";

import {
  useAssignUserServices,
  useUserAssignedServices,
} from "@/hooks/user-service-assignment/use-user-service-assignment";

export default function UserServicePage() {

  /*
  |--------------------------------------------------------------------------
  | States
  |--------------------------------------------------------------------------
  */

  const [userSearch, setUserSearch] =
    useState("");

  const [serviceSearch, setServiceSearch] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState<number | null>(null);

  const [selectedServices, setSelectedServices] =
    useState<
      {
        id: number;
        name: string;
      }[]
    >([]);

  /*
  |--------------------------------------------------------------------------
  | Queries
  |--------------------------------------------------------------------------
  */

  const { data: usersData } =
    useUsers(1);

  const { data: servicesData } =
    useServices(1);

  const {
    data: assignedServicesData,
  } = useUserAssignedServices(
    selectedUser || undefined
  );

  /*
  |--------------------------------------------------------------------------
  | Mutation
  |--------------------------------------------------------------------------
  */

  const assignMutation =
    useAssignUserServices();

  /*
  |--------------------------------------------------------------------------
  | Load Assigned Services
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      assignedServicesData?.data
        ?.assigned_services
    ) {

      setSelectedServices(
        assignedServicesData.data.assigned_services
      );

    } else {

      setSelectedServices([]);
    }

  }, [assignedServicesData]);

  /*
  |--------------------------------------------------------------------------
  | Filter Users
  |--------------------------------------------------------------------------
  */

  const filteredUsers =
    useMemo(() => {

      return (
        usersData?.data?.filter(
          (user: any) =>
            user.name
              .toLowerCase()
              .includes(
                userSearch.toLowerCase()
              )
        ) || []
      );

    }, [
      usersData,
      userSearch,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Filter Services
  |--------------------------------------------------------------------------
  */

 const filteredServices =
  useMemo(() => {

    return (
      servicesData?.data?.data?.filter(
        (service: any) =>
          service.name
            .toLowerCase()
            .includes(
              serviceSearch.toLowerCase()
            )
      ) || []
    );

  }, [
    servicesData,
    serviceSearch,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Add Service
  |--------------------------------------------------------------------------
  */

  const handleAddService = (
    service: any
  ) => {

    const exists =
      selectedServices.find(
        (s) =>
          s.id === service.id
      );

    if (exists) return;

    setSelectedServices((prev) => [

      ...prev,

      {
        id: service.id,

        name: service.name,
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Service
  |--------------------------------------------------------------------------
  */

  const handleRemoveService = (
    serviceId: number
  ) => {

    setSelectedServices((prev) =>
      prev.filter(
        (service) =>
          service.id !==
          serviceId
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Save Assignment
  |--------------------------------------------------------------------------
  */

  const handleAssign = async () => {

    if (!selectedUser) {

      alert(
        "Please select user"
      );

      return;
    }

    try {

      await assignMutation.mutateAsync({

        userId:
          selectedUser,

        payload: {
          service_ids:
            selectedServices.map(
              (service) =>
                service.id
            ),
        },
      });

      alert(
        "Services assigned successfully"
      );

    } catch (error) {

      console.error(error);
    }
  };

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-12">

      {/* USERS */}
      <Card className="lg:col-span-4 h-[calc(100vh-120px)]">

        <CardHeader>
          <CardTitle>
            Officers
          </CardTitle>
        </CardHeader>

        <CardContent className="flex h-full flex-col gap-4 overflow-hidden">

          {/* SEARCH */}
          <div className="relative">

            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search user..."

              className="pl-9"

              value={userSearch}

              onChange={(e) =>
                setUserSearch(
                  e.target.value
                )
              }
            />
          </div>

          {/* USERS */}
          <div className="flex-1 space-y-2 overflow-y-auto pr-2">

            {filteredUsers.map(
              (user: any) => (

                <Button
                  key={user.id}

                  type="button"

                  variant={
                    selectedUser ===
                    user.id

                      ? "default"

                      : "outline"
                  }

                  className="w-full justify-start"

                  onClick={() =>
                    setSelectedUser(
                      user.id
                    )
                  }
                >
                  <div className="text-left">

                    <p>
                      {user.name}
                    </p>

                    <p className="text-xs opacity-70">
                      {user.role}
                    </p>
                  </div>
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* RIGHT */}
      <div className="space-y-6 lg:col-span-8">

        {/* SERVICES */}
        <Card className="h-[420px]">

          <CardHeader>
            <CardTitle>
              Assign Services
            </CardTitle>
          </CardHeader>

          <CardContent className="flex h-full flex-col gap-4 overflow-hidden">

            {/* SEARCH */}
            <div className="relative">

              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="Search service..."

                className="pl-9"

                value={serviceSearch}

                onChange={(e) =>
                  setServiceSearch(
                    e.target.value
                  )
                }
              />
            </div>

            {/* SERVICES */}
            <div className="grid flex-1 gap-3 overflow-y-auto pr-2 md:grid-cols-2">

              {filteredServices.map(
                (service: any) => {

                  const exists =
                    selectedServices.find(
                      (s) =>
                        s.id ===
                        service.id
                    );

                  return (

                    <div
                      key={service.id}

                      className="flex items-center justify-between rounded-lg border p-3"
                    >

                      <div>

                        <p className="font-medium">
                          {service.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {service.status}
                        </p>
                      </div>

                      <Button
                        size="icon"

                        disabled={
                          !!exists
                        }

                        onClick={() =>
                          handleAddService(
                            service
                          )
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        {/* ASSIGNED */}
        <Card className="min-h-[400px]">

          <CardHeader>
            <CardTitle>
              Assigned Services
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 overflow-y-auto">

            {selectedServices.length ===
            0 ? (

              <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">

                No services assigned
              </div>

            ) : (

              selectedServices.map(
                (service) => (

                  <div
                    key={service.id}

                    className="flex items-center justify-between rounded-xl border p-4"
                  >

                    <div>

                      <p className="font-semibold">
                        {service.name}
                      </p>
                    </div>

                    <Button
                      variant="destructive"

                      size="icon"

                      onClick={() =>
                        handleRemoveService(
                          service.id
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              )
            )}

            {/* ACTION */}
            <div className="flex justify-end">

              <Button
                onClick={
                  handleAssign
                }

                disabled={
                  assignMutation.isPending
                }
              >
                {assignMutation.isPending

                  ? "Saving..."

                  : "Save Assignment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}