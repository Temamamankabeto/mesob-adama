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

import api from "@/lib/api";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export default function ServiceFormSectionsPage() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    service_form_id: "",
    title: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["service-form-sections"],
    queryFn: async () => {
      const response = await api.get(
        "/service-form-sections"
      );

      return response.data;
    },
  });

  const sections =
    data?.data?.data ||
    data?.data ||
    [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        "/service-form-sections",
        {
          ...formData,
          service_form_id: Number(formData.service_form_id),
          sort_order: Number(formData.sort_order),
        }
      );

      return response.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["service-form-sections"],
      });

      setOpen(false);

      setFormData({
        service_form_id: "",
        title: "",
        description: "",
        sort_order: 0,
        is_active: true,
      });
    },
  });

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

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button>
              Create Section
            </Button>
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
              onSubmit={() =>
                createMutation.mutate()
              }
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
                  <TableCell
                    colSpan={5}
                    className="text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sections.length > 0 ? (
                sections.map((section: any) => (
                  <TableRow key={section.id}>
                    <TableCell>
                      {section.id}
                    </TableCell>

                    <TableCell>
                      {section.service_form?.title || section.service_form_id}
                    </TableCell>

                    <TableCell>
                      {section.title}
                    </TableCell>

                    <TableCell>
                      {section.description || "-"}
                    </TableCell>

                    <TableCell>
                      {section.sort_order}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center"
                  >
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
