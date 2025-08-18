
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import OpportunityForm from "./OpportunityForm";

const OpportunitiesHeader = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Satış Fırsatları</h1>
          <p className="text-sm text-muted-foreground">
            Tüm satış fırsatlarınızı yönetin ve takip edin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className="flex items-center gap-2" 
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Fırsat</span>
          </Button>
        </div>
      </div>
      
      <OpportunityForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
};

export default OpportunitiesHeader;
