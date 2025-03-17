
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProposalTemplate } from "@/types/proposal-template";
import { ProposalFormData } from "@/types/proposal-form";

export const useProposalForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSelectTemplate = (template: ProposalTemplate) => {
    setSelectedTemplate(template);
  };

  const handleCreateProposal = async (data: ProposalFormData) => {
    setIsLoading(true);
    try {
      // Calculate the total value
      const totalValue = data.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        return sum + itemTotal;
      }, 0);

      // Calculate the tax amount
      const taxAmount = data.items.reduce((sum, item) => {
        const itemSubtotal = item.price * item.quantity;
        const itemTax = itemSubtotal * (item.tax_rate / 100);
        return sum + itemTax;
      }, 0);

      // Generate a proposal number
      const proposalNumber = Date.now().toString().slice(-6);

      const { data: proposalData, error } = await supabase
        .from("proposals")
        .insert({
          title: data.title,
          customer_id: data.customer_id,
          employee_id: data.employee_id || null,
          status: data.status || "draft",
          proposal_number: proposalNumber,
          total_value: totalValue,
          tax_amount: taxAmount,
          valid_until: data.validUntil?.toISOString() || null,
          notes: data.notes || null,
          internal_notes: data.internalNotes || null,
          payment_terms: data.paymentTerm || null,
          items: data.items,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Teklif oluşturuldu",
        description: "Teklif başarıyla oluşturuldu",
        className: "bg-green-50 border-green-200",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      
      // Navigate to proposals page or the new proposal detail
      navigate(`/proposals`);
      
      return proposalData;
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast({
        title: "Hata",
        description: "Teklif oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    selectedTemplate,
    setSelectedTemplate,
    handleSelectTemplate,
    handleCreateProposal
  };
};

export default useProposalForm;
