
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ProposalFormData } from "@/types/proposal-form";
import { useProposalCalculations } from "./useProposalCalculations";

export const useProposalCreation = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { calculateTotals } = useProposalCalculations();

  const handleCreateProposal = async (data: ProposalFormData) => {
    setIsLoading(true);
    try {
      // Calculate total amount
      const total = calculateTotals(data.items || []);
      
      // Create proposal record
      const { data: newProposal, error } = await supabase
        .from('proposals')
        .insert({
          title: data.title,
          customer_id: data.customer_id,
          employee_id: data.employee_id,
          status: "draft",
          number: Math.floor(Math.random() * 1000000).toString(),
          total_amount: total,
          currency: "TRY",
          valid_until: data.valid_until,
          payment_terms: data.payment_terms,
          delivery_terms: data.delivery_terms,
          notes: data.notes || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // If we have items, insert them with the new proposal ID
      if (data.items && data.items.length > 0) {
        const itemsWithProposalId = data.items.map(item => ({
          ...item,
          proposal_id: newProposal.id,
          id: uuidv4(),
        }));

        // Add items as items field directly on the proposal
        const { error: updateError } = await supabase
          .from('proposals')
          .update({ items: itemsWithProposalId })
          .eq('id', newProposal.id);

        if (updateError) {
          console.error('Error adding proposal items:', updateError);
        }
      }

      toast.success("Teklif başarıyla oluşturuldu");
      navigate("/proposals");
      return newProposal.id;
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error("Teklif oluşturulurken bir hata oluştu");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createProposal: handleCreateProposal
  };
};
