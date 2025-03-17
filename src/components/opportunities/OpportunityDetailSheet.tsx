
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Maximize2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Opportunity, OpportunityStatus, opportunityStatusLabels } from "@/types/crm";
import { createTaskForOpportunity } from "@/services/crmWorkflowService";
import { mockOpportunitiesAPI } from "@/services/mockCrmService";

interface OpportunityDetailSheetProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OpportunityDetailSheet = ({ 
  opportunity, 
  isOpen, 
  onClose 
}: OpportunityDetailSheetProps) => {
  const [currentStatus, setCurrentStatus] = useState<OpportunityStatus | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<Opportunity>>({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Set the current status when the opportunity changes
  useEffect(() => {
    if (opportunity) {
      setCurrentStatus(opportunity.status as OpportunityStatus);
      setEditingValues(opportunity);
    }
  }, [opportunity]);

  const updateOpportunityMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      data = {} 
    }: { 
      id: string; 
      status?: OpportunityStatus;
      data?: Partial<Opportunity>;
    }) => {
      const updateData = { ...data };
      
      if (status) {
        updateData.status = status;
      }
      
      const { data: updatedOpportunity, error } = await mockOpportunitiesAPI.updateOpportunity(id, updateData);
        
      if (error) throw error;
      
      return { id, status, previousStatus: opportunity?.status };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      
      // If status has changed, create a corresponding task
      if (result.status && result.status !== result.previousStatus && opportunity) {
        await createTaskForOpportunity(
          opportunity.id,
          opportunity.title,
          opportunity.status as OpportunityStatus,
          opportunity.employee_id
        );
      }
      
      toast.success('Fırsat güncellendi');
    },
    onError: (error) => {
      toast.error('Fırsat güncellenirken bir hata oluştu');
      console.error('Error updating opportunity:', error);
    }
  });

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as OpportunityStatus);
  };

  const handleSaveStatus = async () => {
    if (!opportunity || !currentStatus || currentStatus === opportunity.status) return;
    
    await updateOpportunityMutation.mutateAsync({
      id: opportunity.id,
      status: currentStatus
    });
  };

  const handleInputChange = (field: keyof Opportunity, value: any) => {
    setEditingValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!opportunity) return;
    
    await updateOpportunityMutation.mutateAsync({
      id: opportunity.id,
      data: editingValues
    });
  };

  const handleViewFullDetails = () => {
    if (opportunity) {
      navigate(`/opportunities/${opportunity.id}`);
      onClose();
    }
  };

  if (!opportunity) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl md:max-w-2xl overflow-y-auto border-l border-red-100 bg-gradient-to-b from-white to-red-50/30">
        <SheetHeader className="text-left border-b pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-xl text-red-900">{opportunity.title}</SheetTitle>
              <div className="flex items-center mt-1 text-muted-foreground">
                <span className="mr-2">
                  {opportunity.customer?.name || "Müşteri atanmamış"}
                </span>
                <span className="text-sm px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                  {opportunityStatusLabels[opportunity.status]}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewFullDetails}
              className="ml-auto border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              Tam Görünüm
            </Button>
          </div>
          
          <div className="flex items-end justify-between mt-4 pt-4 gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-2 text-red-700">Fırsat Durumu</p>
              <Select 
                value={currentStatus || opportunity.status} 
                onValueChange={handleStatusChange}
                disabled={updateOpportunityMutation.isPending}
              >
                <SelectTrigger className="w-full border-red-200 focus:ring-red-200">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(opportunityStatusLabels).map(([status, label]) => (
                    <SelectItem key={status} value={status}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSaveStatus}
              disabled={updateOpportunityMutation.isPending || currentStatus === opportunity.status}
              className="bg-red-800 text-white hover:bg-red-900"
            >
              <Save className="mr-2 h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </SheetHeader>
        
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-2 mb-6 bg-red-100/50">
            <TabsTrigger 
              value="details"
              className="data-[state=active]:bg-red-200 data-[state=active]:text-red-900"
            >
              Detaylar
            </TabsTrigger>
            <TabsTrigger 
              value="notes"
              className="data-[state=active]:bg-red-200 data-[state=active]:text-red-900"
            >
              Notlar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="space-y-4">
              <div>
                <Label className="text-red-800">Başlık</Label>
                <Input 
                  value={editingValues.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="border-red-200 focus:border-red-300 focus:ring-red-100" 
                />
              </div>
              
              <div>
                <Label className="text-red-800">Açıklama</Label>
                <Textarea 
                  value={editingValues.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="border-red-200 focus:border-red-300 focus:ring-red-100" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-red-800">Öncelik</Label>
                  <Select 
                    value={editingValues.priority || opportunity.priority}
                    onValueChange={(val) => handleInputChange("priority", val)}
                  >
                    <SelectTrigger className="border-red-200 focus:ring-red-100">
                      <SelectValue placeholder="Öncelik seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-red-800">Tahmini Değer</Label>
                  <Input 
                    type="number" 
                    value={editingValues.value ?? opportunity.value}
                    onChange={(e) => handleInputChange("value", parseFloat(e.target.value))}
                    className="border-red-200 focus:border-red-300 focus:ring-red-100" 
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-red-800">Beklenen Kapanış Tarihi</Label>
                <Input 
                  type="date" 
                  value={editingValues.expected_close_date?.split('T')[0] || ""}
                  onChange={(e) => handleInputChange("expected_close_date", e.target.value)}
                  className="border-red-200 focus:border-red-300 focus:ring-red-100" 
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleSaveChanges}
                disabled={updateOpportunityMutation.isPending}
                className="bg-red-800 text-white hover:bg-red-900"
              >
                <Save className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="notes">
            <div className="space-y-4">
              <div>
                <Label className="text-red-800">Notlar</Label>
                <Textarea 
                  value={editingValues.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="min-h-[200px] border-red-200 focus:border-red-300 focus:ring-red-100" 
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleSaveChanges}
                disabled={updateOpportunityMutation.isPending}
                className="bg-red-800 text-white hover:bg-red-900"
              >
                <Save className="mr-2 h-4 w-4" />
                Notları Kaydet
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <SheetFooter className="flex justify-end pt-4 mt-6 border-t">
          <Button 
            onClick={handleViewFullDetails}
            variant="outline" 
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            Tam Görünüm
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default OpportunityDetailSheet;
