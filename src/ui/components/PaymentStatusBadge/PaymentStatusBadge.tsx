'use client';

type StatusColor = 'success' | 'warning' | 'error' | 'info';

interface StatusConfig {
  label: string;
  color: StatusColor;
}

interface PaymentStatusBadgeProps {
  /** The status value from backend */
  status: string;
  /** Custom mapping for status values to labels and colors */
  config?: Record<string, StatusConfig>;
}

const colorStyles: Record<StatusColor, string> = {
  success: 'bg-confirm-50 text-confirm-600',
  warning: 'bg-warning-50 text-warning-600',
  error: 'bg-error-50 text-error-600',
  info: 'bg-Primary-50 text-Primary-600',
};

// Default config for common payment statuses
const defaultConfig: Record<string, StatusConfig> = {
  paid: { label: 'مدفوع', color: 'success' },
  unpaid: { label: 'غير مدفوع', color: 'warning' },
  suspended: { label: 'موقوف', color: 'error' },
  refunded: { label: 'مسترد', color: 'info' },
};

export function PaymentStatusBadge({ status, config }: PaymentStatusBadgeProps) {
  const statusConfig = config || defaultConfig;
  const currentStatus = statusConfig[status];

  // Fallback if status not found in config
  if (!currentStatus) {
    return (
      <span className="inline-block w-20 px-2 py-2 rounded-lg text-sm-regular bg-grey-100 text-grey-600 text-center">
        {status}
      </span>
    );
  }

  return (
    <span
        className={`inline-block w-20 px-2 py-2 rounded-lg text-sm-regular text-center ${colorStyles[currentStatus.color]}`}
    >
      {currentStatus.label}
    </span>
  );
}

export default PaymentStatusBadge;

