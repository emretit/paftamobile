
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onClose: () => void;
  isEditing: boolean;
}

const FormActions = ({ onClose, isEditing }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button type="button" variant="outline" onClick={onClose} className="font-medium">
        İptal
      </Button>
      <Button type="submit" className="font-medium">
        {isEditing ? 'Güncelle' : 'Oluştur'}
      </Button>
    </div>
  );
};

export default FormActions;
