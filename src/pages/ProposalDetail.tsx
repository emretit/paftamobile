
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { mockCrmService } from "@/services/mockCrm";
import { Proposal } from "@/types/proposal";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Building, 
  Calendar, 
  CreditCard, 
  Printer, 
  Download, 
  Mail
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { proposalStatusColors, proposalStatusLabels } from "@/types/proposal";
import ProposalDetailSidePanel from "@/components/proposals/detail/ProposalDetailSidePanel";
import ProposalDetailFullView from "@/components/proposals/detail/ProposalDetailFullView";

interface ProposalDetailProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalDetail = ({ isCollapsed, setIsCollapsed }: ProposalDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'side' | 'full'>('side');

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
    navigate("/proposals");
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'side' ? 'full' : 'side');
  };

  if (loading) {
    return (
      <DefaultLayout
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        title="Teklif Detayı"
        subtitle="Teklif yükleniyor..."
      >
        <div className="flex items-center justify-center h-[600px]">
          <div className="w-8 h-8 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
        </div>
      </DefaultLayout>
    );
  }

  if (!proposal) {
    return (
      <DefaultLayout
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        title="Teklif Detayı"
        subtitle="Teklif bulunamadı"
      >
        <div className="flex flex-col items-center justify-center h-[600px]">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Teklif Bulunamadı</h2>
          <p className="text-muted-foreground mb-6">İstediğiniz teklif mevcut değil veya erişim izniniz yok.</p>
          <Button onClick={handleBack}>Teklifler Sayfasına Dön</Button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Detayı"
      subtitle="Teklif detaylarını görüntüleyin ve düzenleyin"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold">
            Teklif: {proposal.title}
          </h1>
          <Badge className={proposalStatusColors[proposal.status]}>
            {proposalStatusLabels[proposal.status]}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Yazdır
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF İndir
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            E-posta Gönder
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {viewMode === 'side' ? (
          <>
            <div className="lg:col-span-2">
              <ProposalDetailFullView proposal={proposal} />
            </div>
            <div className="lg:col-span-1">
              <ProposalDetailSidePanel proposal={proposal} onShowFullView={toggleViewMode} />
            </div>
          </>
        ) : (
          <div className="col-span-3">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Tam Görünüm</h2>
                <Button variant="outline" size="sm" onClick={toggleViewMode}>
                  Side Panel Görünümü
                </Button>
              </div>
              <ProposalDetailFullView proposal={proposal} />
            </Card>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ProposalDetail;
