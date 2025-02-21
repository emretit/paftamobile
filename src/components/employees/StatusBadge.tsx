
type EmployeeStatus = 'active' | 'inactive';

interface StatusBadgeProps {
  status: EmployeeStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
