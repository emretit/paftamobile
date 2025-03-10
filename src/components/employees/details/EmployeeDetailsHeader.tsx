
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Download, Share2 } from "lucide-react";
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
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex items-center gap-3 mb-4 md:mb-0">
        <Button
          onClick={() => navigate("/employees")}
          variant="outline"
          size="sm"
          className="text-gray-600 hover:text-primary hover:border-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          Çalışanlara Dön
        </Button>
        
        {employeeName && (
          <div className="hidden md:flex items-center text-gray-700 font-medium">
            <span className="mx-2 text-gray-300">/</span>
            <User className="w-4 h-4 mr-2 text-primary" />
            <span className="text-lg">{employeeName}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-gray-600 hover:text-primary hover:border-primary transition-colors flex-1 md:flex-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Detayları İndir
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-gray-600 hover:text-primary hover:border-primary transition-colors flex-1 md:flex-auto"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Paylaş
        </Button>
      </div>
    </div>
  );
};
