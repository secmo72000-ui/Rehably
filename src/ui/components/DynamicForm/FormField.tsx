"use client";

import { Textarea, RadioGroup, GeneralInput, MultiSelectInput } from "@/ui/primitives";
import { FormFieldConfig } from "./types";

interface FormFieldProps {
  config: FormFieldConfig;
  value: string | number | string[] | undefined;
  onChange: (value: string | string[]) => void;
  error?: string;
}

export function FormField({ config, value, onChange, error }: FormFieldProps) {
  const { type, label, placeholder, options, required } = config;

  // Common props
  const commonProps = {
    placeholder: placeholder || label,
    error,
  };

  switch (type) {
    case "text":
    case "email":
    case "tel":
    case "number":
    case "password":
    case "date":
      return (
        <GeneralInput
          type="text"
          htmlType={type}
          value={value?.toString() || ""}
          onChange={onChange as (value: string) => void}
          {...commonProps}
        />
      );

    case "textarea":
      return (
        <Textarea
          value={value?.toString() || ""}
          onChange={onChange as (value: string) => void}
          rows={3}
          isRtl={true}
          {...commonProps}
        />
      );

    case "select":
      return (
        <GeneralInput
          type="select"
          value={value?.toString() || ""}
          onChange={onChange as (value: string) => void}
          options={options?.map(opt => ({
            value: opt.value,
            label: opt.label
          })) || []}
          {...commonProps}
        />
      );

    case "multiselect":
      return (
        <MultiSelectInput
          value={Array.isArray(value) ? value : []}
          onChange={onChange as (value: string[]) => void}
          options={options?.map(opt => ({
            value: opt.value,
            label: opt.label
          })) || []}
          label={label}
          {...commonProps}
        />
      );

    case "radio":
      return (
        <RadioGroup
          value={value?.toString() || ""}
          onChange={onChange as (value: string) => void}
          options={options || []}
          direction="horizontal"
          error={error}
          isRtl={true}
        />
      );

    default:
      return null;
  }
}
