
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Employee } from "../../types";
import { Edit, Eye, User } from "lucide-react";
import { EditableEmployeeDetails } from "../form/EditableEmployeeDetails";
import { FormFields } from "../form/FormFields";
import { useEmployeeDepartments } from "../../form/useEmployeeDepartments";

interface DetailsTabContentProps {
  employee: Employee;
  handleEmployeeUpdate: (employee: Employee) => void;
}

export const DetailsTabContent = ({ employee, handleEmployeeUpdate }: DetailsTabContentProps) => {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const departments = useEmployeeDepartments();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary" />
          Çalışan Detayları
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditingDetails(!isEditingDetails)}
          className="flex items-center gap-2"
        >
          {isEditingDetails ? (
            <>
              <Eye className="h-4 w-4" />
              <span>Görüntüle</span>
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              <span>Düzenle</span>
            </>
          )}
        </Button>
      </div>
      
      {isEditingDetails ? (
        <EditableEmployeeDetails 
          employee={employee} 
          onSave={handleEmployeeUpdate} 
        />
      ) : (
        <FormFields 
          formData={employee}
          departments={departments}
          isEditing={false}
        />
      )}
    </div>
  );
};
