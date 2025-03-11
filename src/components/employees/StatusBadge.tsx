
import { StatusBadge as GenericStatusBadge } from "@/components/ui/status-badge";

type EmployeeStatus = 'active' | 'inactive';

interface StatusBadgeProps {
  status: EmployeeStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Ensure status is always one of the expected values
  const normalizedStatus = status === 'active' ? 'active' : 'inactive';
  
  const variant = normalizedStatus === 'active' ? 'success' : 'neutral';
  const label = normalizedStatus === 'active' ? 'Aktif' : 'Pasif';

  return (
    <GenericStatusBadge
      label={label}
      variant={variant}
      size="sm"
    />
  );
};
