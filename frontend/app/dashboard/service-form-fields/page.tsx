"use client";

import { useState } from "react";

import {
  Button,
} from "@/components/ui/button";

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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import FieldForm from "@/components/service-form-fields/FieldForm";

import {
  useCreateServiceFormField,
  useServiceFormFields,
} from "@/hooks/service-form-field/use-service-form-field";

import {
  ServiceFormField,
  ServiceFormFieldPayload,
} from "@/types/service-form-field";

export default function ServiceFormFieldsPage() {
  const [open, setOpen] =
    useState(false);

  const [formData, setFormData] =
    useState<ServiceFormFieldPayload>({
      service_form_id: 0,
      service_form_section_id: 0,
      label: "",
      name: "",
      type: "",
      is_required: false,
      is_active: true,
      sort_order: 0,
    });

  const {
    data: fields = [],
    isLoading,
  } = useServiceFormFields();

  const createMutation =
    useCreateServiceFormField();

  async function handleCreate() {
    await createMutation.mutateAsync({
      ...formData,

      service_form_id: Number(
        formData.service_form_id
      ),

      service_form_section_id:
        Number(
          formData.service_form_section_id
        ),
    });

    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Service Form Fields
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage dynamic form fields
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button>
              Create Field
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Create Field
              </DialogTitle>
            </DialogHeader>

            <FieldForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              loading={
                createMutation.isPending
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Fields List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Form
                </TableHead>

                <TableHead>
                  Section
                </TableHead>

                <TableHead>
                  Label
                </TableHead>

                <TableHead>
                  Name
                </TableHead>

                <TableHead>
                  Type
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : fields.length > 0 ? (
                fields.map(
                  (
                    field: ServiceFormField
                  ) => (
                    <TableRow
                      key={field.id}
                    >
                      <TableCell>
                        {field.form?.title}
                      </TableCell>

                      <TableCell>
                        {field.section?.title}
                      </TableCell>

                      <TableCell>
                        {field.label}
                      </TableCell>

                      <TableCell>
                        {field.name}
                      </TableCell>

                      <TableCell>
                        {field.type}
                      </TableCell>
                    </TableRow>
                  )
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center"
                  >
                    No fields found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}