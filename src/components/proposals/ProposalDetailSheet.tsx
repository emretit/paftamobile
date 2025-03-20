
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Proposal, proposalStatusLabels, proposalStatusColors } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarDays, FileText, User, Building, CreditCard } from "lucide-react";

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
      return format(new Date(dateString), "PPP", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b mb-6">
          <div className="flex justify-between items-start">
            <SheetTitle className="text-xl font-bold">
              {proposal.title}
            </SheetTitle>
            <Badge className={proposalStatusColors[proposal.status]}>
              {proposalStatusLabels[proposal.status]}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Teklif No
              </div>
              <div className="font-medium">TEK-{proposal.number || proposal.proposal_number}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" />
                Oluşturma Tarihi
              </div>
              <div className="font-medium">
                {formatDate(proposal.created_at)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Müşteri
              </div>
              <div className="font-medium">
                {proposal.customer?.name || proposal.customer_name || "-"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <User className="mr-2 h-4 w-4" />
                Satış Temsilcisi
              </div>
              <div className="font-medium">
                {proposal.employee
                  ? `${proposal.employee.first_name} ${proposal.employee.last_name}`
                  : proposal.employee_name || "-"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                Toplam Tutar
              </div>
              <div className="font-medium">
                {formatMoney(proposal.total_amount || proposal.total_value || 0)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" />
                Geçerlilik Tarihi
              </div>
              <div className="font-medium">
                {formatDate(proposal.valid_until)}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="items">
          <TabsList className="mb-4">
            <TabsTrigger value="items">Teklif Kalemleri</TabsTrigger>
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="history">Tarihçe</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="bg-muted/40 p-3 rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Ürün/Hizmet</th>
                    <th className="text-right py-2">Miktar</th>
                    <th className="text-right py-2">Birim Fiyat</th>
                    <th className="text-right py-2">KDV</th>
                    <th className="text-right py-2">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.items && proposal.items.length > 0 ? (
                    proposal.items.map((item) => (
                      <tr key={item.id} className="border-b border-border/50">
                        <td className="py-2">{item.name}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">
                          {formatMoney(item.unit_price)}
                        </td>
                        <td className="text-right py-2">%{item.tax_rate}</td>
                        <td className="text-right py-2">
                          {formatMoney(item.total_price)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        Bu teklifte henüz kalem bulunmuyor
                      </td>
                    </tr>
                  )}
                </tbody>
                {proposal.items && proposal.items.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-border">
                      <td colSpan={4} className="text-right py-2 font-medium">
                        Toplam:
                      </td>
                      <td className="text-right py-2 font-medium">
                        {formatMoney(proposal.total_amount || proposal.total_value || 0)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Ödeme Şartları</h3>
                  <p className="text-sm text-muted-foreground">
                    {proposal.payment_terms || "Belirtilmemiş"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Teslimat Şartları</h3>
                  <p className="text-sm text-muted-foreground">
                    {proposal.delivery_terms || "Belirtilmemiş"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Notlar</h3>
                  <p className="text-sm text-muted-foreground">
                    {proposal.notes || "Not bulunmuyor"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Dahili Notlar</h3>
                  <p className="text-sm text-muted-foreground">
                    {proposal.internal_notes || "Not bulunmuyor"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Fırsatla İlişkili</h3>
                  <p className="text-sm text-muted-foreground">
                    {proposal.opportunity_id
                      ? `Fırsat ID: ${proposal.opportunity_id}`
                      : "İlişkili fırsat bulunmuyor"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Son Güncelleme</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(proposal.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              Bu teklif için tarihçe kaydı bulunmamaktadır.
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ProposalDetailSheet;
