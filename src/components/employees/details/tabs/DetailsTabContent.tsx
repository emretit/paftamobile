import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Employee } from "../../types";
import { Save, User } from "lucide-react";
import { EditableEmployeeDetails } from "../form/EditableEmployeeDetails";
import { FormFields } from "../form/FormFields";
import { useEmployeeDepartments } from "../../form/useEmployeeDepartments";

interface DetailsTabContentProps {
  employee: Employee;
  handleEmployeeUpdate: (employee: Employee) => void;
  isEditing: boolean;
}

export const DetailsTabContent = ({ 
  employee, 
  handleEmployeeUpdate,
  isEditing: initialIsEditing
}: DetailsTabContentProps) => {
  // Always set to true to keep edit mode active
  const [isEditingDetails, setIsEditingDetails] = useState(true);
  const departments = useEmployeeDepartments();
  
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
      />
    </div>
  );
};
