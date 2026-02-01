"use client";

import { cn } from "@/shared/utils/cn";
import { FormFieldConfig, FormData } from "./types";
import { FormField } from "./FormField";

interface FormRowProps {
  fields: FormFieldConfig[];
  formData: FormData;
  onChange: (name: string, value: string | string[]) => void;
  errors: Record<string, string>;
}

export function FormRow({ fields, formData, onChange, errors }: FormRowProps) {
  // Grid columns based on number of fields
  const gridCols: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
  };

  return (
    <div className={cn("grid gap-4", gridCols[fields.length] || "grid-cols-1")}>
      {fields.map((field) => (
        <div key={field.name} className="space-y-1">
          {/* Label */}
          <label className="block text-sm font-medium text-gray-700 text-right">
            {field.label}
            {field.required && <span className="text-red-500 mr-1">*</span>}
          </label>

          {/* Field */}
          <FormField
            config={field}
            value={formData[field.name]}
            onChange={(value) => onChange(field.name, value)}
            error={errors[field.name]}
          />
        </div>
      ))}
    </div>
  );
}
