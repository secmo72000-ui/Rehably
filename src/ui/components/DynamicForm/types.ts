import { ReactNode } from "react";

// Field Types
export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "password"
  | "textarea"
  | "select"
  | "multiselect"
  | "radio"
  | "date";

// Option for Select/Radio fields
export interface FieldOption {
  value: string;
  label: string;
  color?: "green" | "red" | "yellow" | "blue" | "gray";
}

// Single Field Configuration
export interface FormFieldConfig {
  /** Field name - used as key in form data */
  name: string;
  /** Display label */
  label: string;
  /** Field type */
  type: FieldType;
  /** Placeholder text */
  placeholder?: string;
  /** Is field required */
  required?: boolean;
  /** Options for select/radio fields */
  options?: FieldOption[];
  /** Validation rules */
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
  };
  /** Default value */
  defaultValue?: string | number | string[];
}

// Row Configuration (1, 2, or 3 fields per row)
export interface FormRowConfig {
  /** Fields in this row (1-3) */
  fields: FormFieldConfig[];
}

// Complete Form Configuration
export interface DynamicFormConfig {
  /** Form rows */
  rows: FormRowConfig[];
  /** Submit button text */
  submitLabel: string;
  /** Custom content to render after fields but before submit */
  customContent?: ReactNode;
}

// Form Data - generic object with field values
export type FormData = Record<string, string | number | string[] | undefined>;
