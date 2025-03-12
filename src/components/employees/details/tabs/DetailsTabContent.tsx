
import { User } from "lucide-react";
import { Employee } from "@/types/employee";
import { FormFields } from "../form/FormFields";

interface DetailsTabContentProps {
  employee: Employee;
  handleEmployeeUpdate: (employee: Employee) => void;
}

export const DetailsTabContent = ({ 
  employee, 
  handleEmployeeUpdate,
}: DetailsTabContentProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary" />
          Employee Details
        </h3>
      </div>
      
      <FormFields 
        formData={employee}
        departments={[{ name: employee.department }]}
        isEditing={false}
      />
    </div>
  );
};
