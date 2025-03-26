
import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Proposal, ProposalItem } from "@/types/proposal";
import { mockCrmService } from "@/services/mockCrm";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";
import OrderCustomerInfo from "./OrderCustomerInfo";
import OrderItemsTable from "./OrderItemsTable";
import OrderSummary from "./OrderSummary";
import OrderPaymentInfo from "./OrderPaymentInfo";

interface OrderFormProps {
  proposalId: string | null;
}

const OrderForm: React.FC<OrderFormProps> = ({ proposalId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [orderItems, setOrderItems] = useState<ProposalItem[]>([]);
  
  useEffect(() => {
    const fetchProposalData = async () => {
      if (!proposalId) return;
      
      try {
        setLoading(true);
        const { data, error } = await mockCrmService.getProposalById(proposalId);
        
        if (error) {
          toast({
            title: "Hata",
            description: "Teklif bilgileri yüklenemedi",
            variant: "destructive",
          });
          throw error;
        }
        
        if (data) {
          // Make sure that items are properly parsed
          let parsedData = data;
          if (typeof data.items === 'string') {
            try {
              parsedData = {
                ...data,
                items: JSON.parse(data.items)
              };
            } catch (e) {
              console.error("Failed to parse items:", e);
            }
          }
          
          setProposal(parsedData);
          
          // Initialize order items from proposal items
          if (parsedData.items && Array.isArray(parsedData.items)) {
            setOrderItems(parsedData.items);
          }
        }
      } catch (error) {
        console.error("Error fetching proposal:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposalData();
  }, [proposalId, toast]);

  const handleCreateOrder = () => {
    // In a real implementation, this would create an order
    toast({
      title: "Başarılı",
      description: "Sipariş başarıyla oluşturuldu",
    });
  };
  
  const handleSaveDraft = () => {
    toast({
      title: "Kaydedildi",
      description: "Sipariş taslak olarak kaydedildi",
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {proposalId ? "Tekliften Sipariş Oluştur" : "Yeni Sipariş Oluştur"}
        </h2>
        
        {!proposalId && (
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md mb-4">
            Not: Direkt sipariş oluşturuyorsunuz. Tekliften sipariş oluşturmak için önce teklif detay sayfasından "Siparişe Çevir" butonunu kullanabilirsiniz.
          </div>
        )}
      </div>
      
      <OrderCustomerInfo customer={proposal?.customer} />
      
      <Separator className="my-6" />
      
      <OrderItemsTable items={orderItems} setItems={setOrderItems} currency={proposal?.currency || "TRY"} />
      
      <Separator className="my-6" />
      
      <OrderPaymentInfo proposal={proposal} />
      
      <OrderSummary items={orderItems} currency={proposal?.currency || "TRY"} />
      
      <div className="flex justify-end space-x-3 mt-8">
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-2" />
          Taslak Olarak Kaydet
        </Button>
        <Button onClick={handleCreateOrder}>
          <Send className="h-4 w-4 mr-2" />
          Siparişi Oluştur
        </Button>
      </div>
    </div>
  );
};

export default OrderForm;
