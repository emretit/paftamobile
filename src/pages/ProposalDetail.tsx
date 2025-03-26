import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { mockCrmService } from "@/services/mockCrm";
import { Proposal, ProposalStatus } from "@/types/proposal";
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
  Mail,
  Edit,
  Trash2,
  Clock,
  Send,
  ShoppingCart,
  Save,
  X
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
import { calculateProposalTotals, formatProposalAmount } from "@/services/workflow/proposalWorkflow";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { handleProposalStatusChange } from "@/services/workflow/proposalWorkflow";
import { crmService } from "@/services/crmService";

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
  const [isEditMode, setIsEditMode] = useState(false);
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
    navigate("/proposals");
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'side' ? 'full' : 'side');
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      if (id) {
        fetchProposal();
      }
    }
  };

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

  const handleNavigateToEdit = () => {
    if (proposal) {
      navigate(`/proposal/edit/${proposal.id}`);
      toast.info("Teklif düzenleme sayfasına yönlendiriliyorsunuz");
    }
  };

  const handleSaveChanges = async (updatedData: Partial<Proposal>) => {
    if (!proposal || !id) return;
    
    try {
      setSaving(true);
      
      const updatedProposal = {
        ...proposal,
        ...updatedData,
        updated_at: new Date().toISOString()
      };
      
      await crmService.updateProposal(id, updatedProposal);
      
      setProposal(updatedProposal);
      
      setIsEditMode(false);
      
      toast.success("Teklif başarıyla güncellendi");
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast.error("Teklif güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
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

  const handleSendProposal = () => {
    if (!proposal) return;
    
    handleStatusChange('sent');
    toast.success("Teklif müşteriye gönderildi");
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

  const handleConvertToOrder = () => {
    if (!proposal) return;
    
    navigate(`/orders/purchase?proposalId=${proposal.id}`);
    toast.success("Sipariş oluşturma sayfasına yönlendiriliyorsunuz");
  };

  const getStatusActions = () => {
    if (!proposal) return null;
    
    const actions = [];
    
    if (proposal.status === 'draft') {
      actions.push(
        <Button key="send" className="bg-blue-600 hover:bg-blue-700" onClick={handleSendProposal}>
          <Send className="h-4 w-4 mr-2" />
          Müşteriye Gönder
        </Button>
      );
      actions.push(
        <Button key="pending" variant="outline" onClick={() => handleStatusChange('pending_approval')}>
          <Clock className="h-4 w-4 mr-2" />
          Onaya Gönder
        </Button>
      );
    }
    
    if (proposal.status === 'pending_approval') {
      actions.push(
        <Button key="send" className="bg-blue-600 hover:bg-blue-700" onClick={handleSendProposal}>
          <Send className="h-4 w-4 mr-2" />
          Müşteriye Gönder
        </Button>
      );
      actions.push(
        <Button key="draft" variant="outline" onClick={() => handleStatusChange('draft')}>
          <Edit className="h-4 w-4 mr-2" />
          Taslağa Çevir
        </Button>
      );
    }
    
    if (proposal.status === 'sent') {
      actions.push(
        <Button key="accept" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('accepted')}>
          Kabul Edildi
        </Button>
      );
      actions.push(
        <Button key="reject" variant="destructive" onClick={() => handleStatusChange('rejected')}>
          Reddedildi
        </Button>
      );
    }
    
    return actions.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-4">
        {actions}
      </div>
    ) : null;
  };

  const getAdditionalActions = () => {
    if (!proposal) return null;
    
    const actions = [];
    
    if (proposal.status === 'accepted') {
      actions.push(
        <Button key="convert" onClick={handleConvertToOrder} className="bg-green-600 hover:bg-green-700">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Siparişe Çevir
        </Button>
      );
    }
    
    return actions.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-4">
        {actions}
      </div>
    ) : null;
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
      subtitle="Teklif detaylarını görüntüleyin ve düzenleyin"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-bold">
              {proposal.title}
            </h1>
            <Badge className={proposalStatusColors[proposal.status]}>
              {proposalStatusLabels[proposal.status]}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEditMode ? (
            <>
              <Button onClick={() => handleSaveChanges(proposal)} disabled={saving} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleEditMode} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
            </>
          ) : (
            <>
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleEditMode} 
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border-blue-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenleme Modunu Aç
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
            </>
          )}
        </div>
      </div>
      
      {!isEditMode && getStatusActions && getStatusActions()}
      
      {!isEditMode && getAdditionalActions && getAdditionalActions()}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {viewMode === 'side' ? (
          <>
            <div className="lg:col-span-2">
              <ProposalDetailFullView 
                proposal={proposal} 
                isEditMode={isEditMode} 
                onSave={handleSaveChanges}
                saving={saving}
              />
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
              <ProposalDetailFullView 
                proposal={proposal} 
                isEditMode={isEditMode} 
                onSave={handleSaveChanges}
                saving={saving}
              />
            </Card>
          </div>
        )}
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
