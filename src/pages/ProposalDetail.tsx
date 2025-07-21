
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { mockCrmService } from "@/services/mockCrm";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  FileText, 
  Printer, 
  Download, 
  Mail,
  Edit,
  Trash2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { proposalStatusColors, proposalStatusLabels } from "@/types/proposal";
import ProposalDetailSidePanel from "@/components/proposals/detail/ProposalDetailSidePanel";
import ProposalDetailFullView from "@/components/proposals/detail/ProposalDetailFullView";
import { calculateProposalTotals, formatProposalAmount } from "@/services/workflow/proposalWorkflow";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { handleProposalStatusChange } from "@/services/workflow/proposalWorkflow";

interface ProposalDetailProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalDetail = ({ isCollapsed, setIsCollapsed }: ProposalDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleEdit = () => {
    if (proposal) {
      navigate(`/proposal/${proposal.id}/edit`);
    }
  };

  const handleDelete = () => {
    toast.success("Teklif silindi");
    navigate("/proposals");
  };

  const handleStatusChange = async (newStatus: ProposalStatus) => {
    if (!proposal) return;
    
    try {
      setProposal({
        ...proposal,
        status: newStatus
      });
      
      await handleProposalStatusChange(
        proposal.id,
        proposal.title,
        proposal.opportunity_id || null,
        newStatus,
        proposal.employee_id
      );
      
      toast.success(`Teklif durumu "${proposalStatusLabels[newStatus]}" olarak güncellendi`);
    } catch (error) {
      console.error("Error updating proposal status:", error);
      toast.error("Teklif durumu güncellenirken bir hata oluştu");
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("Yazdırma işlemi başlatıldı");
  };

  const handleDownloadPdf = () => {
    toast.success("PDF indiriliyor");
  };

  const handleSendEmail = () => {
    toast.success("E-posta gönderme penceresi açıldı");
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

  const totals = proposal.items && proposal.items.length > 0 
    ? calculateProposalTotals(proposal.items)
    : { subtotal: 0, taxAmount: 0, total: proposal.total_amount || 0 };

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Detayı"
      subtitle="Teklif detaylarını görüntüleyin"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold">
            {proposal.title}
          </h1>
          <Badge className={proposalStatusColors[proposal.status]}>
            {proposalStatusLabels[proposal.status]}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Yazdır
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            PDF İndir
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            E-posta Gönder
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit} className="bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border-blue-200">
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Teklifi silmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz. Teklif veritabanından tamamen silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProposalDetailFullView 
            proposal={proposal} 
            isEditMode={false} 
            onSave={() => {}}
            saving={false}
          />
        </div>
        <div className="lg:col-span-1">
          <ProposalDetailSidePanel 
            proposal={proposal} 
            onShowFullView={() => {}} 
          />
        </div>
      </div>

      <div className="mt-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Teklif Özeti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm">Toplam Tutar</div>
              <div className="text-2xl font-bold text-red-900">
                {formatProposalAmount(totals.total, proposal.currency)}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm">Geçerlilik Tarihi</div>
              <div className="text-lg font-semibold">
                {proposal.valid_until 
                  ? format(new Date(proposal.valid_until), "dd MMMM yyyy", { locale: tr })
                  : "Belirtilmemiş"}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm">Müşteri</div>
              <div className="text-lg font-semibold">
                {proposal.customer?.name || proposal.customer_name || "Belirtilmemiş"}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm">Oluşturma Tarihi</div>
              <div className="text-lg font-semibold">
                {format(new Date(proposal.created_at), "dd MMMM yyyy", { locale: tr })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default ProposalDetail;
