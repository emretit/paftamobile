
import { StatusBadge as GenericStatusBadge } from "@/components/ui/status-badge";

type EmployeeStatus = 'active' | 'inactive';

interface StatusBadgeProps {
  status: EmployeeStatus | string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Normalize status value to ensure it's one of our expected values
  let normalizedStatus: EmployeeStatus = 'inactive';
  
  if (typeof status === 'string') {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'active' || lowerStatus === 'aktif' || lowerStatus === 'izinli') {
      normalizedStatus = 'active';
    }
  }
  
  const variant = normalizedStatus === 'active' ? 'success' : 'neutral';
  const label = normalizedStatus === 'active' ? 'Active' : 'Inactive';

  return (
    <GenericStatusBadge
      label={label}
      variant={variant}
      size="sm"
    />
  );
};
