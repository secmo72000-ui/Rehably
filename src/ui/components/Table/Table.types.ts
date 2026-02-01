import { ReactNode } from 'react';

/**
 * Column definition for the Table
 * @template T - The type of data in each row
 */
export interface TableColumn<T> {
  /** Unique key for the column - should match a property in T */
  key: keyof T | string;
  /** Header text to display */
  header: string;
  /** Custom render function for cell content */
  render?: (value: T[keyof T], row: T, rowIndex: number) => ReactNode;
  /** Column width (optional) */
  width?: string;
  /** Text alignment */
  align?: 'start' | 'center' | 'end';
}

/**
 * Pagination configuration
 */
export interface TablePagination {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
}

/**
 * Sorting configuration for the Table
 * Note: Table only renders the button and calls onToggle.
 * Actual sorting logic is handled by the parent component.
 */
export interface TableSorting {
  /** Whether sorting is currently active */
  active: boolean;
  /** Current sort direction */
  direction: 'asc' | 'desc';
  /** Callback when sort button is clicked */
  onToggle: () => void;
}

/**
 * Main Table Props
 * @template T - The type of data in each row
 */
export interface TableProps<T> {
  /** Array of data to display */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Unique key for each row */
  rowKey: keyof T;

  // Header Section (Optional)
  /** Table title */
  title?: string;
  /** Action element (button, icon, etc.) to display in header */
  headerAction?: ReactNode;

  // Footer Section (Optional)
  /** Custom footer content */
  footerContent?: ReactNode;

  // Pagination (Optional)
  /** Pagination configuration */
  pagination?: TablePagination;

  // Sorting (Optional)
  /** Sorting configuration - Table only renders button, logic handled externally */
  sorting?: TableSorting;

  // Row interactions (Optional)
  /** Callback when row is clicked */
  onRowClick?: (row: T) => void;
  /** Custom actions column content */
  rowActions?: (row: T, rowIndex: number) => ReactNode;
  /** Header text for actions column */
  actionsHeader?: string;

  // Styling (Optional)
  /** Additional CSS class for the table */
  className?: string;
  /** Show loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}
