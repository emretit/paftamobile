
import React, { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useProposalForm } from "@/hooks/useProposalForm";
import ProposalForm from "@/components/proposals/form/ProposalForm";
import { useProposalEdit } from "@/hooks/useProposalEdit";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Edit, Eye, FileText, User, Building, Calendar, CreditCard, Printer, Download, Mail, Trash2, Clock, Send, ShoppingCart, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { proposalStatusColors, proposalStatusLabels, ProposalStatus } from "@/types/proposal";
import { calculateProposalTotals, formatProposalAmount } from "@/services/workflow/proposalWorkflow";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { handleProposalStatusChange } from "@/services/workflow/proposalWorkflow";
import { useNavigate } from "react-router-dom";

interface ProposalEditProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalEdit = ({ isCollapsed, setIsCollapsed }: ProposalEditProps) => {
  const navigate = useNavigate();
  const { proposal, loading, saving, handleBack, handleSave } = useProposalEdit();
  const { isLoading: isSaving } = useProposalForm();
  const [isEditMode, setIsEditMode] = useState(false);

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
    if (!proposal || isEditMode) return null;
    
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
    if (!proposal || isEditMode) return null;
    
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

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title={isEditMode ? "Teklif Düzenle" : "Teklif Detayı"}
      subtitle={isEditMode ? "Teklif bilgilerini güncelleyin" : "Teklif detaylarını görüntüleyin ve düzenleyin"}
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
              <Button 
                onClick={() => document.getElementById('proposal-form')?.dispatchEvent(
                  new Event('submit', { bubbles: true, cancelable: true })
                )} 
                disabled={saving || isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {(saving || isSaving) ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
                onClick={() => setIsEditMode(true)} 
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border-blue-200"
              >
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
            </>
          )}
        </div>
      </div>
      
      {getStatusActions()}
      {getAdditionalActions()}

      <Separator className="my-6" />

      {isEditMode ? (
        <Card className="p-6">
          <div id="proposal-form">
            <ProposalForm
              proposal={proposal}
              loading={loading}
              saving={saving || isSaving}
              isNew={false}
              onSave={handleSave}
              onBack={handleBack}
              title="Teklif Düzenle"
              subtitle="Teklif bilgilerini güncelleyin"
            />
          </div>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Teklif Bilgileri</TabsTrigger>
              <TabsTrigger value="items">Kalemler</TabsTrigger>
              <TabsTrigger value="summary">Özet</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Teklif Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Teklif Başlığı</label>
                      <p className="text-lg font-semibold">{proposal.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
                      <p className="text-base">{proposal.description || "Açıklama eklenmemiş"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Müşteri</label>
                      <p className="text-lg font-semibold">{proposal.customer?.name || proposal.customer_name || "Belirtilmemiş"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Durum</label>
                      <div className="mt-1">
                        <Badge className={proposalStatusColors[proposal.status]}>
                          {proposalStatusLabels[proposal.status]}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Geçerlilik Tarihi</label>
                      <p className="text-base">
                        {proposal.valid_until 
                          ? format(new Date(proposal.valid_until), "dd MMMM yyyy", { locale: tr })
                          : "Belirtilmemiş"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Para Birimi</label>
                      <p className="text-base">{proposal.currency}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="items" className="mt-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Teklif Kalemleri</h2>
                {proposal.items && proposal.items.length > 0 ? (
                  <div className="space-y-4">
                    {proposal.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="text-center">
                            <label className="text-sm font-medium text-muted-foreground">Miktar</label>
                            <p className="text-lg font-semibold">{item.quantity}</p>
                          </div>
                          <div className="text-center">
                            <label className="text-sm font-medium text-muted-foreground">Birim Fiyat</label>
                            <p className="text-lg font-semibold">{formatProposalAmount(item.unit_price, proposal.currency)}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Toplam:</span>
                          <span className="text-lg font-bold">{formatProposalAmount(item.quantity * item.unit_price, proposal.currency)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Henüz kalem eklenmemiş</p>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="summary" className="mt-6">
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
            </TabsContent>
          </Tabs>
        </>
      )}
    </DefaultLayout>
  );
};

export default ProposalEdit;
