"use client";

import { useState, useCallback, FormEvent } from "react";
import { Button } from "@/ui/primitives";
import { DynamicFormConfig, FormData, FormFieldConfig } from "./types";
import { FormRow } from "./FormRow";

interface DynamicFormProps {
  /** Form configuration */
  config: DynamicFormConfig;
  /** Submit handler - receives form data */
  onSubmit: (data: FormData) => void | Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Initial/default values */
  defaultValues?: FormData;
  /** Called when form is cancelled/closed */
  onCancel?: () => void;
}

// Extract all fields from config
function getAllFields(config: DynamicFormConfig): FormFieldConfig[] {
  return config.rows.flatMap((row) => row.fields);
}

// Build initial form data from config
function buildInitialData(
  config: DynamicFormConfig,
  defaultValues?: FormData
): FormData {
  const fields = getAllFields(config);
  const data: FormData = {};

  fields.forEach((field) => {
    const defaultVal = field.type === "multiselect" ? [] : "";
    data[field.name] =
      defaultValues?.[field.name] ?? field.defaultValue ?? defaultVal;
  });

  return data;
}

// Validate a single field
function validateField(
  field: FormFieldConfig,
  value: string | number | string[] | undefined
): string | null {
  // Handle multiselect (array) values
  if (Array.isArray(value)) {
    if (field.required && value.length === 0) {
      return `${field.label} مطلوب`;
    }
    // Multiselect fields are valid if they have at least one item (when required)
    return null;
  }

  const strValue = value?.toString() || "";

  // Required check
  if (field.required && !strValue.trim()) {
    return `${field.label} مطلوب`;
  }

  // Validation rules
  if (field.validation && strValue) {
    const { min, max, minLength, maxLength, pattern, patternMessage } =
      field.validation;

    if (minLength && strValue.length < minLength) {
      return `${field.label} يجب أن يكون على الأقل ${minLength} حرف`;
    }

    if (maxLength && strValue.length > maxLength) {
      return `${field.label} يجب ألا يتجاوز ${maxLength} حرف`;
    }

    if (field.type === "number") {
      const numValue = Number(strValue);
      if (min !== undefined && numValue < min) {
        return `${field.label} يجب أن يكون على الأقل ${min}`;
      }
      if (max !== undefined && numValue > max) {
        return `${field.label} يجب ألا يتجاوز ${max}`;
      }
    }

    if (pattern && !new RegExp(pattern).test(strValue)) {
      return patternMessage || `${field.label} غير صالح`;
    }
  }

  // Email validation
  if (field.type === "email" && strValue) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(strValue)) {
      return "البريد الإلكتروني غير صالح";
    }
  }

  // Phone validation (Egyptian format)
  if (field.type === "tel" && strValue) {
    const phoneRegex = /^(01)[0-9]{9}$/;
    if (!phoneRegex.test(strValue.replace(/\s/g, ""))) {
      return "رقم الهاتف غير صالح";
    }
  }

  return null;
}

// Validate all fields
function validateForm(
  config: DynamicFormConfig,
  formData: FormData
): Record<string, string> {
  const errors: Record<string, string> = {};
  const fields = getAllFields(config);

  fields.forEach((field) => {
    const error = validateField(field, formData[field.name]);
    if (error) {
      errors[field.name] = error;
    }
  });

  return errors;
}

export function DynamicForm({
  config,
  onSubmit,
  isLoading = false,
  defaultValues,
  onCancel,
}: DynamicFormProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>(() =>
    buildInitialData(config, defaultValues)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle field change
  const handleChange = useCallback((name: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field changes
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    // Mark as touched
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // Handle form submit
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const validationErrors = validateForm(config, formData);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // Mark all fields as touched
        const allTouched: Record<string, boolean> = {};
        getAllFields(config).forEach((field) => {
          allTouched[field.name] = true;
        });
        setTouched(allTouched);
        return;
      }

      // Submit
      await onSubmit(formData);
    },
    [config, formData, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Form Rows */}
      {config.rows.map((row, index) => (
        <FormRow
          key={index}
          fields={row.fields}
          formData={formData}
          onChange={handleChange}
          errors={errors}
        />
      ))}

      {/* Custom Content */}
      {config.customContent}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          {config.submitLabel}
        </Button>
      </div>
    </form>
  );
}
