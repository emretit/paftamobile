
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
import { CalendarIcon, ClockIcon, User2Icon, DollarSign, X } from "lucide-react";

interface ProposalDetailSheetProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalDetailSheet = ({ proposal, isOpen, onClose }: ProposalDetailSheetProps) => {
  const [formData, setFormData] = useState<Proposal | null>(null);
  const { updateProposalStatus, isUpdating } = useProposalStatusUpdate();

  useEffect(() => {
    if (proposal) {
      setFormData(proposal);
    }
  }, [proposal]);

  const handleStatusChange = (status: ProposalStatus) => {
    if (!formData) return;
    
    // Update local state immediately for responsive UI
    const updatedData = { ...formData, status };
    setFormData(updatedData);
    
    // Call the mutation to update the server
    if (formData.id) {
      updateProposalStatus.mutate({ 
        proposalId: formData.id, 
        status 
      });
    }
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
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="details" className="rounded-md">Detaylar</TabsTrigger>
                <TabsTrigger value="items" className="rounded-md">Kalemler</TabsTrigger>
                <TabsTrigger value="notes" className="rounded-md">Notlar</TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <div className="p-6 pt-2">
            <TabsContent value="details" className="mt-0 p-0">
              <ProposalDetailsTab 
                proposal={formData} 
                onStatusChange={handleStatusChange} 
                isUpdating={isUpdating}
              />
            </TabsContent>

            <TabsContent value="items" className="mt-0 p-0">
              <ProposalItemsTab proposal={formData} />
            </TabsContent>

            <TabsContent value="notes" className="mt-0 p-0">
              <ProposalNotesTab proposal={formData} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="sticky bottom-0 bg-white border-t p-4 mt-auto">
          <Button variant="outline" onClick={onClose} className="w-full">Kapat</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
