
import { Proposal } from "@/types/proposal";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { FileText, Calendar, DollarSign, Users, Building2, User } from "lucide-react";
import { statusLabels, statusStyles } from "./constants";

interface ProposalDetailSheetProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProposalDetailSheet({ proposal, isOpen, onClose }: ProposalDetailSheetProps) {
  if (!proposal) return null;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle>Teklif #{proposal.proposal_number}</SheetTitle>
            <Badge 
              className={`${statusStyles[proposal.status].bg} ${
                statusStyles[proposal.status].text
              }`}
            >
              {statusLabels[proposal.status]}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Oluşturulma Tarihi: {format(new Date(proposal.created_at), 'dd MMMM yyyy', { locale: tr })}</span>
            </div>
            {proposal.valid_until && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Geçerlilik Tarihi: {format(new Date(proposal.valid_until), 'dd MMMM yyyy', { locale: tr })}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Müşteri Bilgileri</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{proposal.customer?.name || 'Belirtilmemiş'}</span>
              </div>
              {proposal.employee && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Satış Temsilcisi: {proposal.employee.first_name} {proposal.employee.last_name}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Finansal Detaylar</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Toplam Tutar</span>
                </div>
                <span className="font-semibold">{formatMoney(proposal.total_value)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
            <Button>
              Düzenle
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
