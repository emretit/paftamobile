
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Proposal } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from 'date-fns/locale';
import { User, Calendar, DollarSign, FileText, Printer, Download } from "lucide-react";

interface ProposalDetailSheetProps {
  proposal: Proposal;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalDetailSheet: React.FC<ProposalDetailSheetProps> = ({
  proposal,
  isOpen,
  onClose
}) => {
  const getStatusText = (status: string) => {
    switch(status) {
      case "draft": return "Taslak";
      case "pending_approval": return "Onay Bekliyor";
      case "sent": return "Gönderildi";
      case "accepted": return "Kabul Edildi";
      case "rejected": return "Reddedildi";
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "pending_approval": return "bg-yellow-100 text-yellow-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
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
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="pr-10">
            {proposal.title || `Teklif #${proposal.proposal_number}`}
          </SheetTitle>
          <div className="flex space-x-2 mt-1">
            <Badge className={getStatusColor(proposal.status)}>
              {getStatusText(proposal.status)}
            </Badge>
          </div>
        </SheetHeader>
        
        <div className="py-6">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detaylar</TabsTrigger>
              <TabsTrigger value="items">Kalemler</TabsTrigger>
              <TabsTrigger value="history">Geçmiş</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Müşteri</p>
                    <p className="text-sm text-gray-500">
                      {proposal.customer?.name || "Belirtilmemiş"}
                    </p>
                  </div>
                </div>
                
                {proposal.valid_until && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Geçerlilik Tarihi</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(proposal.valid_until), "PPP", { locale: tr })}
                      </p>
                    </div>
                  </div>
                )}
                
                {proposal.total_value && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Toplam Tutar</p>
                      <p className="text-sm text-gray-500">{formatMoney(proposal.total_value)}</p>
                    </div>
                  </div>
                )}
                
                {proposal.notes && (
                  <div className="pt-2">
                    <p className="text-sm font-medium">Notlar</p>
                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">
                      {proposal.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Yazdır
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="items" className="mt-4">
              <div className="text-sm">
                {proposal.items?.length ? (
                  <div className="space-y-3">
                    {proposal.items.map((item, index) => (
                      <div key={index} className="border p-3 rounded-md">
                        <div className="font-medium">{item.name}</div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{item.quantity} {item.unit}</span>
                          <span>{formatMoney(item.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 flex flex-col items-center py-6">
                    <FileText className="h-8 w-8 mb-2 text-gray-400" />
                    <p>Henüz kalem eklenmemiş</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <div className="text-sm text-gray-500">
                <p>Oluşturulma: {format(new Date(proposal.created_at), "PPP", { locale: tr })}</p>
                {proposal.updated_at && (
                  <p>Son Güncelleme: {format(new Date(proposal.updated_at), "PPP", { locale: tr })}</p>
                )}
                {proposal.sent_at && (
                  <p>Gönderilme: {format(new Date(proposal.sent_at), "PPP", { locale: tr })}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProposalDetailSheet;
