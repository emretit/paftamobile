
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
import { statusStyles, statusLabels } from "../proposals/constants";
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

  // Define the status workflow stages
  const workflowStages: { status: ProposalStatus; label: string }[] = [
    { status: 'discovery_scheduled', label: 'Keşif Planlandı' },
    { status: 'meeting_completed', label: 'Görüşme Tamamlandı' },
    { status: 'quote_in_progress', label: 'Teklif Hazırlanıyor' },
    { status: 'quote_sent', label: 'Teklif Gönderildi' },
    { status: 'negotiation', label: 'Müzakere Aşaması' }
  ];

  // Define the final stages
  const finalStages: { status: ProposalStatus; label: string }[] = [
    { status: 'approved', label: 'Onaylandı' },
    { status: 'rejected', label: 'Reddedildi' },
    { status: 'converted_to_order', label: 'Siparişe Dönüştü' }
  ];

  const getStatusBadge = (status: ProposalStatus) => {
    const style = statusStyles[status];
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${style.bg} ${style.text}`}>
        {statusLabels[status]}
      </span>
    );
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
                <h4 className="font-medium mb-3">Teklif Durumu</h4>
                
                <div className="space-y-4">
                  {/* Workflow progress visualization */}
                  <div className="relative mb-6">
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
                    <div className="flex justify-between relative">
                      {workflowStages.map((stage, index) => {
                        // Calculate active stage based on current status and position
                        const isActive = workflowStages.findIndex(s => s.status === formData.status) >= index;
                        const isPastStage = workflowStages.findIndex(s => s.status === formData.status) > index;
                        
                        return (
                          <div key={stage.status} className="flex flex-col items-center z-10">
                            <button 
                              className={`w-4 h-4 rounded-full ${
                                isPastStage ? 'bg-blue-600' : isActive ? 'bg-blue-500' : 'bg-gray-300'
                              } mb-2`}
                              onClick={() => handleStatusChange(stage.status)}
                              title={stage.label}
                            />
                            <span className="text-xs text-gray-600 whitespace-nowrap px-1">
                              {stage.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Süreç Aşamaları</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {workflowStages.map(stage => (
                        <Button 
                          key={stage.status}
                          size="sm" 
                          variant={formData.status === stage.status ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(stage.status)}
                          className="justify-start"
                        >
                          {stage.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Sonuç Aşamaları</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {finalStages.map(stage => (
                        <Button 
                          key={stage.status}
                          size="sm" 
                          variant={formData.status === stage.status ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(stage.status)}
                          className={`justify-start ${
                            stage.status === 'approved' ? 'bg-green-600 hover:bg-green-700 text-white' : 
                            stage.status === 'rejected' ? 'bg-red-600 hover:bg-red-700 text-white' : 
                            stage.status === 'converted_to_order' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''
                          } ${formData.status !== stage.status ? 'bg-white text-gray-800' : ''}`}
                        >
                          {stage.label}
                        </Button>
                      ))}
                    </div>
                  </div>
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
