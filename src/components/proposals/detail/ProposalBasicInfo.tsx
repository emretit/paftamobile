
import { formatMoney } from "@/components/deals/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Proposal } from "@/types/proposal";
import { useCustomerNames } from "@/hooks/useCustomerNames";

interface ProposalBasicInfoProps {
  proposal: Proposal;
}

export const ProposalBasicInfo = ({ proposal }: ProposalBasicInfoProps) => {
  const { getCustomerName } = useCustomerNames();
  
  return (
    <div className="space-y-3 bg-muted/30 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-sm text-muted-foreground">Teklif Numarası</p>
          <p className="font-medium">#{proposal.proposal_number}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Müşteri</p>
          <p className="font-medium">
            {proposal.customer_id ? getCustomerName(proposal.customer_id) : "-"}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-sm text-muted-foreground">Oluşturma Tarihi</p>
          <p className="font-medium">
            {proposal.created_at ? 
              format(new Date(proposal.created_at), "dd MMMM yyyy", { locale: tr }) : 
              "-"
            }
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Geçerlilik Tarihi</p>
          <p className="font-medium">
            {proposal.valid_until ? 
              format(new Date(proposal.valid_until), "dd MMMM yyyy", { locale: tr }) : 
              "-"
            }
          </p>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">Toplam Tutar</p>
        <p className="font-medium">{formatMoney(proposal.total_value)}</p>
      </div>
    </div>
  );
};
