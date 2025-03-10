
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Edit } from "lucide-react";

type FormActionsProps = {
  onClose: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
  showPreview?: boolean;
  setShowPreview?: (show: boolean) => void;
};

export const FormActions: React.FC<FormActionsProps> = ({ 
  onClose, 
  isSubmitting, 
  isEditing,
  showPreview,
  setShowPreview
}) => {
  return (
    <div className="flex justify-end space-x-3 pt-6">
      <Button variant="outline" onClick={onClose} type="button" className="font-medium">
        İptal
      </Button>
      
      {setShowPreview && (
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => setShowPreview(!showPreview)}
          className="font-medium"
        >
          {showPreview ? (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Önizle
            </>
          )}
        </Button>
      )}
      
      <Button type="submit" disabled={isSubmitting} className="font-medium">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Güncelle" : "Oluştur"}
      </Button>
    </div>
  );
};
