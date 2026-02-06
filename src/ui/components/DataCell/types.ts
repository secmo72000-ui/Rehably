import { ReactNode } from "react";

export type DataCellVariant = 
  | 'text' 
  | 'text-with-badge' 
  | 'selector' 
  | 'checkbox' 
  | 'custom';

export type BadgeColor = 'blue' | 'green' | 'gray' | 'red' | 'yellow';

export interface DataCellProps {
  /** The type of cell to render */
  variant: DataCellVariant;
  
  /** Primary text content */
  value?: string | number;
  
  /** Content to display next to text in 'text-with-badge' variant */
  badge?: ReactNode;
  
  /** Color theme for the badge if using a preset badge component */
  badgeColor?: BadgeColor;
  
  /** Options for 'selector' variant */
  options?: { value: string; label: string }[];
  
  /** Callback for value changes (selector, checkbox) */
  onChange?: (value: any) => void;
  
  /** Checked state for checkbox variant */
  checked?: boolean;
  
  /** Custom content for 'custom' variant */
  content?: ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Optional label/title for accessibility or mobile view */
  label?: string;

  /** Placeholder for selector inputs */
  placeholder?: string;
}

export interface DataRowProps {
  /** Array of cell configurations */
  cells: DataCellProps[];
  
  /** Number of columns to display in this row (default: based on cells length or 1) */
  columns?: number;
  
  /** Custom gap size between columns (default: gap-4) */
  gap?: string;
  
  /** Additional CSS classes for the row container */
  className?: string;
}
