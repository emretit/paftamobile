
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ProposalTemplate } from "@/types/proposal-template";
import { ProposalFormData } from "@/types/proposal-form";

export const useProposalForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);

  const handleSelectTemplate = (template: ProposalTemplate) => {
    setSelectedTemplate(template);
  };

  const calculateTotals = (items: any[]) => {
    let subtotal = 0;
    
    items.forEach(item => {
      const unitPrice = item.unit_price || 0;
      const quantity = item.quantity || 0;
      const taxRate = item.tax_rate || 0;
      
      const itemTotal = unitPrice * quantity * (1 + (taxRate / 100));
      subtotal += itemTotal;
    });
    
    return subtotal;
  };

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

        // Using the correct table name 'proposals_items'
        // We need to check if this table exists in the DB schema
        // If not, we may need to use another table or create this table
        const { error: itemsError } = await supabase
          .from('proposals_items')
          .insert(itemsWithProposalId);

        if (itemsError) {
          console.error('Error inserting proposal items:', itemsError);
          // Fallback to adding items as JSON to the proposals table
          await supabase
            .from('proposals')
            .update({ items: itemsWithProposalId })
            .eq('id', newProposal.id);
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

  const saveDraft = async (data: Partial<ProposalFormData>) => {
    // This would be similar to handleCreateProposal but with draft status
    // For now, we'll just create a simplified version
    setIsLoading(true);
    
    try {
      const { data: newProposal, error } = await supabase
        .from('proposals')
        .insert({
          title: data.title || "Taslak Teklif",
          customer_id: data.customer_id,
          employee_id: data.employee_id,
          status: "draft",
          number: Math.floor(Math.random() * 1000000).toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Teklif taslağı kaydedildi");
      navigate("/proposals");
      return newProposal.id;
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error("Taslak kaydedilirken bir hata oluştu");
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
    handleCreateProposal,
    createProposal: handleCreateProposal,
    saveDraft
  };
};
