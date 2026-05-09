"use client";

import { Button } from "@/components/ui/button";

const FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "email",
  "tel",
  "date",
  "select",
  "radio",
  "checkbox",
  "file",
  "image",
];

interface Props {
  onAdd: (type: string) => void;
}

export default function FieldPalette({
  onAdd,
}: Props) {

  return (
    <div className="space-y-3">

      <h2 className="text-lg font-bold">
        Field Types
      </h2>

      {FIELD_TYPES.map((type) => (

        <Button
          key={type}
          variant="outline"
          className="w-full justify-start rounded-2xl"
          onClick={() => onAdd(type)}
        >
          {type}
        </Button>
      ))}
    </div>
  );
}