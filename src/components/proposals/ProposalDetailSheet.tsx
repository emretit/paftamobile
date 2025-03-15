
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Proposal, ProposalStatus } from "@/types/proposal";
import { ProposalBasicInfo } from "./detail/ProposalBasicInfo";
import { ProposalDetailsTab } from "./detail/ProposalDetailsTab";
import { ProposalItemsTab } from "./detail/ProposalItemsTab";
import { ProposalNotesTab } from "./detail/ProposalNotesTab";
import { StatusBadge } from "./detail/StatusBadge";
import { useProposalStatusUpdate } from "@/hooks/useProposalStatusUpdate";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, ClockIcon, User2Icon, DollarSign } from "lucide-react";

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
        <div className="p-6 pb-0">
          <SheetHeader>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Teklif #{formData.proposal_number}
                </h2>
                <StatusBadge status={formData.status} />
              </div>
            </div>
          </SheetHeader>
          
          <div className="py-4">
            <h3 className="text-xl font-bold mb-4">{formData.title}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
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
        </div>

        <Tabs defaultValue="details" className="w-full">
          <div className="border-b px-6">
            <TabsList className="grid grid-cols-3 w-full bg-white rounded-none h-12">
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Teklif Detayları</TabsTrigger>
              <TabsTrigger value="items" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Kalemler</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Notlar</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
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

        <div className="p-6 border-t mt-auto">
          <Button variant="outline" onClick={onClose} className="w-full">Kapat</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
