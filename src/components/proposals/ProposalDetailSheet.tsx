
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Proposal, ProposalStatus } from "@/types/proposal";
import { ProposalDetailsTab } from "./detail/ProposalDetailsTab";
import { ProposalItemsTab } from "./detail/ProposalItemsTab";
import { ProposalNotesTab } from "./detail/ProposalNotesTab";
import { StatusBadge } from "./detail/StatusBadge";
import { useProposalStatusUpdate } from "@/hooks/useProposalStatusUpdate";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, ClockIcon, User2Icon, DollarSign, X, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProposalDetailSheetProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalDetailSheet = ({ proposal, isOpen, onClose }: ProposalDetailSheetProps) => {
  const [formData, setFormData] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const { updateProposalStatus, isUpdating } = useProposalStatusUpdate();
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (proposal) {
      setFormData(proposal);
      setHasChanges(false);
    }
  }, [proposal]);

  const handleStatusChange = (status: ProposalStatus) => {
    if (!formData) return;
    
    // Update local state immediately for responsive UI
    const updatedData = { ...formData, status };
    setFormData(updatedData);
    setHasChanges(true);
  };
  
  const handleNotesChange = (notes: string) => {
    if (!formData) return;
    
    // Update local state immediately for responsive UI
    const updatedData = { ...formData, internal_notes: notes };
    setFormData(updatedData);
    setHasChanges(true);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd.MM.yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Mutation to update both status and notes
  const updateProposalMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string, status: string, notes: string | null }) => {
      const { error } = await supabase
        .from("proposals")
        .update({ 
          status: status,
          internal_notes: notes 
        })
        .eq("id", id);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal", formData?.id] });
      toast.success("Teklif başarıyla güncellendi");
      setHasChanges(false);
    },
    onError: (error) => {
      console.error("Error updating proposal:", error);
      toast.error("Teklif güncellenirken bir hata oluştu");
    }
  });

  const handleSaveChanges = () => {
    if (!formData || !formData.id) return;
    
    updateProposalMutation.mutate({ 
      id: formData.id, 
      status: formData.status,
      notes: formData.internal_notes
    });
  };

  if (!formData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="p-6 pb-4">
            <SheetHeader className="flex flex-row justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Teklif #{formData.proposal_number}
                </h2>
                <StatusBadge status={formData.status} />
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </SheetHeader>
            
            <div className="py-2">
              <h3 className="text-xl font-bold mb-4">{formData.title}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="flex items-center space-x-2">
                  <User2Icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{formData.customer?.name || "Müşteri Belirtilmedi"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{formatDate(formData.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{formatMoney(formData.total_value)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Geçerlilik: {formatDate(formData.valid_until)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="details">Detaylar</TabsTrigger>
                  <TabsTrigger value="items">Kalemler</TabsTrigger>
                  <TabsTrigger value="notes">Notlar</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="details" className="mt-0 p-0">
              <ProposalDetailsTab 
                proposal={formData} 
                onStatusChange={handleStatusChange} 
                isUpdating={isUpdating}
                onNotesChange={handleNotesChange}
              />
            </TabsContent>

            <TabsContent value="items" className="mt-0 p-0">
              <ProposalItemsTab proposal={formData} />
            </TabsContent>

            <TabsContent value="notes" className="mt-0 p-0">
              <ProposalNotesTab proposal={formData} />
            </TabsContent>
          </Tabs>
          
          {hasChanges && (
            <div className="mt-4">
              <Button 
                className="w-full" 
                onClick={handleSaveChanges}
                disabled={updateProposalMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
              </Button>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 mt-auto">
          <Button variant="outline" onClick={onClose} className="w-full">Kapat</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
