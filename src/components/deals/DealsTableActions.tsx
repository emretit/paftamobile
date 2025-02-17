
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Deal } from "@/types/deal";

interface DealsTableActionsProps {
  deal: Deal;
  onViewDeal: (deal: Deal) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (deal: Deal) => void;
}

const DealsTableActions = ({
  deal,
  onViewDeal,
  onEditDeal,
  onDeleteDeal,
}: DealsTableActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewDeal(deal)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEditDeal(deal)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDeleteDeal(deal)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DealsTableActions;
