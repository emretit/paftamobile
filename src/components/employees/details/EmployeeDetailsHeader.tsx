
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmployeeDetailsHeaderProps {
  employeeId?: string;
}

export const EmployeeDetailsHeader = ({ 
  employeeId
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
    </div>
  );
};
