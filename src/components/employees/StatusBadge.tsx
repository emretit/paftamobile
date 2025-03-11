
import { StatusBadge as GenericStatusBadge } from "@/components/ui/status-badge";
import type { EmployeeStatus } from "@/types/employee";

interface StatusBadgeProps {
  status: EmployeeStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variant = status === 'aktif' ? 'success' : 'neutral';
  const label = status === 'aktif' ? 'Aktif' : 'Pasif';

  return (
    <GenericStatusBadge
      label={label}
      variant={variant}
      size="sm"
    />
  );
};
