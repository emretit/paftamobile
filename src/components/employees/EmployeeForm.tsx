
import { EmployeeFormWrapper } from "./form/EmployeeFormWrapper";
import type { Employee } from "./types";

interface EmployeeFormProps {
  initialData?: Employee;
}

export const EmployeeForm = ({ initialData }: EmployeeFormProps) => {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {initialData ? 'Edit Employee' : 'Add New Employee'}
        </h1>
        
        <EmployeeFormWrapper initialData={initialData} />
      </div>
    </div>
  );
};
