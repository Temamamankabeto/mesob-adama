"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SectionForm({
  formData,
  setFormData,
  onSubmit,
  loading,
}: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Service Form ID</Label>

        <Input
          value={formData.service_form_id}
          onChange={(e) =>
            setFormData({
              ...formData,
              service_form_id: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Title</Label>

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
        <Label>Description</Label>

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

      <div className="space-y-2">
        <Label>Sort Order</Label>

        <Input
          type="number"
          value={formData.sort_order}
          onChange={(e) =>
            setFormData({
              ...formData,
              sort_order: e.target.value,
            })
          }
        />
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Section"}
      </Button>
    </div>
  );
}
