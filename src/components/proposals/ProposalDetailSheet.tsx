
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Proposal } from "@/types/proposal";
import StatusBadge from "./detail/StatusBadge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  CalendarDays, 
  FileText, 
  User, 
  Building, 
  CreditCard, 
  Edit3,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProposalDetailSheetProps {
  proposal: Proposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProposalDetailSheet: React.FC<ProposalDetailSheetProps> = ({
  proposal,
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  if (!proposal) return null;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: proposal.currency || "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd.MM.yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  const handleEdit = () => {
    onOpenChange(false);
    navigate(`/proposal/${proposal.id}/edit`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {/* Header */}
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold truncate">
                {proposal.title}
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                TEK-{proposal.number || proposal.proposal_number}
              </p>
            </div>
            <StatusBadge status={proposal.status} size="sm" />
          </div>

          <Button onClick={handleEdit} className="w-full">
            <Edit3 className="mr-2 h-4 w-4" />
            Teklifi Düzenle
          </Button>
        </SheetHeader>

        <div className="space-y-6">
          {/* Ana Bilgiler */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Ana Bilgiler
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="mr-2 h-4 w-4" />
                  Müşteri
                </div>
                <div className="text-sm font-medium text-right">
                  {proposal.customer?.name || proposal.customer_name || "-"}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  Satış Temsilcisi
                </div>
                <div className="text-sm font-medium text-right">
                  {proposal.employee
                    ? `${proposal.employee.first_name} ${proposal.employee.last_name}`
                    : proposal.employee_name || "-"}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Toplam Tutar
                </div>
                <div className="text-sm font-medium text-right">
                  {formatMoney(proposal.total_amount || proposal.total_value || 0)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tarihler */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Tarihler
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Oluşturma Tarihi
                </div>
                <div className="text-sm font-medium">
                  {formatDate(proposal.created_at)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  Geçerlilik Tarihi
                </div>
                <div className="text-sm font-medium">
                  {formatDate(proposal.valid_until)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Teklif Kalemleri */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Teklif Kalemleri ({proposal.items?.length || 0})
            </h3>
            
            <div className="space-y-2">
              {proposal.items && proposal.items.length > 0 ? (
                proposal.items.map((item, index) => (
                  <div key={item.id || index} className="p-3 bg-muted/40 rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.quantity} × {formatMoney(item.unit_price)}
                        </p>
                      </div>
                      <div className="text-sm font-medium ml-2">
                        {formatMoney(item.total_price)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Bu teklifte henüz kalem bulunmuyor
                </div>
              )}
            </div>
          </div>

          {/* Notlar */}
          {(proposal.notes || proposal.description) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Notlar
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {proposal.notes || proposal.description || "Not bulunmuyor"}
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProposalDetailSheet;
