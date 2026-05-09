"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  Building2,
  FileText,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { Separator } from "@/components/ui/separator";

export default function ApplyConstructionPermitPage() {

  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | AUTH USER
  |--------------------------------------------------------------------------
  */

  const [user, setUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    /*
    |--------------------------------------------------------------------------
    | REDIRECT TO LOGIN
    |--------------------------------------------------------------------------
    */

    if (!token) {

      router.push("/login");

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | GET LOGGED USER
    |--------------------------------------------------------------------------
    */

    const fetchUser = async () => {

      try {

        const response =
          await fetch(
            "http://127.0.0.1:8000/api/user",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

        const data =
          await response.json();

        setUser(data);

      } catch (error) {

        console.error(error);

        router.push("/login");

      } finally {

        setLoading(false);
      }
    };

    fetchUser();

  }, [router]);

  /*
  |--------------------------------------------------------------------------
  | APPLICATION FORM
  |--------------------------------------------------------------------------
  */

  const [formData, setFormData] =
    useState({
      construction_type: "",
      project_location: "",
      estimated_budget: "",
      project_description: "",
      blueprint_file: null as File | null,
    });

  const handleChange = (
    key: string,
    value: any
  ) => {

    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const body =
        new FormData();

      body.append(
        "construction_type",
        formData.construction_type
      );

      body.append(
        "project_location",
        formData.project_location
      );

      body.append(
        "estimated_budget",
        formData.estimated_budget
      );

      body.append(
        "project_description",
        formData.project_description
      );

      if (
        formData.blueprint_file
      ) {

        body.append(
          "blueprint_file",
          formData.blueprint_file
        );
      }

      const response =
        await fetch(
          "http://127.0.0.1:8000/api/construction-permit/apply",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body,
          }
        );

      const data =
        await response.json();

      console.log(data);

    } catch (error) {

      console.error(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">

      <div className="container mx-auto max-w-7xl px-4 py-10">

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* LEFT */}
          <div>

            <Card className="rounded-3xl">

              <CardContent className="space-y-8 p-8">

                {/* HEADER */}
                <div>

                  <div className="flex items-center gap-3">

                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">

                      <Building2 className="h-6 w-6" />
                    </div>

                    <div>

                      <h1 className="text-3xl font-black">
                        Construction Permit Request
                      </h1>

                      <p className="text-muted-foreground">
                        Submit your construction permit application
                      </p>
                    </div>
                  </div>
                </div>

                {/* USER INFO */}
                <div className="rounded-2xl border bg-muted/40 p-5">

                  <h2 className="text-lg font-bold">
                    Applicant Information
                  </h2>

                  <Separator className="my-4" />

                  <div className="grid gap-4 md:grid-cols-2">

                    <div>

                      <Label>Full Name</Label>

                      <Input
                        value={user?.name || ""}
                        disabled
                      />
                    </div>

                    <div>

                      <Label>Email Address</Label>

                      <Input
                        value={user?.email || ""}
                        disabled
                      />
                    </div>

                    <div>

                      <Label>Phone Number</Label>

                      <Input
                        value={user?.phone || ""}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* FORM */}
                <div className="space-y-5">

                  <div>

                    <Label>
                      Construction Type
                    </Label>

                    <Input
                      placeholder="Residential Building"
                      value={formData.construction_type}
                      onChange={(e) =>
                        handleChange(
                          "construction_type",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>

                    <Label>
                      Project Location
                    </Label>

                    <Input
                      placeholder="Enter project location"
                      value={formData.project_location}
                      onChange={(e) =>
                        handleChange(
                          "project_location",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>

                    <Label>
                      Estimated Budget
                    </Label>

                    <Input
                      placeholder="Enter estimated budget"
                      value={formData.estimated_budget}
                      onChange={(e) =>
                        handleChange(
                          "estimated_budget",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>

                    <Label>
                      Project Description
                    </Label>

                    <Textarea
                      placeholder="Describe the project"
                      value={formData.project_description}
                      onChange={(e) =>
                        handleChange(
                          "project_description",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>

                    <Label>
                      Upload Blueprint
                    </Label>

                    <Input
                      type="file"
                      onChange={(e) =>
                        handleChange(
                          "blueprint_file",
                          e.target.files?.[0]
                        )
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="h-12 w-full rounded-2xl"
                >
                  Submit Application
                </Button>

              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div>

            <Card className="sticky top-24 rounded-3xl">

              <CardContent className="space-y-6 p-6">

                <div className="flex items-center gap-2">

                  <FileText className="h-5 w-5 text-primary" />

                  <h2 className="text-lg font-bold">
                    Criteria PDF
                  </h2>
                </div>

                <a
                  href="/pdf/construction-permit-criteria.pdf"
                  target="_blank"
                  className="block rounded-2xl border p-4 transition hover:bg-muted"
                >

                  <p className="font-semibold">
                    Open Construction Permit PDF
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    View application requirements
                  </p>
                </a>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}