
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmployeeDetailsHeaderProps {
  employeeId?: string;
  employeeName?: string;
}

export const EmployeeDetailsHeader = ({ 
  employeeId,
  employeeName
}: EmployeeDetailsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-white to-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => navigate("/employees")}
          variant="outline"
          size="sm"
          className="text-gray-600 hover:text-primary hover:border-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Çalışanlara Dön
        </Button>
        
        {employeeName && (
          <div className="hidden md:flex items-center text-gray-500 font-medium">
            <span className="mx-2">/</span>
            <User className="w-4 h-4 mr-1 text-primary" />
            <span>{employeeName}</span>
          </div>
        )}
      </div>
    </div>
  );
};
