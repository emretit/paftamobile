
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FormActionsProps {
  isLoading: boolean;
  isEditMode: boolean;
  onCancel: () => void;
}

export const FormActions = ({ isLoading, isEditMode, onCancel }: FormActionsProps) => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    } else {
      // Fallback to navigation if no cancel handler provided
      navigate("/employees");
    }
  };

  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={handleCancel}
      >
        İptal
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading}
        className="font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Kaydediliyor...
          </>
        ) : (
          isEditMode ? "Güncelle" : "Çalışan Ekle"
        )}
      </Button>
    </div>
  );
};
