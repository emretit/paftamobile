
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { mockCrmService } from "@/services/mockCrm";
import { crmService } from "@/services/crmService";
import { Proposal } from "@/types/proposal";
import { useProposalForm } from "@/hooks/useProposalForm";
import ProposalFormShared from "@/components/proposals/form/ProposalFormShared";

interface ProposalEditProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalEdit = ({ isCollapsed, setIsCollapsed }: ProposalEditProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isLoading: isSaving } = useProposalForm();

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

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Düzenle"
      subtitle="Teklif bilgilerini güncelleyin"
    >
      <Card className="p-6">
        <CardContent className="p-0">
          <ProposalFormShared 
            proposal={proposal}
            loading={loading}
            saving={saving || isSaving}
            isNew={false}
            onSave={handleSave}
            onBack={handleBack}
          />
        </CardContent>
      </Card>
    </DefaultLayout>
  );
};

export default ProposalEdit;
