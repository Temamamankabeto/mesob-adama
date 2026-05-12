"use client";

import { useState } from "react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import SectionForm from "@/components/service-form-sections/SectionForm";

import {
  useCreateServiceFormSection,
  useServiceFormSections,
} from "@/hooks/service-form-section/use-service-form-section";

import {
  ServiceFormSection,
  ServiceFormSectionPayload,
} from "@/types/service-form-section";

export default function ServiceFormSectionsPage() {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<ServiceFormSectionPayload>({
    service_form_id: 0,
    title: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  const {
    data,
    isLoading,
  } = useServiceFormSections();

  const createMutation = useCreateServiceFormSection();

  const sections: ServiceFormSection[] =
    data?.data?.data ||
    data?.data ||
    [];

  async function handleCreate() {
    await createMutation.mutateAsync({
      ...formData,
      service_form_id: Number(formData.service_form_id),
      sort_order: Number(formData.sort_order),
    });

    setOpen(false);

    setFormData({
      service_form_id: 0,
      title: "",
      description: "",
      sort_order: 0,
      is_active: true,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Service Form Sections
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage form sections
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Section</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Create Section
              </DialogTitle>
            </DialogHeader>

            <SectionForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              loading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Sections List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Service Form</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Sort Order</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sections.length > 0 ? (
                sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>{section.id}</TableCell>

                    <TableCell>
                      {section.service_form?.title || section.service_form_id}
                    </TableCell>

                    <TableCell>{section.title}</TableCell>

                    <TableCell>
                      {section.description || "-"}
                    </TableCell>

                    <TableCell>{section.sort_order}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No sections found
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
