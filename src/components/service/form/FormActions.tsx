
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type FormActionsProps = {
  onClose: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
};

export const FormActions: React.FC<FormActionsProps> = ({ 
  onClose, 
  isSubmitting, 
  isEditing 
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button variant="outline" onClick={onClose} type="button">
        İptal
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Güncelle" : "Oluştur"}
      </Button>
    </div>
  );
};
