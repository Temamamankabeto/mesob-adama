"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  useApplicationForm,
  useApplyService,
} from "@/hooks/application/use-application";

import DynamicFieldRenderer from "@/components/application/DynamicFieldRenderer";
import { ServiceFormField, ServiceFormSection, ServiceFormStep } from "@/types/application-workflow";

function getSectionId(field: ServiceFormField) {
  return field.section_id ?? field.service_form_section_id ?? 0;
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = Number(params.id);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const { data, isLoading } = useApplicationForm(serviceId);
  const applyMutation = useApplyService(serviceId);

  const form = data?.data;
  const fields: ServiceFormField[] = form?.fields || [];
  const sections: ServiceFormSection[] = form?.sections || [];
  const steps: ServiceFormStep[] = form?.steps || [];

  const groupedSteps = useMemo(() => {
    if (steps.length) {
      return steps
        .slice()
        .sort((a, b) => Number(a.step_order || a.sort_order || 0) - Number(b.step_order || b.sort_order || 0))
        .map((step) => {
          const stepSections = sections.filter((section) => section.service_form_step_id === step.id);
          const sectionIds = new Set(stepSections.map((section) => section.id));

          return {
            title: step.title,
            sections: stepSections.length ? stepSections : sections,
            fields: fields.filter((field) => !sectionIds.size || sectionIds.has(getSectionId(field))),
          };
        });
    }

    if (sections.length) {
      return sections
        .slice()
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
        .map((section) => ({
          title: section.title,
          sections: [section],
          fields: fields.filter((field) => getSectionId(field) === section.id),
        }));
    }

    return [
      {
        title: "Application Information",
        sections: [],
        fields,
      },
    ];
  }, [fields, sections, steps]);

  const current = groupedSteps[currentStep];
  const progress = groupedSteps.length > 0 ? ((currentStep + 1) / groupedSteps.length) * 100 : 0;

  function handleChange(name: string, value: any) {
    if (value instanceof File) {
      setFiles((currentFiles) => ({ ...currentFiles, [name]: value }));
      return;
    }

    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function validateCurrentStep() {
    const missing = current?.fields?.find((field) => {
      if (!field.is_required) return false;
      if (["file", "image"].includes(field.type)) return !files[field.name];

      return formValues[field.name] === undefined || formValues[field.name] === null || formValues[field.name] === "";
    });

    if (missing) {
      toast.error(`${missing.label} is required`);
      return false;
    }

    return true;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    if (currentStep < groupedSteps.length - 1) setCurrentStep((step) => step + 1);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    try {
      const response = await applyMutation.mutateAsync({
        values: formValues,
        files,
      });

      const trackingNumber = response?.data?.tracking_number;

      toast.success("Application submitted successfully");

      router.push(trackingNumber ? `/track-application?tracking=${trackingNumber}` : "/my-applications");
    } catch (error: any) {
      toast.error(error?.message || "Submission failed");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card className="rounded-3xl">
          <CardContent className="p-8 text-center text-muted-foreground">No active form found for this service.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl p-6">
        <Card className="rounded-3xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-3xl">{form.title || "Apply for Service"}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {form.description || "Complete the application form."}
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {groupedSteps.length || 1}
              </div>
            </div>

            <Progress value={progress} />
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="space-y-8">
              <div className="rounded-2xl border bg-muted/20 p-6">
                <h2 className="mb-6 text-xl font-semibold">{current?.title || "Application Form"}</h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {(current?.fields || [])
                    .slice()
                    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
                    .map((field) => (
                      <div
                        key={field.id}
                        className={field.width === "full" || !field.width ? "md:col-span-2" : ""}
                      >
                        <DynamicFieldRenderer
                          field={field}
                          value={formValues[field.name]}
                          values={formValues}
                          onChange={handleChange}
                        />
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                  disabled={currentStep === 0}
                  className="rounded-2xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep < groupedSteps.length - 1 ? (
                  <Button type="button" onClick={nextStep} className="rounded-2xl">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={applyMutation.isPending} className="rounded-2xl">
                    {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
