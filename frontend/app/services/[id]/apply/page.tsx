"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { useState } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  useApplicationForm,
  useApplyService,
} from "@/hooks/application/use-application";

import DynamicFieldRenderer from "@/components/application/DynamicFieldRenderer";

export default function ApplyPage() {

  const params = useParams();

  const router = useRouter();

  const serviceId = Number(
    params.id
  );

  const [formValues, setFormValues] =
    useState<any>({});

  const [files, setFiles] =
    useState<any>({});

  const {
    data,
    isLoading,
  } = useApplicationForm(
    serviceId
  );

  const applyMutation =
    useApplyService(serviceId);

  const form = data?.data;

  /*
  |--------------------------------------------------------------------------
  | HANDLE CHANGE
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      const payload =
        new FormData();

      /*
      |--------------------------------------------------------------------------
      | FORM VALUES
      |--------------------------------------------------------------------------
      */

      Object.keys(formValues).forEach(
        (key) => {

          payload.append(
            `data[${key}]`,
            formValues[key]
          );
        }
      );

      /*
      |--------------------------------------------------------------------------
      | FILES
      |--------------------------------------------------------------------------
      */

      Object.keys(files).forEach(
        (key) => {

          payload.append(
            `files[${key}]`,
            files[key]
          );
        }
      );

      const response =
        await applyMutation.mutateAsync(
          payload
        );

      router.push(
        `/track-application?tracking=${response.data.tracking_number}`
      );

    } catch (error) {

      console.error(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (isLoading) {

    return (

      <div className="flex min-h-screen items-center justify-center">

        Loading...

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NO FORM
  |--------------------------------------------------------------------------
  */

  if (!form) {

    return (

      <div className="flex min-h-screen items-center justify-center">

        No form found

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">

      <div className="container mx-auto max-w-5xl px-4">

        <Card className="rounded-3xl border-border shadow-sm">

          <CardContent className="p-8">

            {/* HEADER */}
            <div className="mb-8">

              <h1 className="text-3xl font-black">

                {form.title}

              </h1>

              <p className="mt-2 text-muted-foreground">

                {form.description}

              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="grid gap-6 md:grid-cols-2"
            >

              {form.fields?.map(
                (field: any) => (

                  <div
                    key={field.id}
                    className={
                      field.width ===
                      "full"
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

              {/* SUBMIT */}
              <div className="md:col-span-2">

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl"
                  disabled={
                    applyMutation.isPending
                  }
                >

                  {applyMutation.isPending
                    ? "Submitting..."
                    : "Submit Application"}

                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}