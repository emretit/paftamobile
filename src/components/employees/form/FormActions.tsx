
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
  isEditMode: boolean;
  onCancel: () => void;
}

export const FormActions = ({ isLoading, isEditMode, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : (isEditMode ? "Update" : "Add Employee")}
      </Button>
    </div>
  );
};
