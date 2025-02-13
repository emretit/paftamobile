
export type EmployeeStatus = 'aktif' | 'pasif' | 'izinli' | 'ayrıldı';

interface StatusBadgeProps {
  status: EmployeeStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    aktif: 'bg-green-100 text-green-800',
    pasif: 'bg-gray-100 text-gray-800',
    izinli: 'bg-yellow-100 text-yellow-800',
    ayrıldı: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
