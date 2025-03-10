
import { Skeleton } from "@/components/ui/skeleton";

export const EmployeeDetailsLoading = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
};
