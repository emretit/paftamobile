
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

  if (isEditing) {
    return (
      <EditableEmployeeDetails 
        employee={employee}
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
        employee={employee} 
        onEdit={() => setIsEditing(true)}
      />
      <EmployeeDetailTabs
        employee={employee}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        refetch={refetch}
      />
    </div>
  );
};
