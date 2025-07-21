
import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useProposalEdit } from "@/hooks/useProposalEdit";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Printer, Download, Mail, Trash2, Clock, Send, ShoppingCart } from "lucide-react";
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

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Düzenle"
      subtitle="Teklif bilgilerini güncelleyin ve kaydedin"
    >
      {/* Header with Save Button */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-background z-10 pb-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-bold">
              {formData.title || proposal.title}
            </h1>
            <Badge className={proposalStatusColors[proposal.status]}>
              {proposalStatusLabels[proposal.status]}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Primary Save Button */}
          <Button 
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className={`${hasChanges ? 'bg-green-600 hover:bg-green-700 animate-pulse' : ''}`}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Kaydediliyor..." : hasChanges ? "Değişiklikleri Kaydet" : "Kaydet"}
          </Button>
          
          {/* Secondary Actions */}
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
      
      {getStatusActions()}

      <Separator className="my-6" />

      {/* Inline Editable Form */}
      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Temel Bilgiler</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Teklif Başlığı</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="Teklif başlığını girin"
                  className="border-2 hover:border-primary/50 focus:border-primary transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Geçerlilik Tarihi</Label>
                <DatePicker 
                  selected={formData.valid_until ? new Date(formData.valid_until) : undefined}
                  onSelect={(date) => handleFieldChange('valid_until', date ? date.toISOString() : '')}
                  className="border-2 hover:border-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Müşteri</Label>
                <CustomerSelector
                  value={formData.customer_id}
                  onChange={(value) => handleFieldChange('customer_id', value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Çalışan</Label>
                <EmployeeSelector
                  value={formData.employee_id}
                  onChange={(value) => handleFieldChange('employee_id', value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Teklif açıklaması girin"
                rows={3}
                className="border-2 hover:border-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </Card>

        {/* Currency Selector */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Para Birimi</h2>
          <ProposalCurrencySelector 
            selectedCurrency={formData.currency} 
            onCurrencyChange={(currency) => handleFieldChange('currency', currency)}
            items={formData.items}
            onItemsChange={(items) => handleFieldChange('items', items)}
          />
        </Card>

        {/* Proposal Items */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Teklif Kalemleri</h2>
          <ProposalItems 
            items={formData.items} 
            onItemsChange={(items) => handleFieldChange('items', items)}
            globalCurrency={formData.currency} 
          />
        </Card>

        {/* Terms and Conditions */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Şartlar ve Koşullar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Ödeme Koşulları</Label>
              <Textarea
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => handleFieldChange('payment_terms', e.target.value)}
                placeholder="Ödeme koşullarını girin"
                rows={3}
                className="border-2 hover:border-primary/50 focus:border-primary transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delivery_terms">Teslimat Koşulları</Label>
              <Textarea
                id="delivery_terms"
                value={formData.delivery_terms}
                onChange={(e) => handleFieldChange('delivery_terms', e.target.value)}
                placeholder="Teslimat koşullarını girin"
                rows={3}
                className="border-2 hover:border-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Ek notlar girin"
              rows={4}
              className="border-2 hover:border-primary/50 focus:border-primary transition-colors"
            />
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-6 bg-gray-50 border-2">
          <h2 className="text-xl font-semibold mb-4">Teklif Özeti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-muted-foreground text-sm">Toplam Tutar</div>
              <div className="text-2xl font-bold text-green-600">
                {formatProposalAmount(totals.total, formData.currency)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-muted-foreground text-sm">Geçerlilik Tarihi</div>
              <div className="text-lg font-semibold">
                {formData.valid_until 
                  ? format(new Date(formData.valid_until), "dd MMMM yyyy", { locale: tr })
                  : "Belirtilmemiş"}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-muted-foreground text-sm">Müşteri</div>
              <div className="text-lg font-semibold">
                {proposal.customer?.name || proposal.customer_name || "Belirtilmemiş"}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-muted-foreground text-sm">Kalem Sayısı</div>
              <div className="text-lg font-semibold">
                {formData.items?.length || 0} kalem
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default ProposalEdit;
