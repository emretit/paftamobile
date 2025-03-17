
import React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Proposal, proposalStatusLabels, proposalStatusColors } from "@/types/proposal";
import { CalendarIcon, User2Icon, FileTextIcon, ClipboardList, Download } from "lucide-react";

interface ProposalDetailSheetProps {
  proposal: Proposal;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalDetailSheet: React.FC<ProposalDetailSheetProps> = ({
  proposal,
  isOpen,
  onClose,
}) => {
  const formatMoney = (amount: number) => {
    if (!amount && amount !== 0) return "₺0";
    
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center justify-between">
            <span className="font-semibold text-xl">
              {proposal.title || `Teklif #${proposal.proposal_number}`}
            </span>
            <Badge className={proposalStatusColors[proposal.status]}>
              {proposalStatusLabels[proposal.status]}
            </Badge>
          </SheetTitle>
          <div className="text-sm text-gray-500">
            Teklif No: {proposal.proposal_number}
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="items">Kalemler</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <User2Icon className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Müşteri</p>
                  <p className="text-sm text-gray-500">
                    {proposal.customer?.name || "Belirtilmemiş"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Oluşturulma Tarihi</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(proposal.created_at), "dd MMMM yyyy", { locale: tr })}
                  </p>
                </div>
              </div>

              {proposal.sent_date && (
                <div className="flex items-center">
                  <FileTextIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Gönderim Tarihi</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(proposal.sent_date), "dd MMMM yyyy", { locale: tr })}
                    </p>
                  </div>
                </div>
              )}

              {proposal.valid_until && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Geçerlilik Tarihi</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(proposal.valid_until), "dd MMMM yyyy", { locale: tr })}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <p className="text-sm font-medium">Tutar</p>
                <p className="text-lg font-semibold">{formatMoney(proposal.total_value)}</p>
              </div>

              {proposal.notes && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm font-medium">Notlar</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{proposal.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF İndir
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="items" className="mt-4">
            <div className="space-y-3">
              <div className="text-sm font-medium">Teklif Kalemleri</div>
              
              {proposal.items && proposal.items.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ürün
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Miktar
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Birim Fiyat
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toplam
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {proposal.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            {item.quantity} {item.unit || "Adet"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            {formatMoney(item.unit_price)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            {formatMoney(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p>Bu teklifte kalem bulunmamaktadır</p>
                </div>
              )}

              <div className="pt-4 border-t flex flex-col items-end space-y-1">
                <div className="flex justify-between w-48">
                  <span className="text-sm">Ara Toplam:</span>
                  <span className="text-sm font-medium">
                    {formatMoney(proposal.total_value || 0)}
                  </span>
                </div>
                {proposal.discounts && (
                  <div className="flex justify-between w-48">
                    <span className="text-sm">İndirim:</span>
                    <span className="text-sm font-medium">
                      {formatMoney(proposal.discounts)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between w-48 font-semibold">
                  <span>Toplam:</span>
                  <span>{formatMoney(proposal.total_value || 0)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
