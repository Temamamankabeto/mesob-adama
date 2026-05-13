"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

import { FieldType } from "@/types/application-workflow";
import { cn } from "@/lib/utils";

const fieldTypes: Array<{ type: FieldType; label: string }> = [
  { type: "text", label: "Text" },
  { type: "textarea", label: "Textarea" },
  { type: "number", label: "Number" },
  { type: "email", label: "Email" },
  { type: "tel", label: "Phone" },
  { type: "date", label: "Date" },
  { type: "select", label: "Select" },
  { type: "radio", label: "Radio" },
  { type: "checkbox", label: "Checkbox" },
  { type: "file", label: "File" },
  { type: "image", label: "Image" },
];

function PaletteItem({ type, label }: { type: FieldType; label: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { type },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl border bg-background px-3 py-2 text-left text-sm transition hover:bg-muted",
        isDragging && "opacity-60"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {label}
    </button>
  );
}

export default function FieldPalette() {
  return (
    <div className="space-y-2">
      {fieldTypes.map((item) => (
        <PaletteItem key={item.type} {...item} />
      ))}
    </div>
  );
}
