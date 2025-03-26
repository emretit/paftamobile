
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  FileText, 
  Printer, 
  Send, 
  Copy, 
  MoreHorizontal 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Proposal } from "@/types/proposal";
import { toast } from "sonner";

interface ProposalDetailActionsProps {
  proposal: Proposal;
}

const ProposalDetailActions: React.FC<ProposalDetailActionsProps> = ({ proposal }) => {
  const navigate = useNavigate();
  
  const handleConvertToOrder = () => {
    navigate(`/orders/new?proposalId=${proposal.id}`);
  };
  
  const handlePrint = () => {
    toast.info("Yazdırma işlemi başlatılıyor...");
    window.print();
  };
  
  const handleSendProposal = () => {
    toast.success("Teklif e-posta olarak gönderildi");
  };
  
  const handleDuplicate = () => {
    toast.success("Teklif kopyalandı");
    // Redirect to new proposal form with duplicated data
  };

  // Only allow converting accepted proposals to orders
  const canConvertToOrder = proposal.status === "accepted";
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="default" 
        onClick={handleConvertToOrder}
        disabled={!canConvertToOrder}
        title={canConvertToOrder ? "Siparişe Çevir" : "Yalnızca kabul edilmiş teklifler siparişe çevrilebilir"}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Siparişe Çevir
      </Button>
      
      <Button variant="outline">
        <FileText className="h-4 w-4 mr-2" />
        PDF İndir
      </Button>
      
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Yazdır
      </Button>
      
      <Button variant="outline" onClick={handleSendProposal}>
        <Send className="h-4 w-4 mr-2" />
        Gönder
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Diğer
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Çoğalt
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/proposals/${proposal.id}/edit`)}>
            Düzenle
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            İptal Et
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProposalDetailActions;
