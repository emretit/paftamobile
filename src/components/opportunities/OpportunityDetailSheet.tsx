
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Opportunity, opportunityStatusLabels, opportunityStatusColors, opportunityPriorityLabels } from "@/types/crm";
import { format } from "date-fns";
import { tr } from 'date-fns/locale';
import { Edit, User, Calendar, DollarSign, Clipboard } from "lucide-react";

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
            <Badge className={opportunityStatusColors[opportunity.status]}>
              {opportunityStatusLabels[opportunity.status]}
            </Badge>
            <Badge className={
              opportunity.priority === "high" ? "bg-red-100 text-red-800" : 
              opportunity.priority === "medium" ? "bg-yellow-100 text-yellow-800" : 
              "bg-blue-100 text-blue-800"
            }>
              {opportunityPriorityLabels[opportunity.priority]}
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
              
              {opportunity.contact_history && opportunity.contact_history.length > 0 ? (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">İletişim Geçmişi</p>
                  <div className="space-y-3">
                    {opportunity.contact_history.map((contact, index) => (
                      <div key={contact.id || index} className="border rounded-md p-3">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">
                            {contact.contact_type === "call" && "Arama"}
                            {contact.contact_type === "email" && "E-posta"}
                            {contact.contact_type === "meeting" && "Toplantı"}
                            {contact.contact_type === "other" && "Diğer"}
                          </p>
                          <p className="text-xs text-gray-500">{contact.date}</p>
                        </div>
                        <p className="text-sm mt-1">{contact.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 mt-4">
                  <Clipboard className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p>Henüz iletişim geçmişi yok</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OpportunityDetailSheet;
