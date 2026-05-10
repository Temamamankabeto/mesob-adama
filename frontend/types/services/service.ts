import {
  ApiResponse,
  PaginatedResponse,
} from "@/types/common";

/*
|--------------------------------------------------------------------------
| BASE TYPES
|--------------------------------------------------------------------------
*/

export type ServiceAvailability =
  | "city"
  | "subcity"
  | "woreda";

export type ServiceStatus =
  | "active"
  | "inactive";

export type ServiceFormFieldType =
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

/*
|--------------------------------------------------------------------------
| SERVICE
|--------------------------------------------------------------------------
*/

export interface Service {

  id: number;

  name: string;

  description?: string | null;

  has_back_officer: boolean;

  service_fee: number;

  availability: ServiceAvailability[];

  status: ServiceStatus;

  created_at: string;

  updated_at: string;
}

export interface ServicePayload {

  name: string;

  description?: string;

  has_back_officer: boolean;

  service_fee: number;

  availability: ServiceAvailability[];

  status: ServiceStatus;
}

export type ServiceListResponse =
  PaginatedResponse<Service>;

/*
|--------------------------------------------------------------------------
| SERVICE WINDOW
|--------------------------------------------------------------------------
*/

export interface ServiceWindowPivot {

  step_order: number;

  is_required: boolean;
}

export interface ServiceWindow {

  id: number;

  name: string;

  pivot: ServiceWindowPivot;
}

export interface AssignWindowPayload {

  windows: {

    window_id: number;

    step_order: number;

    is_required: boolean;

  }[];
}

export interface ServiceWithWindows {

  id: number;

  name: string;

  windows: ServiceWindow[];
}

export type ServiceWithWindowsResponse =
  ApiResponse<ServiceWithWindows>;

/*
|--------------------------------------------------------------------------
| SERVICE FORM
|--------------------------------------------------------------------------
*/

export interface ServiceForm {

  id: number;

  service_id: number;

  title: string;

  description?: string;

  is_active: boolean;

  created_at: string;

  updated_at: string;
}

export interface CreateServiceFormPayload {

  service_id: number;

  title: string;

  description?: string;

  is_active?: boolean;
}

export type ServiceFormResponse =
  PaginatedResponse<ServiceForm>;

export type SingleServiceFormResponse =
  ApiResponse<ServiceForm>;

/*
|--------------------------------------------------------------------------
| SERVICE FORM FIELD
|--------------------------------------------------------------------------
*/

export interface ServiceFormField {

  id: number;

  service_form_id: number;

  label: string;

  name: string;

  type: ServiceFormFieldType;

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

  type: ServiceFormFieldType;

  options?: string[];

  placeholder?: string;

  validation_rules?: string;

  is_required?: boolean;

  sort_order?: number;

  width?: string;
}

/*
|--------------------------------------------------------------------------
| USER SERVICE ASSIGNMENT
|--------------------------------------------------------------------------
*/

export interface UserAssignedService {

  id: number;

  name: string;
}

export interface UserServiceAssignment {

  id: number;

  name: string;

  assigned_services: UserAssignedService[];
}

export interface AssignUserServicePayload {

  service_ids: number[];
}

export type UserServiceAssignmentResponse =
  ApiResponse<UserServiceAssignment>;

/*
|--------------------------------------------------------------------------
| PUBLIC SERVICES
|--------------------------------------------------------------------------
*/

export interface PublicWindow {

  id: number;

  name: string;

  availability: ServiceAvailability[];
}

export interface PublicService {

  id: number;

  name: string;

  description?: string | null;

  service_fee: number;

  availability: ServiceAvailability[];

  has_back_officer: boolean;

  status: ServiceStatus;

  windows?: PublicWindow[];

  created_at: string;

  updated_at: string;
}

export type PublicServiceResponse =
  PaginatedResponse<PublicService>;

export type FeaturedServiceResponse =
  ApiResponse<PublicService[]>;

export type SinglePublicServiceResponse =
  ApiResponse<PublicService>;

/*
|--------------------------------------------------------------------------
| WINDOW GROUP
|--------------------------------------------------------------------------
*/

export interface WindowGroupedService {

  id: number;

  name: string;

  service_fee: number;

  availability: ServiceAvailability[];
}

export interface WindowGroup {

  id: number;

  name: string;

  availability: ServiceAvailability[];

  services: WindowGroupedService[];
}

export type WindowGroupResponse =
  ApiResponse<WindowGroup[]>;