
import { useState } from "react";
import { Employee } from "@/types/employee";
import { EmployeeDetailsHeader } from "./EmployeeDetailsHeader";
import { EmployeeDetailTabs } from "./EmployeeDetailTabs";
import { EditableEmployeeDetails } from "./form/EditableEmployeeDetails";

interface EmployeeDetailsViewProps {
  employee: Employee;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (value: string) => void;
  refetch: () => Promise<void>;
}

export const EmployeeDetailsView = ({
  employee,
  isLoading,
  activeTab,
  setActiveTab,
  refetch
}: EmployeeDetailsViewProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Handle possible status difference between employee types
  const normalizedEmployee: Employee = {
    ...employee,
    // Ensure status is valid for both types
    status: employee.status === 'active' ? 'aktif' : employee.status === 'inactive' ? 'pasif' : employee.status,
  };

  if (isEditing) {
    return (
      <EditableEmployeeDetails 
        employee={normalizedEmployee}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => {
          setIsEditing(false);
          refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <EmployeeDetailsHeader 
        employee={normalizedEmployee} 
        onEdit={() => setIsEditing(true)}
      />
      <EmployeeDetailTabs
        employee={normalizedEmployee}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        refetch={refetch}
      />
    </div>
  );
};
