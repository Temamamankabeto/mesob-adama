"use client";

import { useMemo, useState } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { ArrowLeft, ArrowRight } from "lucide-react";

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

export default function ApplyPage() {

  const params = useParams();

  const router = useRouter();

  const serviceId = Number(params.id);

  const [formValues, setFormValues] =
    useState<any>({});

  const [files, setFiles] =
    useState<any>({});

  const [currentStep, setCurrentStep] =
    useState(0);

  const {
    data,
    isLoading,
  } = useApplicationForm(serviceId);

  const applyMutation =
    useApplyService(serviceId);

  const form = data?.data;

  const fields =
    form?.fields || [];

  const steps = useMemo(() => {

    if (!fields.length) return [];

    const grouped: Record<string, any[]> = {};

    fields.forEach((field: any) => {

      const key =
        field.section ||
        "Application Information";

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(field);
    });

    return Object.entries(grouped);
  }, [fields]);

  const currentFields =
    steps[currentStep]?.[1] || [];

  const progress =
    steps.length > 0
      ? ((currentStep + 1) / steps.length) * 100
      : 0;

  const handleChange = (
    name: string,
    value: any
  ) => {

    if (value instanceof File) {

      setFiles({
        ...files,
        [name]: value,
      });

      return;
    }

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const nextStep = () => {

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      const payload =
        new FormData();

      Object.keys(formValues).forEach(
        (key) => {
          payload.append(
            key,
            formValues[key]
          );
        }
      );

      Object.keys(files).forEach(
        (key) => {
          payload.append(
            key,
            files[key]
          );
        }
      );

      await applyMutation.mutateAsync(
        payload
      );

      router.push(
        "/my-applications"
      );

    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">

      <div className="mx-auto max-w-5xl p-6">

        <Card className="rounded-3xl">

          <CardHeader className="space-y-4">

            <div className="flex items-center justify-between">

              <div>
                <CardTitle className="text-3xl">
                  Apply for Service
                </CardTitle>

                <p className="mt-2 text-sm text-muted-foreground">
                  Complete the dynamic enterprise application form.
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length || 1}
              </div>
            </div>

            <Progress value={progress} />
          </CardHeader>

          <CardContent>

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >

              <div className="rounded-2xl border bg-muted/20 p-6">

                <h2 className="mb-6 text-xl font-semibold">
                  {steps[currentStep]?.[0] ||
                    "Application Form"}
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  {currentFields.map(
                    (field: any) => (

                      <div
                        key={field.id}
                        className={
                          field.width === "full"
                            ? "md:col-span-2"
                            : ""
                        }
                      >
                        <DynamicFieldRenderer
                          field={field}
                          value={
                            formValues[
                              field.name
                            ]
                          }
                          onChange={
                            handleChange
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">

                <Button
                  type="button"
                  variant="outline"
                  onClick={previousStep}
                  disabled={currentStep === 0}
                  className="rounded-2xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep <
                steps.length - 1 ? (

                  <Button
                    type="button"
                    onClick={nextStep}
                    className="rounded-2xl"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                ) : (

                  <Button
                    type="submit"
                    disabled={
                      applyMutation.isPending
                    }
                    className="rounded-2xl"
                  >
                    {applyMutation.isPending
                      ? "Submitting..."
                      : "Submit Application"}
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
