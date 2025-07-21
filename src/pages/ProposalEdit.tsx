
import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useProposalEdit } from "@/hooks/useProposalEdit";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Printer, Download, Mail, Trash2, Clock, Send, ShoppingCart, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { proposalStatusColors, proposalStatusLabels, ProposalStatus } from "@/types/proposal";
import { calculateProposalTotals, formatProposalAmount } from "@/services/workflow/proposalWorkflow";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { handleProposalStatusChange } from "@/services/workflow/proposalWorkflow";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "@/components/ui/date-picker";
import CustomerSelector from "@/components/proposals/form/CustomerSelector";
import EmployeeSelector from "@/components/proposals/form/EmployeeSelector";
import ProposalItems from "@/components/proposals/form/items/ProposalItems";
import ProposalCurrencySelector from "@/components/proposals/form/ProposalCurrencySelector";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import ProposalForm from "@/components/proposals/form/ProposalForm";

interface ProposalEditProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalEdit = ({ isCollapsed, setIsCollapsed }: ProposalEditProps) => {
  const navigate = useNavigate();
  const { proposal, loading, saving, handleBack, handleSave } = useProposalEdit();
  
  // Form state for inline editing
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    valid_until: "",
    payment_terms: "",
    delivery_terms: "",
    notes: "",
    customer_id: "",
    employee_id: "",
    items: [],
    currency: "TRY"
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when proposal loads
  useEffect(() => {
    if (proposal) {
      setFormData({
        title: proposal.title || "",
        description: proposal.description || "",
        valid_until: proposal.valid_until || "",
        payment_terms: proposal.payment_terms || "",
        delivery_terms: proposal.delivery_terms || "",
        notes: proposal.notes || "",
        customer_id: proposal.customer_id || "",
        employee_id: proposal.employee_id || "",
        items: proposal.items || [],
        currency: proposal.currency || "TRY"
      });
    }
  }, [proposal]);

  // Track changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  // Save function
  const handleSaveChanges = async () => {
    if (!proposal || !hasChanges) return;
    
    try {
      setIsSaving(true);
      
      const totals = calculateProposalTotals(formData.items || []);
      
      const updatedFormData = {
        ...formData,
        status: proposal.status,
        total_amount: totals.total
      };
      
      await handleSave(updatedFormData);
      setHasChanges(false);
      toast.success("Teklif başarıyla kaydedildi");
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast.error("Teklif kaydedilirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        title="Teklif Yükleniyor"
        subtitle="Lütfen bekleyin..."
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
        title="Teklif Bulunamadı"
        subtitle="İstediğiniz teklif mevcut değil"
      >
        <div className="flex flex-col items-center justify-center h-[600px]">
          <h2 className="text-xl font-semibold mb-2">Teklif Bulunamadı</h2>
          <p className="text-muted-foreground mb-6">İstediğiniz teklif mevcut değil veya erişim izniniz yok.</p>
          <Button onClick={handleBack}>Teklifler Sayfasına Dön</Button>
        </div>
      </DefaultLayout>
    );
  }

  const totals = formData.items && formData.items.length > 0 
    ? calculateProposalTotals(formData.items)
    : { subtotal: 0, taxAmount: 0, total: proposal.total_amount || 0 };

  const handleStatusChange = async (newStatus: ProposalStatus) => {
    if (!proposal) return;
    
    try {
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

  const handleDelete = () => {
    toast.success("Teklif silindi");
    navigate("/proposals");
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
        <Button key="send" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange('sent')}>
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
        <Button key="send" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange('sent')}>
          <Send className="h-4 w-4 mr-2" />
          Müşteriye Gönder
        </Button>
      );
      actions.push(
        <Button key="draft" variant="outline" onClick={() => handleStatusChange('draft')}>
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

  const handleFormSave = async (formData: any) => {
    await handleSave(formData);
    toast.success("Teklif başarıyla güncellendi");
  };

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Düzenle"
      subtitle="Teklif bilgilerini güncelleyin ve kaydedin"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Teklifler
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Teklif Düzenle</h1>
              <Badge className={proposalStatusColors[proposal.status]}>
                {proposalStatusLabels[proposal.status]}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Teklif Sil</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu teklifi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleBack}>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Status Actions */}
      {getStatusActions()}

      {/* Main Content */}
      <div className="space-y-6">
        <Card className="p-6 hover:shadow-sm transition-shadow">
          <div id="proposal-form">
            <ProposalForm
              proposal={proposal}
              loading={loading}
              saving={saving}
              isNew={false}
              onSave={handleFormSave}
              onBack={handleBack}
              title="Teklif Düzenle"
              subtitle="Teklif bilgilerini güncelleyin"
            />
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default ProposalEdit;
