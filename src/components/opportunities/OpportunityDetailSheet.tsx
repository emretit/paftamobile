
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Opportunity } from "@/types/crm";
import { format } from "date-fns";
import { tr } from 'date-fns/locale';
import { Edit, User, Calendar, DollarSign, BarChart } from "lucide-react";

interface OpportunityDetailSheetProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (opportunity: Partial<Opportunity> & { id: string }) => Promise<boolean>;
}

const OpportunityDetailSheet: React.FC<OpportunityDetailSheetProps> = ({
  opportunity,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const getStatusText = (status: string) => {
    switch(status) {
      case "new": return "Yeni";
      case "first_contact": return "İlk Görüşme";
      case "site_visit": return "Saha Ziyareti";
      case "preparing_proposal": return "Teklif Hazırlama";
      case "proposal_sent": return "Teklif Gönderildi";
      case "accepted": return "Kazanıldı";
      case "lost": return "Kaybedildi";
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "first_contact": return "bg-purple-100 text-purple-800";
      case "site_visit": return "bg-indigo-100 text-indigo-800";
      case "preparing_proposal": return "bg-yellow-100 text-yellow-800";
      case "proposal_sent": return "bg-orange-100 text-orange-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
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
          <SheetTitle className="pr-10">{opportunity.title}</SheetTitle>
          <div className="flex space-x-2 mt-1">
            <Badge className={getStatusColor(opportunity.status)}>
              {getStatusText(opportunity.status)}
            </Badge>
            <Badge className={getPriorityColor(opportunity.priority)}>
              {opportunity.priority === "low" && "Düşük"}
              {opportunity.priority === "medium" && "Orta"}
              {opportunity.priority === "high" && "Yüksek"}
            </Badge>
          </div>
        </SheetHeader>
        
        <div className="py-6">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detaylar</TabsTrigger>
              <TabsTrigger value="history">Geçmiş</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Müşteri</p>
                    <p className="text-sm text-gray-500">{opportunity.customer?.name || "Belirtilmemiş"}</p>
                  </div>
                </div>
                
                {opportunity.expected_close_date && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Tahmini Kapanış</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(opportunity.expected_close_date), "PPP", { locale: tr })}
                      </p>
                    </div>
                  </div>
                )}
                
                {opportunity.value && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Tahmini Değer</p>
                      <p className="text-sm text-gray-500">{formatMoney(opportunity.value)}</p>
                    </div>
                  </div>
                )}
                
                {opportunity.probability && (
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Kazanma Olasılığı</p>
                      <p className="text-sm text-gray-500">%{opportunity.probability}</p>
                    </div>
                  </div>
                )}
                
                {opportunity.description && (
                  <div className="pt-2">
                    <p className="text-sm font-medium">Açıklama</p>
                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{opportunity.description}</p>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <div className="text-sm text-gray-500">
                <p>Oluşturulma: {format(new Date(opportunity.created_at), "PPP", { locale: tr })}</p>
                <p>Son Güncelleme: {format(new Date(opportunity.updated_at), "PPP", { locale: tr })}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OpportunityDetailSheet;
