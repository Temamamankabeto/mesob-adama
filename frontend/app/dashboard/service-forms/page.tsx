"use client";

import { useState } from "react";

import {
  useCreateServiceForm,
  useServiceForms,
  useServices,
} from "@/hooks/services/use-service";

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

export default function ServiceFormsPage() {
  const [open, setOpen] = useState(false);

  const {
    data: formsResponse,
    isLoading,
    refetch,
  } = useServiceForms();

  const {
    data: servicesResponse,
  } = useServices();

  const createMutation = useCreateServiceForm();

  const forms =
    formsResponse?.data?.data ||
    formsResponse?.data ||
    [];

  const services =
    servicesResponse?.data?.data ||
    servicesResponse?.data ||
    [];

  const [formData, setFormData] = useState({
    service_id: "",
    title: "",
    description: "",
    is_active: true,
  });

  async function handleSubmit() {
    try {
      await createMutation.mutateAsync({
        ...formData,
        service_id: Number(formData.service_id),
      });

      await refetch();

      setOpen(false);

      setFormData({
        service_id: "",
        title: "",
        description: "",
        is_active: true,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Service Forms
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage dynamic service forms
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button>
              Create Form
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Create Service Form
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Service
                </Label>

                <Select
                  value={formData.service_id}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      service_id: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>

                  <SelectContent>
                    {services.map((service: any) => (
                      <SelectItem
                        key={service.id}
                        value={String(service.id)}
                      >
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Title
                </Label>

                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Description
                </Label>

                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
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

      <Card>
        <CardHeader>
          <CardTitle>
            Forms List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
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
                ) : forms.length > 0 ? (
                  forms.map((form: any) => (
                    <TableRow key={form.id}>
                      <TableCell>
                        {form.id}
                      </TableCell>

                      <TableCell>
                        {form.service?.name || form.service_name || form.service_id}
                      </TableCell>

                      <TableCell>
                        {form.title}
                      </TableCell>

                      <TableCell>
                        {form.description || "-"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={form.is_active ? "default" : "destructive"}
                        >
                          {form.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center"
                    >
                      No forms found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
