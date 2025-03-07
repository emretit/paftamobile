
import { useState, useEffect } from "react";
import { Save, Calendar, FileText, Building, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatMoney } from "@/components/deals/utils";
import type { Proposal, ProposalStatus } from "@/types/proposal";

interface ProposalDetailSheetProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalDetailSheet = ({ proposal, isOpen, onClose }: ProposalDetailSheetProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Proposal | null>(null);

  useEffect(() => {
    if (proposal) {
      setFormData(proposal);
    }
  }, [proposal]);

  const updateProposalMutation = useMutation({
    mutationFn: async (updatedProposal: Partial<Proposal>) => {
      if (!proposal?.id) throw new Error('Proposal ID is required');

      const { data, error } = await supabase
        .from('proposals')
        .update(updatedProposal as any)
        .eq('id', proposal.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Teklif başarıyla güncellendi');
    },
    onError: (error) => {
      toast.error('Teklif güncellenirken bir hata oluştu');
      console.error('Update error:', error);
    }
  });

  const handleStatusChange = (status: ProposalStatus) => {
    if (!formData) return;
    const updatedData = { ...formData, status };
    setFormData(updatedData);
    updateProposalMutation.mutate({ status });
  };

  if (!formData) return null;

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (status) {
      case "draft":
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Taslak</span>;
      case "new":
      case "discovery_scheduled":
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Keşif Planlandı</span>;
      case "meeting_completed":
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>Görüşme Tamamlandı</span>;
      case "quote_in_progress":
        return <span className={`${baseClasses} bg-violet-100 text-violet-800`}>Teklif Hazırlanıyor</span>;
      case "sent":
      case "quote_sent":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Teklif Gönderildi</span>;
      case "negotiation":
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Müzakere Aşaması</span>;
      case "accepted":
      case "approved":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Onaylandı</span>;
      case "rejected":
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Reddedildi</span>;
      case "converted_to_order":
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>Siparişe Dönüştü</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Teklif #{formData.proposal_number}
            </h2>
            {getStatusBadge(formData.status)}
          </div>
        </SheetHeader>
        
        <div className="py-4">
          <h3 className="text-xl font-semibold mb-2">{formData.title}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="h-4 w-4" />
              <span>{formData.customer?.name || 'Belirtilmemiş'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {formData.created_at ? format(new Date(formData.created_at), 'dd.MM.yyyy') : 'Belirtilmemiş'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard className="h-4 w-4" />
              <span>{formatMoney(formData.total_value)}</span>
            </div>
            
            {formData.valid_until && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  Geçerlilik: {format(new Date(formData.valid_until), 'dd.MM.yyyy')}
                </span>
              </div>
            )}
          </div>

          <Tabs defaultValue="details">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="details" className="flex-1">Teklif Detayları</TabsTrigger>
              <TabsTrigger value="items" className="flex-1">Kalemler</TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">Notlar</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-2">Durum Güncelle</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant={formData.status === 'discovery_scheduled' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('discovery_scheduled')}
                  >
                    Keşif Planlandı
                  </Button>
                  <Button 
                    size="sm" 
                    variant={formData.status === 'meeting_completed' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('meeting_completed')}
                  >
                    Görüşme Tamamlandı
                  </Button>
                  <Button 
                    size="sm" 
                    variant={formData.status === 'quote_in_progress' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('quote_in_progress')}
                  >
                    Teklif Hazırlanıyor
                  </Button>
                  <Button 
                    size="sm" 
                    variant={formData.status === 'quote_sent' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('quote_sent')}
                  >
                    Teklif Gönderildi
                  </Button>
                  <Button 
                    size="sm" 
                    variant={formData.status === 'negotiation' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('negotiation')}
                  >
                    Müzakere Aşaması
                  </Button>
                  <Button 
                    size="sm" 
                    variant={formData.status === 'approved' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('approved')}
                  >
                    Onaylandı
                  </Button>
                  <Button 
                    size="sm" 
                    variant={formData.status === 'rejected' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('rejected')}
                  >
                    Reddedildi
                  </Button>
                  <Button 
                    size="sm" 
                    variant={formData.status === 'converted_to_order' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('converted_to_order')}
                  >
                    Siparişe Dönüştü
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-2">Ödeme Koşulları</h4>
                <p className="text-sm text-gray-600">
                  {formData.payment_term || 'Belirtilmemiş'}
                </p>
              </div>

              {formData.employee && (
                <div className="rounded-md border p-4">
                  <h4 className="font-medium mb-2">Satış Temsilcisi</h4>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {formData.employee.first_name?.charAt(0)}{formData.employee.last_name?.charAt(0)}
                    </div>
                    <span>{formData.employee.first_name} {formData.employee.last_name}</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              {formData.items && Array.isArray(formData.items) && formData.items.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Ürün</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Adet</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Birim Fiyat</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {formData.items.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-3 py-2 text-sm">{item.name}</td>
                          <td className="px-3 py-2 text-sm text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-sm text-right">{formatMoney(item.unit_price)}</td>
                          <td className="px-3 py-2 text-sm text-right">{formatMoney(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-sm font-medium text-right">Toplam</td>
                        <td className="px-3 py-2 text-sm font-medium text-right">{formatMoney(formData.total_value)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Bu teklifte ürün bulunmuyor
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              {formData.internal_notes ? (
                <div className="rounded-md border p-4">
                  <h4 className="font-medium mb-2">İç Notlar</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {formData.internal_notes}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Bu teklife ait notlar bulunmuyor
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose}>Kapat</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
