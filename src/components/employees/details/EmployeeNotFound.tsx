
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const EmployeeNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 text-center bg-white rounded-md shadow">
      <h2 className="text-xl font-medium text-gray-800">Çalışan bulunamadı</h2>
      <p className="mt-2 text-gray-600">İstediğiniz çalışan kaydı mevcut değil veya erişim izniniz yok.</p>
      <Button className="mt-4" onClick={() => navigate("/employees")}>
        Çalışanlara Dön
      </Button>
    </div>
  );
};
