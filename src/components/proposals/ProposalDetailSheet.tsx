
import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Proposal } from "@/types/proposal";
import { useProposalStatusUpdate } from "@/hooks/useProposalStatusUpdate";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ProposalStatusShared } from "@/types/shared-types";
import StatusBadge from "./detail/StatusBadge";

interface ProposalDetailSheetProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalDetailSheet = ({ proposal, isOpen, onClose }: ProposalDetailSheetProps) => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState<ProposalStatusShared | null>(null);
  const { mutateAsync, isLoading, error } = useProposalStatusUpdate(proposal?.id || "");
  
  // Update local status when proposal changes
  useEffect(() => {
    if (proposal) {
      setCurrentStatus(proposal.status as ProposalStatusShared);
    }
  }, [proposal]);

  const handleStatusChange = async (newStatus: ProposalStatusShared) => {
    if (!proposal || !newStatus || currentStatus === newStatus) return;
    
    try {
      setCurrentStatus(newStatus);
      await mutateAsync(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      // Reset to previous status on error
      setCurrentStatus(proposal.status as ProposalStatusShared);
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd MMM yyyy", { locale: tr });
    } catch {
      return "-";
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!proposal) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            {proposal.title}
            <div className="mt-1">
              <StatusBadge status={currentStatus || proposal.status} />
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="mt-6 h-[calc(100vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Proposal Details */}
            <div>
              <h3 className="text-sm font-medium mb-2">Teklif Numarası</h3>
              <p>#{proposal.proposal_number}</p>
            </div>
            
            {/* Customer Details */}
            {proposal.customer && (
              <div>
                <h3 className="text-sm font-medium mb-2">Müşteri</h3>
                <p className="font-medium">{proposal.customer.name}</p>
                {proposal.customer.company && (
                  <p className="text-sm text-gray-500">{proposal.customer.company}</p>
                )}
                {proposal.customer.email && (
                  <p className="text-sm text-gray-500 mt-1">{proposal.customer.email}</p>
                )}
              </div>
            )}
            
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Oluşturulma Tarihi</h3>
                <p>{formatDate(proposal.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Geçerlilik Tarihi</h3>
                <p>{formatDate(proposal.valid_until)}</p>
              </div>
            </div>
            
            {/* Financial Details */}
            <div>
              <h3 className="text-sm font-medium mb-2">Toplam Tutar</h3>
              <p className="text-lg font-bold">{formatMoney(proposal.total_value)}</p>
            </div>
            
            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button 
                className="w-full" 
                onClick={() => navigate(`/proposals/${proposal.id}`)}
              >
                Detayları Görüntüle
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusChange("gonderildi" as ProposalStatusShared)}
                  disabled={isLoading || currentStatus === "gonderildi"}
                >
                  Gönderildi Olarak İşaretle
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("accepted" as ProposalStatusShared)}
                  disabled={isLoading || currentStatus === "accepted"}
                >
                  Kabul Edildi
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
