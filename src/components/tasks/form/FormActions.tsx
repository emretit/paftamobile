
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";

interface FormActionsProps {
  onClose: () => void;
  isEditing: boolean;
  isSubmitting: boolean;
}

const FormActions = ({ onClose, isEditing, isSubmitting }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onClose} 
        disabled={isSubmitting}
        className="flex items-center"
      >
        <X className="mr-1 h-4 w-4" />
        İptal
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-primary hover:bg-primary/90 text-white flex items-center"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? "Güncelleniyor..." : "Oluşturuluyor..."}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Güncelle" : "Oluştur"}
          </>
        )}
      </Button>
    </div>
  );
};

export default FormActions;
