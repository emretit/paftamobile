
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
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewDeal(deal)}
        className="h-8 w-8"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEditDeal(deal)}
        className="h-8 w-8"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDeleteDeal(deal)}
        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DealsTableActions;
