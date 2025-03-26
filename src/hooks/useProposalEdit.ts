
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { mockCrmService } from "@/services/mockCrm";
import { crmService } from "@/services/crmService";
import { Proposal } from "@/types/proposal";

export const useProposalEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await mockCrmService.getProposalById(id);
        
        if (error) {
          toast.error("Teklif bilgileri yüklenemedi");
          throw error;
        }
        
        if (data) {
          setProposal(data);
        }
      } catch (error) {
        console.error("Error fetching proposal:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposal();
  }, [id]);

  const handleBack = () => {
    navigate(`/proposal/${id}`);
  };

  const handleSave = async (formData: any) => {
    if (!proposal || !id) return;
    
    try {
      setSaving(true);
      
      // Update the proposal with the form data
      const updatedProposal = {
        ...proposal,
        title: formData.title,
        description: formData.description,
        valid_until: formData.valid_until,
        payment_terms: formData.payment_terms,
        delivery_terms: formData.delivery_terms,
        notes: formData.notes,
        status: formData.status,
        currency: formData.currency,
        items: formData.items,
        customer_id: formData.customer_id,
        total_amount: formData.total_amount || proposal.total_amount,
        updated_at: new Date().toISOString()
      };
      
      // Call the update API
      await crmService.updateProposal(id, updatedProposal);
      
      toast.success("Teklif başarıyla güncellendi");
      navigate(`/proposal/${id}`);
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast.error("Teklif güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return {
    proposal,
    loading,
    saving,
    handleBack,
    handleSave
  };
};
