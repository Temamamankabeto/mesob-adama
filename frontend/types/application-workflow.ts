export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type Paginated<T> = {
  data?: T[];
  items?: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

export type ServiceForm = {
  id: number;
  service_id: number;
  title: string;
  description?: string | null;
  is_active?: boolean;
  service?: {
    id: number;
    name: string;
  };
  fields?: ServiceFormField[];
  sections?: ServiceFormSection[];
  steps?: ServiceFormStep[];
};

export type ServiceFormSection = {
  id: number;
  service_form_id: number;
  service_form_step_id?: number | null;
  title: string;
  description?: string | null;
  sort_order: number;
  is_active?: boolean;
  form?: ServiceForm;
};

export type ServiceFormStep = {
  id: number;
  service_form_id: number;
  title: string;
  description?: string | null;
  step_order: number;
  sort_order?: number;
  is_active?: boolean;
};

export type FieldType =
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

export type ServiceFormField = {
  id: number;
  service_form_id: number;
  service_form_section_id?: number | null;
  section_id?: number | null;
  service_form_step_id?: number | null;
  label: string;
  description?: string | null;
  name: string;
  type: FieldType;
  placeholder?: string | null;
  help_text?: string | null;
  default_value?: string | null;
  options?: string[] | null;
  validation_rules?: string[] | string | null;
  is_required?: boolean;
  is_active?: boolean;
  sort_order: number;
  width?: "full" | "half" | "third" | "quarter" | string;
  conditions?: ServiceFormFieldCondition[];
  section?: ServiceFormSection;
};

export type ServiceFormFieldCondition = {
  id: number;
  field_id: number;
  depends_on_field_id: number;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | string;
  expected_value: string;
  action?: "show" | "hide" | "require" | string;
  field?: ServiceFormField;
  depends_on_field?: ServiceFormField;
};

export type ServiceApplicationData = {
  id: number;
  application_id: number;
  field_name: string;
  field_value?: string | null;
};

export type ServiceApplicationFile = {
  id: number;
  application_id: number;
  field_name: string;
  original_name: string;
  stored_name?: string;
  path: string;
  mime_type?: string | null;
  size?: number;
  uploaded_by?: number | null;
  verification_status?: string;
};

export type ServiceApplicationWorkflow = {
  id: number;
  application_id: number;
  window_id?: number | null;
  officer_id?: number | null;
  status: string;
  remark?: string | null;
  comment?: string | null;
  acted_at?: string | null;
  window?: {
    id: number;
    name: string;
  };
  officer?: {
    id: number;
    name: string;
  };
};

export type ServiceApplicationHistory = {
  id: number;
  application_id: number;
  from_status?: string | null;
  to_status: string;
  action: string;
  remark?: string | null;
  actor_id?: number | null;
  created_at?: string;
  actor?: {
    id: number;
    name: string;
  };
};

export type ServiceApplication = {
  id: number;
  tracking_number: string;
  service_id: number;
  customer_id: number;
  status: string;
  current_stage?: string | null;
  current_window_id?: number | null;
  current_officer_id?: number | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  completed_at?: string | null;
  rejection_reason?: string | null;
  returned_count?: number;
  service?: {
    id: number;
    name: string;
    service_fee?: number;
  };
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  data?: ServiceApplicationData[];
  files?: ServiceApplicationFile[];
  workflow?: ServiceApplicationWorkflow[];
  histories?: ServiceApplicationHistory[];
};

export type Application = {
  id: number;
  application_number: string;
  customer_id: number;
  service_id: number;
  status: string;
  assigned_to?: number | null;
  submitted_at?: string | null;
  completed_at?: string | null;
  remarks?: string | null;
  service?: {
    id: number;
    name: string;
  };
  customer?: {
    id: number;
    name: string;
  };
};

export type ApplicationSummary = {
  total: number;
  submitted: number;
  under_review?: number;
  approved: number;
  rejected: number;
  completed: number;
  returned?: number;
};

export type BuilderData = {
  form: ServiceForm | null;
  steps: ServiceFormStep[];
  sections: ServiceFormSection[];
  fields: ServiceFormField[];
  conditions: ServiceFormFieldCondition[];
};
