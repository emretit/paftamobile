
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onClose: () => void;
  isEditing: boolean;
}

const FormActions = ({ onClose, isEditing }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onClose}>
        İptal
      </Button>
      <Button type="submit">
        {isEditing ? 'Güncelle' : 'Oluştur'}
      </Button>
    </div>
  );
};

export default FormActions;
