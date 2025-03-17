
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import OpportunityForm from "./OpportunityForm";

const OpportunitiesHeader = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fırsatlar</h1>
        <p className="text-gray-600">
          Tüm satış fırsatlarını yönetin ve takip edin
        </p>
      </div>
      
      <Button 
        onClick={() => setIsFormOpen(true)}
        className="bg-red-800 hover:bg-red-900 text-white"
      >
        <Plus className="mr-2 h-4 w-4" />
        Yeni Fırsat
      </Button>
      
      <OpportunityForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default OpportunitiesHeader;
