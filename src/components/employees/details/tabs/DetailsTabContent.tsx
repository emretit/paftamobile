
import { useState } from "react";
import { User } from "lucide-react";
import { Employee } from "../../types";
import { EditableEmployeeDetails } from "../form/EditableEmployeeDetails";

interface DetailsTabContentProps {
  employee: Employee;
  handleEmployeeUpdate: (employee: Employee) => void;
  isEditing?: boolean;
}

export const DetailsTabContent = ({ 
  employee, 
  handleEmployeeUpdate,
  isEditing = false
}: DetailsTabContentProps) => {
  const [isEditMode, setIsEditMode] = useState(isEditing);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary" />
          Çalışan Detayları
        </h3>
      </div>
      
      <EditableEmployeeDetails 
        employee={employee} 
        onSave={handleEmployeeUpdate} 
        isEditing={true} // Always in edit mode to allow changes
      />
    </div>
  );
};
