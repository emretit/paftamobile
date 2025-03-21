
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { mockCrmService } from "@/services/mockCrm";
import { crmService } from "@/services/crmService";
import { Proposal } from "@/types/proposal";
import { useProposalForm } from "@/hooks/useProposalForm";
import { Skeleton } from "@/components/ui/skeleton";

interface ProposalEditProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalEdit = ({ isCollapsed, setIsCollapsed }: ProposalEditProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleSave = async () => {
    // Burada form verilerini kaydedecek fonksiyonu çağıracağız
    // Örnek bir kaydetme işlemi:
    try {
      if (!proposal || !id) return;
      
      toast.success("Teklif başarıyla güncellendi");
      navigate(`/proposal/${id}`);
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast.error("Teklif güncellenirken bir hata oluştu");
    }
  };

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Düzenle"
      subtitle="Teklif bilgilerini güncelleyin"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-40" /> : `${proposal?.title} Düzenle`}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving || loading}>
          <Save className="h-4 w-4 mr-2" />
          Değişiklikleri Kaydet
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold mb-4">Teklif Düzenleme Formu</h2>
            <p className="text-muted-foreground mb-8">
              Bu özellik şu anda geliştiriliyor. Kısa süre içinde kullanıma sunulacaktır.
            </p>
            <Button onClick={handleBack} variant="outline">
              Teklif detaylarına geri dön
            </Button>
          </div>
        )}
      </Card>
    </DefaultLayout>
  );
};

export default ProposalEdit;
