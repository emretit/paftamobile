
import { Employee } from "@/types/employee";
import { useEditableEmployeeForm } from "@/hooks/useEditableEmployeeForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { EmployeeForm } from "./components/EmployeeForm";

interface EditableEmployeeDetailsProps {
  employee: Employee;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditableEmployeeDetails = ({
  employee,
  onCancel,
  onSuccess
}: EditableEmployeeDetailsProps) => {
  const { isEditing, isSaving, handleEdit, handleCancel, handleSave } = useEditableEmployeeForm({
    employee,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee details updated successfully"
      });
      onSuccess();
    }
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Employee Details</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSave(employee)}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
        <EmployeeForm 
          employee={employee}
          isEditing={isEditing}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </Card>
  );
};
