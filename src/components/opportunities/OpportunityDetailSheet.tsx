
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Maximize2 } from "lucide-react";
import { 
  Opportunity,
  OpportunityStatus,
  opportunityStatusLabels 
} from "@/types/crm";
import { useOpportunities } from "@/hooks/useOpportunities";
import OpportunityDetailsTab from "./tabs/OpportunityDetailsTab";
import OpportunityTasksTab from "./tabs/OpportunityTasksTab";
import OpportunityHistoryTab from "./tabs/OpportunityHistoryTab";
import OpportunityStatusBadge from "./OpportunityStatusBadge";

interface OpportunityDetailSheetProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (opportunityId: string, newStatus: OpportunityStatus) => void;
}

const OpportunityDetailSheet = ({ 
  opportunity, 
  isOpen, 
  onClose,
  onStatusChange
}: OpportunityDetailSheetProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateOpportunity } = useOpportunities();
  const navigate = useNavigate();

  const handleViewFullDetails = () => {
    if (opportunity) {
      navigate(`/opportunities/detail/${opportunity.id}`);
      onClose();
    }
  };

  const handleUpdate = async (data: Partial<Opportunity>) => {
    if (!opportunity) return;
    
    setIsUpdating(true);
    try {
      await updateOpportunity.mutateAsync({
        id: opportunity.id,
        ...data
      });
    } catch (error) {
      console.error("Error updating opportunity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = (newStatus: OpportunityStatus) => {
    if (!opportunity) return;
    onStatusChange(opportunity.id, newStatus);
  };

  if (!opportunity) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="flex flex-row justify-between items-center">
          <div>
            <SheetTitle className="text-xl">{opportunity.title}</SheetTitle>
            <div className="flex items-center mt-1 text-muted-foreground">
              <span className="mr-2">Müşteri: {opportunity.customer_name || "Belirtilmemiş"}</span>
              <OpportunityStatusBadge status={opportunity.status} />
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewFullDetails} 
            className="ml-auto"
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Tam Görünüm
          </Button>
        </SheetHeader>
        
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="tasks">Görevler</TabsTrigger>
            <TabsTrigger value="history">Geçmiş</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <OpportunityDetailsTab 
              opportunity={opportunity} 
              onStatusChange={handleStatusChange}
              onUpdate={handleUpdate}
              isUpdating={isUpdating}
            />
          </TabsContent>
          
          <TabsContent value="tasks">
            <OpportunityTasksTab opportunityId={opportunity.id} />
          </TabsContent>
          
          <TabsContent value="history">
            <OpportunityHistoryTab 
              opportunity={opportunity}
              onUpdateHistory={handleUpdate}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default OpportunityDetailSheet;
