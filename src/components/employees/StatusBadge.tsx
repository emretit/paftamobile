
import { StatusBadge as GenericStatusBadge } from "@/components/ui/status-badge";

type EmployeeStatus = 'active' | 'inactive';

interface StatusBadgeProps {
  status: EmployeeStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variant = status === 'active' ? 'success' : 'neutral';
  const label = status === 'active' ? 'Aktif' : 'Pasif';

  return (
    <GenericStatusBadge
      label={label}
      variant={variant}
      size="sm"
    />
  );
};
