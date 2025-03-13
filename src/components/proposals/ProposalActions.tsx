
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProposalActionsProps {
  proposal: any | null;
}

export const ProposalActions = ({ proposal }: ProposalActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex gap-3">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtrele
        </Button>
      </div>
      <Button 
        size="sm" 
        onClick={() => navigate("/proposal-create")}
      >
        <Plus className="h-4 w-4 mr-2" />
        Yeni Teklif
      </Button>
    </div>
  );
};
