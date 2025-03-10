
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, X, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmployeeDetailsHeaderProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  employeeId?: string;
  onSave?: () => void;
}

export const EmployeeDetailsHeader = ({ 
  isEditing, 
  setIsEditing,
  employeeId,
  onSave
}: EmployeeDetailsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <Button
        onClick={() => navigate("/employees")}
        variant="ghost"
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Çalışanlara Dön
      </Button>
      
      {employeeId && (
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                İptal
              </Button>
              
              {onSave && (
                <Button
                  onClick={onSave}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Düzenle
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
