
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProposalFormData, ProposalItem } from "@/types/proposal-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { Proposal } from "@/types/proposal";

type DatabaseProposal = {
  title: string;
  customer_id: string | null;
  supplier_id: string | null;
  employee_id: string | null;
  status: string;
  total_value: number;
  valid_until: string | null;
  payment_term: string | null;
  internal_notes: string | null;
  items: ProposalItem[];
  discounts: number;
  additional_charges: number;
}

export const useProposalForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getProposal = async (id: string): Promise<Proposal> => {
    try {
      const { data, error } = await supabase
        .from("proposals")
        .select("*, customer:customer_id(*), employee:employee_id(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as Proposal;
    } catch (error) {
      console.error("Error fetching proposal:", error);
      throw error;
    }
  };

  const proposalQuery = (id: string) => useQuery({
    queryKey: ["proposal", id],
    queryFn: () => getProposal(id),
    enabled: !!id,
  });

  const createProposal = useMutation({
    mutationFn: async (data: ProposalFormData) => {
      try {
        // Filter out empty IDs to prevent database errors
        const customerId = data.partnerType === "customer" && data.customer_id ? data.customer_id : null;
        const supplierId = data.partnerType === "supplier" && data.supplier_id ? data.supplier_id : null;
        const employeeId = data.employee_id ? data.employee_id : null;
        
        const proposalData: Omit<DatabaseProposal, 'items'> & { 
          items: Json
        } = {
          title: data.title || "Untitled Proposal",
          customer_id: customerId,
          supplier_id: supplierId,
          employee_id: employeeId,
          status: data.status,
          total_value: calculateTotalValue(data),
          valid_until: data.validUntil?.toISOString() || null,
          payment_term: data.paymentTerm,
          internal_notes: data.internalNotes,
          items: data.items as unknown as Json,
          discounts: data.discounts || 0,
          additional_charges: data.additionalCharges || 0,
        };

        const { data: proposal, error: proposalError } = await supabase
          .from("proposals")
          .insert([proposalData])
          .select()
          .single();

        if (proposalError) throw proposalError;

        if (data.files && data.files.length > 0) {
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
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Teklif başarıyla oluşturuldu");
      navigate("/proposals");
    },
    onError: (error) => {
      console.error("Error creating proposal:", error);
      toast.error("Teklif oluşturulurken bir hata oluştu");
    },
  });

  const updateProposal = async (id: string, data: ProposalFormData) => {
    try {
      // Filter out empty IDs to prevent database errors
      const customerId = data.partnerType === "customer" && data.customer_id ? data.customer_id : null;
      const supplierId = data.partnerType === "supplier" && data.supplier_id ? data.supplier_id : null;
      const employeeId = data.employee_id ? data.employee_id : null;
      
      const proposalData: Omit<DatabaseProposal, 'items'> & { 
        items: Json
      } = {
        title: data.title || "Untitled Proposal",
        customer_id: customerId,
        supplier_id: supplierId,
        employee_id: employeeId,
        status: data.status,
        total_value: calculateTotalValue(data),
        valid_until: data.validUntil?.toISOString() || null,
        payment_term: data.paymentTerm,
        internal_notes: data.internalNotes,
        items: data.items as unknown as Json,
        discounts: data.discounts || 0,
        additional_charges: data.additionalCharges || 0,
      };

      const { error: updateError } = await supabase
        .from("proposals")
        .update(proposalData)
        .eq("id", id);

      if (updateError) throw updateError;

      if (data.files && data.files.length > 0) {
        // First delete existing files
        const { error: deleteError } = await supabase
          .storage
          .from('proposal-files')
          .remove([`${id}/*`]);

        if (deleteError) console.warn("Error removing existing files:", deleteError);

        // Upload new files
        const uploadPromises = data.files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase
            .storage
            .from('proposal-files')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          return fileName;
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        
        const { error: fileUpdateError } = await supabase
          .from("proposals")
          .update({ files: uploadedFiles })
          .eq("id", id);

        if (fileUpdateError) throw fileUpdateError;
      }

      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal", id] });
      
      toast.success("Teklif başarıyla güncellendi");
      navigate("/proposals");
      
      return true;
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast.error("Teklif güncellenirken bir hata oluştu");
      throw error;
    }
  };

  const saveDraft = useMutation({
    mutationFn: async (data: ProposalFormData) => {
      try {
        // Filter out empty IDs to prevent database errors
        const customerId = data.partnerType === "customer" && data.customer_id ? data.customer_id : null;
        const supplierId = data.partnerType === "supplier" && data.supplier_id ? data.supplier_id : null;
        const employeeId = data.employee_id ? data.employee_id : null;

        const proposalData: Omit<DatabaseProposal, 'items'> & { 
          items: Json
        } = {
          title: data.title || "Untitled Proposal",
          customer_id: customerId,
          supplier_id: supplierId,
          employee_id: employeeId,
          status: "draft",
          total_value: calculateTotalValue(data),
          valid_until: data.validUntil?.toISOString() || null,
          payment_term: data.paymentTerm,
          internal_notes: data.internalNotes,
          items: data.items as unknown as Json,
          discounts: data.discounts || 0,
          additional_charges: data.additionalCharges || 0,
        };

        const { data: proposal, error } = await supabase
          .from("proposals")
          .insert([proposalData])
          .select();

        if (error) throw error;
        
        console.log("Draft proposal saved:", proposal);
        
        queryClient.invalidateQueries({ queryKey: ["proposals"] });
        return proposal;
      } catch (error) {
        console.error("Error in saveDraft:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Taslak başarıyla kaydedildi");
      navigate("/proposals");
    },
    onError: (error) => {
      console.error("Error saving draft:", error);
      toast.error("Taslak kaydedilirken bir hata oluştu");
    },
  });

  return {
    createProposal,
    saveDraft,
    getProposal,
    updateProposal,
    proposalQuery,
  };
};

const calculateTotalValue = (data: ProposalFormData): number => {
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = data.items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    return sum + (itemSubtotal * item.taxRate / 100);
  }, 0);
  
  return subtotal + taxAmount - (data.discounts || 0) + (data.additionalCharges || 0);
};
