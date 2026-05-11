"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
 DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Textarea } from "@/components/ui/textarea";

import Pagination from "@/components/common/Pagination";

import {
  useCreateServiceForm,
  useServiceForms,
  useServices,
} from "@/hooks/services/use-service";

export default function ServiceFormsPage() {

  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [page, setPage] =
    useState(1);

  const forms =
    data?.data?.data ||
    data?.data ||
    [];

  const [open, setOpen] =
    useState(false);

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState<
    number | undefined
  >(undefined);

  const [formData,
    setFormData] =
    useState({

      title: "",

      description: "",

      is_active: true,
    });

  /*
  |--------------------------------------------------------------------------
  | SERVICES
  |--------------------------------------------------------------------------
  */

  const {
    data: servicesResponse,
    isLoading: servicesLoading,
  } = useServices();

  const services =
    Array.isArray(
      servicesResponse?.data
    )
      ? servicesResponse.data
      : Array.isArray(
          servicesResponse?.data?.data
        )
      ? servicesResponse.data.data
      : Array.isArray(
          servicesResponse?.data?.data?.data
        )
      ? servicesResponse.data.data.data
      : [];

  /*
  |--------------------------------------------------------------------------
  | FORMS
  |--------------------------------------------------------------------------
  */

  const {
    data: formsResponse,
    isLoading,
    refetch,
  } = useServiceForms(
    selectedServiceId,
    {
      page,
      search,
      per_page: 10,
    }
  );

  const forms =
    Array.isArray(
      formsResponse?.data
    )
      ? formsResponse.data
      : Array.isArray(
          formsResponse?.data?.data
        )
      ? formsResponse.data.data
      : Array.isArray(
          formsResponse?.data?.data?.data
        )
      ? formsResponse.data.data.data
      : [];

  const meta =
    formsResponse?.meta ||
    formsResponse?.data?.meta ||
    formsResponse?.data?.data?.meta;

  /*
  |--------------------------------------------------------------------------
  | DEBUG
  |--------------------------------------------------------------------------
  */

  console.log(
    "servicesResponse",
    servicesResponse
  );

  console.log(
    "services",
    services
  );

  console.log(
    "formsResponse",
    formsResponse
  );

  console.log(
    "forms",
    forms
  );

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  const createMutation =
    useCreateServiceForm();

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function handleSubmit() {

    if (!selectedServiceId) {

      await createMutation.mutateAsync(
        {
          ...formData,
          service_id: Number(
            formData.service_id
          ),
        }
      );

      return;
    }

    if (!formData.title) {

      alert(
        "Title is required"
      );

      return;
    }

    try {

      console.log({

        serviceId:
          selectedServiceId,

        payload:
          formData,
      });

      await createMutation
        .mutateAsync({

          serviceId:
            selectedServiceId,

          payload:
            formData,
        });

      await refetch();

      setOpen(false);

      setFormData({

        title: "",

        description: "",

        is_active: true,
      });

      setSelectedServiceId(
        undefined
      );

    } catch (error: any) {

      console.error(error);

      alert(

        error?.response?.data
          ?.message ||

        "Failed to create form"
      );
    }
  }

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Service Forms
          </h1>

          <p className="text-muted-foreground">
            Manage dynamic service forms
          </p>

        </div>

        <div className="flex items-center gap-3">

          {/* SEARCH */}

          <Input
            placeholder="Search forms..."
            value={search}
            onChange={(e) => {

              setSearch(
                e.target.value
              );

              setPage(1);
            }}
            className="w-[250px]"
          />

          {/* CREATE */}

          <Dialog
            open={open}
            onOpenChange={setOpen}
          >

            <DialogTrigger asChild>

              <Button>
                Create Form
              </Button>

            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">

              <DialogHeader>

                <DialogTitle>
                  Create Service Form
                </DialogTitle>

              </DialogHeader>

              <div className="space-y-4">

                {/* SERVICE */}

                <div className="space-y-2">

                  <Label>
                    Service
                  </Label>

                  <Select
                    value={
                      selectedServiceId?.toString()
                    }
                    onValueChange={(value) =>
                      setSelectedServiceId(
                        Number(value)
                      )
                    }
                  >

                    <SelectTrigger>

                      <SelectValue placeholder="Select Service" />

                    </SelectTrigger>

                    <SelectContent>

                      {services.length > 0 ? (

                        services.map(
                          (
                            service: any
                          ) => (

                            <SelectItem
                              key={
                                service.id
                              }
                              value={service.id.toString()}
                            >
                              {service.name}
                            </SelectItem>
                          )
                        )

                      ) : (

                        <div className="p-3 text-sm text-muted-foreground">

                  <td className="p-3">
                    {form.service?.name || form.service_name || form.service_id}
                  </td>

                        </div>

                      )}

                    </SelectContent>

                  </Select>

                </div>

                {/* TITLE */}

                <div className="space-y-2">

                  <Label>
                    Title
                  </Label>

                  <Input
                    placeholder="Form title"
                    value={
                      formData.title
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title:
                          e.target
                            .value,
                      })
                    }
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="space-y-2">

                  <Label>
                    Description
                  </Label>

                  <Textarea
                    placeholder="Description"
                    value={
                      formData.description
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description:
                          e.target
                            .value,
                      })
                    }
                  />

                </div>

                {/* ACTIONS */}

                <div className="flex justify-end gap-3">

                  <Button
                    variant="outline"
                    onClick={() =>
                      setOpen(false)
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={
                      handleSubmit
                    }
                    disabled={
                      createMutation.isPending
                    }
                  >

                    {createMutation.isPending
                      ? "Saving..."
                      : "Save"}

                  </Button>

                </div>

              </div>

            </DialogContent>

          </Dialog>

        </div>

      </div>

      {/* TABLE */}

      <Card>

        <CardHeader>

          <CardTitle>
            Forms List
          </CardTitle>

        </CardHeader>

        <CardContent>

          {isLoading ? (

            <div className="py-10 text-center">
              Loading...
            </div>

          ) : (

            <div className="space-y-4">

              <div className="overflow-x-auto">

                <Table>

                  <TableHeader>

                    <TableRow>

                      <TableHead>
                        ID
                      </TableHead>

                      <TableHead>
                        Service
                      </TableHead>

                      <TableHead>
                        Title
                      </TableHead>

                      <TableHead>
                        Description
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                    </TableRow>

                  </TableHeader>

                  <TableBody>

                    {forms.length > 0 ? (

                      forms.map(
                        (
                          form: any
                        ) => (

                          <TableRow
                            key={
                              form.id
                            }
                          >

                            <TableCell>
                              {form.id}
                            </TableCell>

                            <TableCell>

                              {form
                                .service
                                ?.name ||

                                services.find(
                                  (
                                    service: any
                                  ) =>
                                    service.id ===
                                    form.service_id
                                )?.name ||

                                "-"}

                            </TableCell>

                            <TableCell className="font-medium">

                              {form.title}

                            </TableCell>

                            <TableCell>

                              {form.description ||
                                "-"}

                            </TableCell>

                            <TableCell>

                              <Badge
                                variant={
                                  form.is_active
                                    ? "default"
                                    : "destructive"
                                }
                              >

                                {form.is_active
                                  ? "Active"
                                  : "Inactive"}

                              </Badge>

                            </TableCell>

                          </TableRow>
                        )
                      )

                    ) : (

                      <TableRow>

                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-muted-foreground"
                        >

                          No forms found

                        </TableCell>

                      </TableRow>

                    )}

                  </TableBody>

                </Table>

              </div>

              {/* PAGINATION */}

              {meta && (

                <Pagination
                  currentPage={
                    meta.current_page
                  }
                  lastPage={
                    meta.last_page
                  }
                  onPageChange={
                    setPage
                  }
                />

              )}

            </div>

          )}

        </CardContent>

      </Card>

    </div>
  );
}