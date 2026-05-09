"use client";

import { useState } from "react";

import FieldPalette from "@/components/form-builder/FieldPalette";

import SortableFieldCard from "@/components/form-builder/SortableFieldCard";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function FormBuilderPage() {

  const [fields, setFields] =
    useState<any[]>([]);

  /*
  |--------------------------------------------------------------------------
  | ADD FIELD
  |--------------------------------------------------------------------------
  */

  const addField = (
    type: string
  ) => {

    setFields([
      ...fields,
      {
        id: Date.now(),
        label: "New Field",
        name: `field_${Date.now()}`,
        type,
        is_required: false,
        width: "half",
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE FIELD
  |--------------------------------------------------------------------------
  */

  const deleteField = (
    id: number
  ) => {

    setFields(
      fields.filter(
        (field) =>
          field.id !== id
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE FIELD
  |--------------------------------------------------------------------------
  */

  const updateField = (
    id: number,
    key: string,
    value: any
  ) => {

    setFields(
      fields.map((field) =>
        field.id === id
          ? {
              ...field,
              [key]: value,
            }
          : field
      )
    );
  };

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-black">
          Form Builder
        </h1>

        <p className="text-muted-foreground">
          Create dynamic service forms.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

        {/* LEFT */}
        <Card className="rounded-3xl">

          <CardContent className="p-5">

            <FieldPalette
              onAdd={addField}
            />

          </CardContent>
        </Card>

        {/* RIGHT */}
        <div className="space-y-4">

          {fields.map((field) => (

            <SortableFieldCard
              key={field.id}
              field={field}
              onDelete={() =>
                deleteField(field.id)
              }
              onChange={(key, value) =>
                updateField(
                  field.id,
                  key,
                  value
                )
              }
            />
          ))}

          <Button className="rounded-2xl">

            Save Form

          </Button>
        </div>
      </div>
    </div>
  );
}