"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Field {
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  options?: string[];
}

interface Props {
  field: Field;
  value: any;
  onChange: (name: string, value: any) => void;
}

export default function DynamicFieldRenderer({
  field,
  value,
  onChange,
}: Props) {
  switch (field.type) {
    case "select":
      return (
        <div className="space-y-2">
          <Label>{field.label}</Label>

          <Select
            value={value || ""}
            onValueChange={(val) =>
              onChange(field.name, val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>

            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem
                  key={option}
                  value={option}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "file":
    case "image":
      return (
        <div className="space-y-2">
          <Label>{field.label}</Label>

          <Input
            type="file"
            accept={
              field.type === "image"
                ? "image/*"
                : undefined
            }
            onChange={(e) =>
              onChange(
                field.name,
                e.target.files?.[0] || null
              )
            }
          />
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label>{field.label}</Label>

          <Input
            type={field.type}
            value={value || ""}
            placeholder={field.placeholder || ""}
            onChange={(e) =>
              onChange(
                field.name,
                e.target.value
              )
            }
          />
        </div>
      );
  }
}