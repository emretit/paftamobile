
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProposalFormData, ProposalItem } from "@/types/proposal-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

type DatabaseProposal = {
  title: string;
  customer_id: string | null;
  supplier_id: string | null;
  status: string;
  total_value: number;
  valid_until: string | null;
  payment_term: string | null;
  internal_notes: string | null;
  items: ProposalItem[];
  discounts: number;
  additional_charges: number;
  files: string[];
}

export const useProposalForm = () => {
  const navigate = useNavigate();

  const createProposal = useMutation({
    mutationFn: async (data: ProposalFormData) => {
      try {
        const proposalData: Omit<DatabaseProposal, 'items' | 'files'> & { 
          items: Json, 
          files: Json 
        } = {
          title: data.title,
          customer_id: data.customer_id,
          supplier_id: data.supplier_id,
          status: data.status,
          total_value: calculateTotalValue(data),
          valid_until: data.validUntil?.toISOString() || null,
          payment_term: data.paymentTerm,
          internal_notes: data.internalNotes,
          items: data.items as unknown as Json,
          discounts: data.discounts,
          additional_charges: data.additionalCharges,
          files: [] as unknown as Json
        };

        const { data: proposal, error: proposalError } = await supabase
          .from("proposals")
          .insert([proposalData])
          .select()
          .single();

        if (proposalError) throw proposalError;

        if (data.files.length > 0) {
          const uploadPromises = data.files.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${proposal.id}/${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase
              .storage
              .from('proposal-files')
              .upload(fileName, file);

            if (uploadError) throw uploadError;
            return fileName;
          });

          const uploadedFiles = await Promise.all(uploadPromises);
          
          const { error: updateError } = await supabase
            .from("proposals")
            .update({ files: uploadedFiles })
            .eq("id", proposal.id);

          if (updateError) throw updateError;
        }

        return proposal;
      } catch (error) {
        console.error("Error in createProposal:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Teklif başarıyla oluşturuldu");
      navigate("/proposals");
    },
    onError: (error) => {
      console.error("Error creating proposal:", error);
      toast.error("Teklif oluşturulurken bir hata oluştu");
    },
  });

  const saveDraft = useMutation({
    mutationFn: async (data: ProposalFormData) => {
      try {
        const proposalData: Omit<DatabaseProposal, 'items' | 'files'> & { 
          items: Json, 
          files: Json 
        } = {
          title: data.title,
          customer_id: data.customer_id,
          supplier_id: data.supplier_id,
          status: "draft",
          total_value: calculateTotalValue(data),
          valid_until: data.validUntil?.toISOString() || null,
          payment_term: data.paymentTerm,
          internal_notes: data.internalNotes,
          items: data.items as unknown as Json,
          discounts: data.discounts,
          additional_charges: data.additionalCharges,
          files: [] as unknown as Json
        };

        const { error } = await supabase
          .from("proposals")
          .insert([proposalData]);

        if (error) throw error;
      } catch (error) {
        console.error("Error in saveDraft:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Taslak başarıyla kaydedildi");
    },
    onError: (error) => {
      console.error("Error saving draft:", error);
      toast.error("Taslak kaydedilirken bir hata oluştu");
    },
  });

  return {
    createProposal,
    saveDraft,
  };
};

const calculateTotalValue = (data: ProposalFormData): number => {
  const itemsTotal = data.items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unitPrice;
    const tax = subtotal * (item.taxRate / 100);
    return sum + subtotal + tax;
  }, 0);
  return itemsTotal + data.additionalCharges - data.discounts;
};
