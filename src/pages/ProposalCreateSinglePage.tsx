import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Send, Loader2, Eye, FileText, Calendar, User, Building2, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useProposalCreation } from "@/hooks/proposals/useProposalCreation";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import CustomerSelector from "@/components/proposals/form/CustomerSelector";
import EmployeeSelector from "@/components/proposals/form/EmployeeSelector";
import { cn } from "@/lib/utils";
import ProposalItems from "@/components/proposals/form/items/ProposalItems";

interface ProposalCreateSinglePageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalCreateSinglePage = ({ isCollapsed, setIsCollapsed }: ProposalCreateSinglePageProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const { createProposal } = useProposalCreation();

  // Auto-populated context from URL params
  const customerId = searchParams.get('customer_id');
  const opportunityId = searchParams.get('opportunity_id');

  // Form state
  const [formData, setFormData] = useState({
    // Header Information
    title: "",
    proposal_number: "",
    date: new Date().toISOString().split('T')[0],
    valid_until: "",
    
    // Customer Information
    customer_id: customerId || "",
    employee_id: "",
    
    // Billing Information
    billing_address: {
      company: "",
      contact_person: "",
      address: "",
      city: "",
      postal_code: "",
      country: "Türkiye",
      tax_number: "",
      tax_office: ""
    },
    
    // Line Items
    items: [],
    
    // Totals
    subtotal: 0,
    total_discount: 0,
    total_tax: 0,
    total_amount: 0,
    currency: "TRY",
    
    // Terms and Notes
    payment_terms: "",
    delivery_terms: "",
    warranty_terms: "",
    notes: "",
    
    // Status
    status: "draft" as const
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const handleBack = () => {
    if (hasChanges) {
      const confirmed = window.confirm("Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?");
      if (!confirmed) return;
    }
    navigate("/proposals");
  };

  const handleFieldChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setHasChanges(true);
    
    // Clear validation errors for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: []
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string[]> = {};
    
    if (!formData.title.trim()) {
      errors.title = ["Teklif başlığı gereklidir"];
    }
    if (!formData.customer_id) {
      errors.customer_id = ["Müşteri seçimi gereklidir"];
    }
    if (!formData.valid_until) {
      errors.valid_until = ["Geçerlilik tarihi gereklidir"];
    }
    if (!formData.billing_address.company) {
      errors.billing_company = ["Firma adı gereklidir"];
    }
    if (formData.items.length === 0) {
      errors.items = ["En az bir teklif kalemi eklenmelidir"];
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAndSend = async () => {
    if (!validateForm()) {
      toast.error("Lütfen gerekli alanları doldurun");
      return;
    }

    try {
      setSaving(true);
      const result = await createProposal({
        ...formData,
        status: "sent"
      });
      if (result) {
        toast.success("Teklif başarıyla oluşturuldu ve gönderildi");
        setHasChanges(false);
        navigate("/proposals");
      }
    } catch (error) {
      toast.error("Teklif gönderilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setAutoSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      toast.success("Taslak kaydedildi", { duration: 2000 });
    } catch (error) {
      toast.error("Taslak kaydedilirken hata oluştu");
    } finally {
      setAutoSaving(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unit_price), 0);
    const discount = formData.total_discount || 0;
    const netAmount = subtotal - discount;
    const tax = netAmount * 0.20; // %20 KDV
    const total = netAmount + tax;

    setFormData(prev => ({
      ...prev,
      subtotal,
      total_tax: tax,
      total_amount: total
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.total_discount]);

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Yeni Teklif Oluştur"
      subtitle="Tek sayfa teklif formu"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between py-3 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Teklifler
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <h1 className="text-xl font-semibold">Yeni Teklif</h1>
                <p className="text-sm text-muted-foreground">Tek sayfa teklif formu</p>
              </div>
              <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
                Taslak
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveDraft} 
              disabled={autoSaving}
            >
              {autoSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Taslak Kaydet
            </Button>
            
            <Button 
              size="sm" 
              onClick={handleSaveAndSend} 
              disabled={saving}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {saving ? "Kaydediliyor..." : "Kaydet ve Gönder"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Single Page Layout */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid gap-6">
          {/* Company Header */}
          <Card className="shadow-sm">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ</CardTitle>
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-muted-foreground">
                    <div>
                      <p><strong>Merkez:</strong> Hasanpaşa mah. Mandıra cad. No:4 D:39 Kadıköy, İstanbul</p>
                    </div>
                    <div>
                      <p><strong>Şube:</strong> Topçular Mah. İçgören Sok. No: 2 A Keresteciler Sit. Eyüp, İstanbul</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-primary mb-2">TEKLİF FORMU</h2>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Left Side - Customer Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">Teklif Başlığı *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleFieldChange("title", e.target.value)}
                        className="mt-1"
                        placeholder="Teklif başlığını girin"
                      />
                      {validationErrors.title && (
                        <p className="text-destructive text-sm mt-1">{validationErrors.title[0]}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="proposal_number" className="text-sm font-medium">Teklif No</Label>
                      <Input
                        id="proposal_number"
                        value={formData.proposal_number}
                        onChange={(e) => handleFieldChange("proposal_number", e.target.value)}
                        className="mt-1"
                        placeholder="Otomatik oluşturulacak"
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Müşteri *</Label>
                    <CustomerSelector
                      value={formData.customer_id}
                      onChange={(value) => handleFieldChange("customer_id", value)}
                      error={validationErrors.customer_id?.[0]}
                    />
                    {validationErrors.customer_id && (
                      <p className="text-destructive text-sm mt-1">{validationErrors.customer_id[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Sorumlu Çalışan</Label>
                    <EmployeeSelector
                      value={formData.employee_id}
                      onChange={(value) => handleFieldChange("employee_id", value)}
                    />
                  </div>
                </div>

                {/* Right Side - Dates */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Tarih
                      </Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleFieldChange("date", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Geçerlilik *
                      </Label>
                      <Input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => handleFieldChange("valid_until", e.target.value)}
                        className="mt-1"
                      />
                      {validationErrors.valid_until && (
                        <p className="text-destructive text-sm mt-1">{validationErrors.valid_until[0]}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Para Birimi</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleFieldChange("currency", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRY">₺ Türk Lirası</SelectItem>
                        <SelectItem value="USD">$ ABD Doları</SelectItem>
                        <SelectItem value="EUR">€ Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="company" className="text-sm font-medium">Firma Adı *</Label>
                  <Input
                    id="company"
                    value={formData.billing_address.company}
                    onChange={(e) => handleFieldChange("billing_address.company", e.target.value)}
                    className="mt-1"
                  />
                  {validationErrors.billing_company && (
                    <p className="text-destructive text-sm mt-1">{validationErrors.billing_company[0]}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="contact_person" className="text-sm font-medium">Yetkili Kişi</Label>
                  <Input
                    id="contact_person"
                    value={formData.billing_address.contact_person}
                    onChange={(e) => handleFieldChange("billing_address.contact_person", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tax_number" className="text-sm font-medium">Vergi No</Label>
                  <Input
                    id="tax_number"
                    value={formData.billing_address.tax_number}
                    onChange={(e) => handleFieldChange("billing_address.tax_number", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="address" className="text-sm font-medium">Adres</Label>
                  <Textarea
                    id="address"
                    value={formData.billing_address.address}
                    onChange={(e) => handleFieldChange("billing_address.address", e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">Şehir</Label>
                    <Input
                      id="city"
                      value={formData.billing_address.city}
                      onChange={(e) => handleFieldChange("billing_address.city", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code" className="text-sm font-medium">Posta Kodu</Label>
                    <Input
                      id="postal_code"
                      value={formData.billing_address.postal_code}
                      onChange={(e) => handleFieldChange("billing_address.postal_code", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Teklif Kalemleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProposalItems
                items={formData.items || []}
                onItemsChange={(items) => handleFieldChange("items", items)}
              />
              {validationErrors.items && (
                <p className="text-destructive text-sm mt-2">{validationErrors.items[0]}</p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Özet ve Toplamlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Brüt Toplam:</span>
                  <span className="font-semibold">{formData.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {formData.currency === 'TRY' ? '₺' : formData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>İndirim:</span>
                  <span>{formData.total_discount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {formData.currency === 'TRY' ? '₺' : formData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Toplam:</span>
                  <span>{(formData.subtotal - formData.total_discount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {formData.currency === 'TRY' ? '₺' : formData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>KDV %20:</span>
                  <span>{formData.total_tax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {formData.currency === 'TRY' ? '₺' : formData.currency}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Toplam:</span>
                  <span>{formData.total_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {formData.currency === 'TRY' ? '₺' : formData.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notlar ve Şartlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment_terms" className="text-sm font-medium">Ödeme Şartları</Label>
                  <Textarea
                    id="payment_terms"
                    value={formData.payment_terms}
                    onChange={(e) => handleFieldChange("payment_terms", e.target.value)}
                    className="mt-1"
                    rows={2}
                    placeholder="Teklifimiz USD cinsinden Merkez Bankası Döviz Satış Kuruna göre hazırlanmıştır."
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_terms" className="text-sm font-medium">Teslimat Şartları</Label>
                  <Textarea
                    id="delivery_terms"
                    value={formData.delivery_terms}
                    onChange={(e) => handleFieldChange("delivery_terms", e.target.value)}
                    className="mt-1"
                    rows={2}
                    placeholder="Siparişte %50 ön ödeme ile bitimi nakıt tahsil edilecektir."
                  />
                </div>
                <div>
                  <Label htmlFor="warranty_terms" className="text-sm font-medium">Garanti</Label>
                  <Textarea
                    id="warranty_terms"
                    value={formData.warranty_terms}
                    onChange={(e) => handleFieldChange("warranty_terms", e.target.value)}
                    className="mt-1"
                    rows={2}
                    placeholder="Ürünlerimiz fatura tarihinden itibaren fabrikasyon hatalarına karşı 2(iki) yıl garantilidir."
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">Ek Notlar</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder="Ürünler siparişten sonra 5 gün içinde temin edilecektir. Tahmini iş süresi ürün teslimatından sonra 10 iş günüdür."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProposalCreateSinglePage;