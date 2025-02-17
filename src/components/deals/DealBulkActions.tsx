
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, CheckSquare, Clock, Users, X } from "lucide-react";
import { Deal } from "@/types/deal";

interface DealBulkActionsProps {
  selectedDeals: Deal[];
  onUpdateStatus: (deals: Deal[], newStatus: Deal["status"]) => void;
  onClearSelection: () => void;
}

const DealBulkActions = ({
  selectedDeals,
  onUpdateStatus,
  onClearSelection,
}: DealBulkActionsProps) => {
  if (selectedDeals.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white p-4 rounded-lg shadow-lg">
      <span className="text-sm font-medium">
        {selectedDeals.length} fırsat seçildi
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Durum Güncelle
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedDeals, "negotiation")}>
            <Users className="h-4 w-4 mr-2" />
            Görüşmede
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedDeals, "follow_up")}>
            <Clock className="h-4 w-4 mr-2" />
            Takipte
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedDeals, "won")}>
            <Check className="h-4 w-4 mr-2" />
            Kazanıldı
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(selectedDeals, "lost")}>
            <X className="h-4 w-4 mr-2" />
            Kaybedildi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Seçimi Temizle
      </Button>
    </div>
  );
};

export default DealBulkActions;
