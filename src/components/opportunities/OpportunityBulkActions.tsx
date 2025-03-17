
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Circle, ChevronDown, X } from "lucide-react";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { Badge } from "@/components/ui/badge";

interface OpportunityBulkActionsProps {
  selectedOpportunities: Opportunity[];
  onUpdateStatus: (opportunities: Opportunity[], newStatus: OpportunityStatus) => void;
  onClearSelection: () => void;
}

const OpportunityBulkActions = ({
  selectedOpportunities,
  onUpdateStatus,
  onClearSelection
}: OpportunityBulkActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedOpportunities.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 z-50 flex items-center gap-3 border border-gray-200 dark:border-gray-700">
      <Badge variant="outline" className="px-2 py-1">
        {selectedOpportunities.length} seçili
      </Badge>
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="text-sm">
            Durum Güncelle <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedOpportunities, "new")}>
            <Circle className="mr-2 h-4 w-4 text-blue-500" />
            Yeni
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedOpportunities, "first_contact")}>
            <Circle className="mr-2 h-4 w-4 text-purple-500" />
            İlk Görüşme
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedOpportunities, "site_visit")}>
            <Circle className="mr-2 h-4 w-4 text-yellow-500" />
            Ziyaret Yapıldı
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedOpportunities, "preparing_proposal")}>
            <Circle className="mr-2 h-4 w-4 text-orange-500" />
            Teklif Hazırlanıyor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedOpportunities, "proposal_sent")}>
            <Circle className="mr-2 h-4 w-4 text-indigo-500" />
            Teklif Gönderildi
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedOpportunities, "accepted")}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Kabul Edildi
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedOpportunities, "lost")}>
            <X className="mr-2 h-4 w-4 text-red-500" />
            Kaybedildi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        <X className="h-4 w-4 mr-1" /> Seçimi Temizle
      </Button>
    </div>
  );
};

export default OpportunityBulkActions;
