
import { EmployeeFormWrapper } from "./form/EmployeeFormWrapper";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export const EmployeeForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Başarılı",
      description: "Çalışan başarıyla eklendi.",
    });
    navigate("/employees");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Çalışan Ekle</h1>
        <EmployeeFormWrapper onSuccess={handleSuccess} />
      </div>
    </div>
  );
};
