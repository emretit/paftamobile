
import { Proposal } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { useCustomerNames } from "@/hooks/useCustomerNames";
import { useEmployeeNames } from "@/hooks/useEmployeeNames";

interface ProposalDetailsTabProps {
  proposal: Proposal;
  isReadOnly?: boolean;
}

export const ProposalDetailsTab = ({ 
  proposal,
  isReadOnly = false
}: ProposalDetailsTabProps) => {
  const { getCustomerName } = useCustomerNames();
  const { getEmployeeName } = useEmployeeNames();

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd MMMM yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: proposal.currency || 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-red-800">Teklif Bilgileri</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Oluşturma Tarihi</p>
            <p className="text-base">{formatDate(proposal.created_at)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Geçerlilik Tarihi</p>
            <p className="text-base">{formatDate(proposal.valid_until)}</p>
          </div>
          {proposal.sent_date && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gönderim Tarihi</p>
              <p className="text-base">{formatDate(proposal.sent_date)}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Toplam Tutar</p>
            <p className="text-base font-medium">{formatMoney(proposal.total_value)}</p>
          </div>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-red-800">İlgili Kişi Bilgileri</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Müşteri</p>
            <p className="text-base">{proposal.customer_id ? getCustomerName(proposal.customer_id) : "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sorumlu</p>
            <p className="text-base">{proposal.employee_id ? getEmployeeName(proposal.employee_id) : "-"}</p>
          </div>
        </div>
      </div>
      
      {proposal.payment_term && (
        <>
          <Separator className="my-4" />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-red-800">Ödeme Koşulları</h3>
            <p className="text-base">
              {proposal.payment_term === 'prepaid' ? 'Peşin' : 
               proposal.payment_term === 'net15' ? '15 Gün Vade' :
               proposal.payment_term === 'net30' ? '30 Gün Vade' :
               proposal.payment_term === 'net60' ? '60 Gün Vade' :
               proposal.payment_term}
            </p>
          </div>
        </>
      )}
      
      {proposal.warranty_terms && (
        <>
          <Separator className="my-4" />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-red-800">Garanti Koşulları</h3>
            <p className="text-base">{proposal.warranty_terms}</p>
          </div>
        </>
      )}
    </div>
  );
};
