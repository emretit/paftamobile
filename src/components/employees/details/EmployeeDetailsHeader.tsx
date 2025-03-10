
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmployeeDetailsHeaderProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  employeeId?: string;
}

export const EmployeeDetailsHeader = ({ 
  isEditing, 
  setIsEditing,
  employeeId
}: EmployeeDetailsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <Button
        onClick={() => navigate("/employees")}
        variant="ghost"
        className="flex items-center text-gray-600 hover:text-gray-900 p-0"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Çalışanlara Dön
      </Button>
      {employeeId && (
        <>
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                İptal
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Düzenle
            </Button>
          )}
        </>
      )}
    </div>
  );
};
