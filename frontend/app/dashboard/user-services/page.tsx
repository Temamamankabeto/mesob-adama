"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Plus,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
 CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import { useUsers } from "@/hooks/user/useUsers";

import {
  useAssignUserServices,
  useServices,
} from "@/hooks/services/use-service";

export default function UserServicePage() {

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [serviceSearch, setServiceSearch] =
    useState("");

  const [selectedService, setSelectedService] =
    useState<any | null>(null);

  const [selectedOfficer, setSelectedOfficer] =
    useState<any | null>(null);

  const [assignmentType, setAssignmentType] =
    useState<
      "front" | "back"
    >("front");

  /*
  |--------------------------------------------------------------------------
  | QUERIES
  |--------------------------------------------------------------------------
  */

  const { data: usersData } =
    useUsers(1);

  const { data: servicesData } =
    useServices(1);

  /*
  |--------------------------------------------------------------------------
  | MUTATION
  |--------------------------------------------------------------------------
  */

  const assignMutation =
    useAssignUserServices();

  /*
  |--------------------------------------------------------------------------
  | SERVICES
  |--------------------------------------------------------------------------
  */

  const services =
    servicesData?.data?.data || [];

  /*
  |--------------------------------------------------------------------------
  | USERS
  |--------------------------------------------------------------------------
  */

  const users =
    usersData?.data || [];

  /*
  |--------------------------------------------------------------------------
  | FILTER SERVICES
  |--------------------------------------------------------------------------
  */

  const filteredServices =
    useMemo(() => {

      return services.filter(
        (service: any) =>
          service.name
            ?.toLowerCase()
            ?.includes(
              serviceSearch.toLowerCase()
            )
      );

    }, [
      services,
      serviceSearch,
    ]);

  /*
  |--------------------------------------------------------------------------
  | FILTER OFFICERS
  |--------------------------------------------------------------------------
  */

  const filteredOfficers =
    useMemo(() => {

      return users.filter(
        (user: any) => {

          const role =
            (
              user.role ||

              user.roles?.[0]?.name ||

              ""
            )
            .toLowerCase();

          /*
          |--------------------------------------------------------------------------
          | FRONT
          |--------------------------------------------------------------------------
          */

          if (
            assignmentType ===
            "front"
          ) {

            return (
              role.includes(
                "front"
              ) ||

              role.includes(
                "front_officer"
              )
            );
          }

          /*
          |--------------------------------------------------------------------------
          | BACK
          |--------------------------------------------------------------------------
          */

          return (
            role.includes(
              "back"
            ) ||

            role.includes(
              "back_officer"
            )
          );
        }
      );

    }, [
      users,
      assignmentType,
    ]);

  /*
  |--------------------------------------------------------------------------
  | CURRENT ASSIGNED OFFICER
  |--------------------------------------------------------------------------
  */

  const currentAssignedOfficer =
    useMemo(() => {

      if (!selectedService) {
        return null;
      }

      /*
      |--------------------------------------------------------------------------
      | SUPPORT MULTIPLE RESPONSE STRUCTURES
      |--------------------------------------------------------------------------
      */

      const assignedUsers =

        selectedService.assigned_users ||

        selectedService.assignedUsers ||

        [];

      return assignedUsers.find(
        (user: any) => {

          /*
          |--------------------------------------------------------------------------
          | ROLE
          |--------------------------------------------------------------------------
          */

          const role =
            (
              user.role ||

              user.roles?.[0]?.name ||

              ""
            )
            .toLowerCase();

          /*
          |--------------------------------------------------------------------------
          | ACTIVE
          |--------------------------------------------------------------------------
          */

          const isActive =
            user.pivot?.is_active === true ||

            user.pivot?.is_active === 1;

          if (!isActive) {
            return false;
          }

          /*
          |--------------------------------------------------------------------------
          | FRONT
          |--------------------------------------------------------------------------
          */

          if (
            assignmentType ===
            "front"
          ) {

            return (
              role.includes(
                "front"
              ) ||

              role.includes(
                "front_officer"
              )
            );
          }

          /*
          |--------------------------------------------------------------------------
          | BACK
          |--------------------------------------------------------------------------
          */

          return (
            role.includes(
              "back"
            ) ||

            role.includes(
              "back_officer"
            )
          );
        }
      );

    }, [
      selectedService,
      assignmentType,
    ]);

  /*
  |--------------------------------------------------------------------------
  | ASSIGN
  |--------------------------------------------------------------------------
  */

  const handleAssign =
    async () => {

      /*
      |--------------------------------------------------------------------------
      | VALIDATION
      |--------------------------------------------------------------------------
      */

      if (
        !selectedService
      ) {

        alert(
          "Please select service"
        );

        return;
      }

      if (
        !selectedOfficer
      ) {

        alert(
          "Please select officer"
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | BACK OFFICER VALIDATION
      |--------------------------------------------------------------------------
      */

      if (
        assignmentType ===
          "back" &&
        !selectedService.has_back_officer
      ) {

        alert(
          "This service has no back officer"
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | SAME OFFICER ALREADY ASSIGNED
      |--------------------------------------------------------------------------
      */

      if (
        Number(
          currentAssignedOfficer?.id
        ) ===
        Number(
          selectedOfficer.id
        )
      ) {

        alert(

          assignmentType ===
          "front"

            ? "This front officer is already assigned to this service"

            : "This back officer is already assigned to this service"
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | REASSIGN CONFIRMATION
      |--------------------------------------------------------------------------
      */

      if (
        currentAssignedOfficer &&
        Number(
          currentAssignedOfficer.id
        ) !==
        Number(
          selectedOfficer.id
        )
      ) {

        const confirmed =
          confirm(

            assignmentType ===
            "front"

              ? `This service is currently assigned to ${currentAssignedOfficer.name}. Reassign to ${selectedOfficer.name}?`

              : `This service is currently assigned to ${currentAssignedOfficer.name}. Reassign to ${selectedOfficer.name}?`
          );

        if (!confirmed) {
          return;
        }
      }

      /*
      |--------------------------------------------------------------------------
      | ASSIGN
      |--------------------------------------------------------------------------
      */

      try {

        await assignMutation.mutateAsync({

          userId:
            selectedOfficer.id,

          payload: {

            service_ids: [
              selectedService.id,
            ],
          },
        });

        alert(

          currentAssignedOfficer

            ? "Officer reassigned successfully"

            : "Service assigned successfully"
        );

      } catch (error) {

        console.error(error);

        alert(
          "Failed to assign service"
        );
      }
    };

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-12">

      {/* SERVICES */}

      <Card className="h-[calc(100vh-120px)] lg:col-span-5">

        <CardHeader>

          <CardTitle>
            Services
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

          <div className="flex-1 space-y-3 overflow-y-auto pr-2">

            {filteredServices.map(
              (service: any) => (

                <button
                  key={service.id}
                  type="button"
                  onClick={() => {

                    setSelectedService(
                      service
                    );

                    setSelectedOfficer(
                      null
                    );
                  }}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedService?.id ===
                    service.id

                      ? "border-primary bg-primary/5"

                      : "hover:bg-muted"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="font-semibold">
                        {service.name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {service.status}
                      </p>

                    </div>

                    <Badge>

                      {service.has_back_officer
                        ? "Front + Back"
                        : "Front Only"}

                    </Badge>

                  </div>

                </button>
              )
            )}

          </div>

        </CardContent>

      </Card>

      {/* RIGHT PANEL */}

      <div className="space-y-6 lg:col-span-7">

        <Card>

          <CardHeader>

            <CardTitle>
              Assignment
            </CardTitle>

          </CardHeader>

          <CardContent>

            {!selectedService ? (

              <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">

                Select service to continue

              </div>

            ) : (

              <div className="space-y-6">

                {/* SERVICE INFO */}

                <div className="rounded-xl border p-4">

                  <h2 className="text-lg font-bold">
                    {selectedService.name}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Service Assignment Workflow
                  </p>

                </div>

                {/* TABS */}

                <Tabs
                  defaultValue="front"
                  value={
                    assignmentType
                  }
                  onValueChange={(value) => {

                    setAssignmentType(
                      value as
                        | "front"
                        | "back"
                    );

                    setSelectedOfficer(
                      null
                    );
                  }}
                >

                  <TabsList className="grid w-full grid-cols-2">

                    <TabsTrigger value="front">
                      Assign Front Officer
                    </TabsTrigger>

                    <TabsTrigger
                      value="back"
                      disabled={
                        !selectedService.has_back_officer
                      }
                    >
                      Assign Back Officer
                    </TabsTrigger>

                  </TabsList>

                  {/* CURRENT OFFICER */}

                  {currentAssignedOfficer && (

                    <Alert className="mt-4 border-yellow-500">

                      <AlertTriangle className="h-4 w-4" />

                      <AlertDescription>

                        Current{" "}

                        {assignmentType}

                        {" "}officer:

                        {" "}

                        <strong>
                          {
                            currentAssignedOfficer.name
                          }
                        </strong>

                      </AlertDescription>

                    </Alert>
                  )}

                  {/* FRONT */}

                  <TabsContent value="front">

                    <div className="space-y-3">

                      {filteredOfficers.map(
                        (user: any) => (

                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {

                              /*
                              |--------------------------------------------------------------------------
                              | DISABLE CURRENT ASSIGNED
                              |--------------------------------------------------------------------------
                              */

                              if (
                                Number(
                                  currentAssignedOfficer?.id
                                ) ===
                                Number(
                                  user.id
                                )
                              ) {
                                return;
                              }

                              setSelectedOfficer(
                                user
                              );
                            }}
                            className={`w-full rounded-xl border p-4 text-left transition ${
                              selectedOfficer?.id ===
                              user.id

                                ? "border-primary bg-primary/5"

                                : "hover:bg-muted"
                            } ${
                              Number(
                                currentAssignedOfficer?.id
                              ) ===
                              Number(
                                user.id
                              )

                                ? "border-green-500 bg-green-50 cursor-not-allowed"

                                : ""
                            }`}
                          >

                            <div className="flex items-center justify-between">

                              <div>

                                <p className="font-semibold">
                                  {user.name}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                  {user.role}
                                </p>

                              </div>

                              {Number(
                                currentAssignedOfficer?.id
                              ) ===
                              Number(
                                user.id
                              ) && (

                                <Badge className="bg-green-600">

                                  Currently Assigned

                                </Badge>
                              )}

                            </div>

                          </button>
                        )
                      )}

                    </div>

                  </TabsContent>

                  {/* BACK */}

                  <TabsContent value="back">

                    {!selectedService.has_back_officer ? (

                      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">

                        This service has no back officer

                      </div>

                    ) : (

                      <div className="space-y-3">

                        {filteredOfficers.map(
                          (user: any) => (

                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {

                                /*
                                |--------------------------------------------------------------------------
                                | DISABLE CURRENT ASSIGNED
                                |--------------------------------------------------------------------------
                                */

                                if (
                                  Number(
                                    currentAssignedOfficer?.id
                                  ) ===
                                  Number(
                                    user.id
                                  )
                                ) {
                                  return;
                                }

                                setSelectedOfficer(
                                  user
                                );
                              }}
                              className={`w-full rounded-xl border p-4 text-left transition ${
                                selectedOfficer?.id ===
                                user.id

                                  ? "border-primary bg-primary/5"

                                  : "hover:bg-muted"
                              } ${
                                Number(
                                  currentAssignedOfficer?.id
                                ) ===
                                Number(
                                  user.id
                                )

                                  ? "border-green-500 bg-green-50 cursor-not-allowed"

                                  : ""
                              }`}
                            >

                              <div className="flex items-center justify-between">

                                <div>

                                  <p className="font-semibold">
                                    {user.name}
                                  </p>

                                  <p className="text-sm text-muted-foreground">
                                    {user.role}
                                  </p>

                                </div>

                                {Number(
                                  currentAssignedOfficer?.id
                                ) ===
                                Number(
                                  user.id
                                ) && (

                                  <Badge className="bg-green-600">

                                    Currently Assigned

                                  </Badge>
                                )}

                              </div>

                            </button>
                          )
                        )}

                      </div>

                    )}

                  </TabsContent>

                </Tabs>

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

                    <Plus className="mr-2 h-4 w-4" />

                    {assignMutation.isPending

                      ? "Assigning..."

                      : currentAssignedOfficer

                        ? "Reassign Officer"

                        : "Assign Service"}

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