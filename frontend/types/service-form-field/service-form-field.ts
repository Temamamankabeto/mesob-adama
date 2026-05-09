export interface ServiceFormField {
  id: number;
  service_form_id: number;
  label: string;
  name: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "tel"
    | "date"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "image";

  options?: string[];
  placeholder?: string;
  validation_rules?: string;
  is_required: boolean;
  sort_order: number;
  width: string;
}

export interface CreateServiceFormFieldPayload {
  service_form_id: number;
  label: string;
  name: string;
  type: string;
  options?: string[];
  placeholder?: string;
  validation_rules?: string;
  is_required?: boolean;
  sort_order?: number;
  width?: string;
}