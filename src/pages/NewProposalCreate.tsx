import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Plus, Trash2, Eye, FileDown, ArrowLeft, Calculator, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatters";
import { useProposalCreation } from "@/hooks/proposals/useProposalCreation";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";
import { ProposalItem } from "@/types/proposal";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface LineItem extends ProposalItem {
  row_number: number;
}

interface NewProposalCreateProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const NewProposalCreate = ({ isCollapsed, setIsCollapsed }: NewProposalCreateProps) => {
  const navigate = useNavigate();
  const { createProposal } = useProposalCreation();
  const { customers, isLoading: isLoadingCustomers } = useCustomerSelect();
  const [saving, setSaving] = useState(false);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

  // Form state matching the sample format
  const [formData, setFormData] = useState({
    // Customer Section
    customer_company: "",
    contact_name: "",
    contact_title: "",
    offer_date: new Date().toISOString().split('T')[0],
    offer_number: `TKF-${Date.now().toString().slice(-6)}`,
    
    // General Section
    validity_date: "",
    prepared_by: "",
    notes: "",
    
    // Financial settings
    currency: "TRY",
    discount_percentage: 0,
    vat_percentage: 20,
    
    // Terms
    payment_terms: "Siparişle birlikte %50 avans, teslimde kalan tutar ödenecektir.",
    delivery_terms: "Teslimat süresi: Sipariş tarihinden itibaren 15-20 iş günü",
    warranty_terms: "Ürünlerimiz 2 yıl garantilidir.",
    
    // Backend compatibility fields
    title: "",
    customer_id: "",
    employee_id: "",
    description: "",
    status: "draft" as const
  });

  // Line items state
  const [items, setItems] = useState<LineItem[]>([
    {
      id: "1",
      row_number: 1,
      name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      currency: "TRY"
    }
  ]);

  // Calculate totals
  const calculations = {
    gross_total: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
    discount_amount: 0,
    net_total: 0,
    vat_amount: 0,
    grand_total: 0
  };

  useEffect(() => {
    const grossTotal = calculations.gross_total;
    const discountAmount = (grossTotal * formData.discount_percentage) / 100;
    const netTotal = grossTotal - discountAmount;
    const vatAmount = (netTotal * formData.vat_percentage) / 100;
    const grandTotal = netTotal + vatAmount;

    calculations.discount_amount = discountAmount;
    calculations.net_total = netTotal;
    calculations.vat_amount = vatAmount;
    calculations.grand_total = grandTotal;
  }, [items, formData.discount_percentage, formData.vat_percentage]);

  // Update item calculations
  useEffect(() => {
    const updatedItems = items.map(item => ({
      ...item,
      total_price: item.quantity * item.unit_price
    }));
    setItems(updatedItems);
  }, [items.map(item => `${item.quantity}-${item.unit_price}`).join(',')]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setItems(updatedItems);
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      row_number: items.length + 1,
      name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      currency: formData.currency
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      // Renumber items
      const renumberedItems = updatedItems.map((item, i) => ({
        ...item,
        row_number: i + 1
      }));
      setItems(renumberedItems);
    }
  };

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    // Validation
    if (!formData.customer_company.trim()) {
      toast.error("Müşteri firma adı gereklidir");
      return;
    }
    if (!formData.contact_name.trim()) {
      toast.error("İletişim kişisi adı gereklidir");
      return;
    }
    if (!formData.validity_date) {
      toast.error("Geçerlilik tarihi gereklidir");
      return;
    }
    if (items.length === 0 || items.every(item => !item.name.trim())) {
      toast.error("En az bir teklif kalemi eklenmelidir");
      return;
    }

    setSaving(true);
    try {
      // Prepare data for backend
      const proposalData = {
        title: `${formData.customer_company} - Teklif`,
        description: formData.notes,
        customer_name: formData.customer_company,
        customer_id: "", // Will be set by backend if customer exists
        employee_id: "", // Will be set by backend
        valid_until: formData.validity_date,
        payment_terms: formData.payment_terms,
        delivery_terms: `${formData.delivery_terms}\n\nGaranti: ${formData.warranty_terms}`,
        notes: formData.notes,
        status: status,
        total_amount: calculations.grand_total,
        currency: formData.currency,
        items: items.map(item => ({
          ...item,
          total_price: item.quantity * item.unit_price
        }))
      };

      const result = await createProposal(proposalData);
      if (result) {
        toast.success(status === 'draft' ? "Teklif taslak olarak kaydedildi" : "Teklif başarıyla oluşturuldu");
        navigate("/proposals");
      }
    } catch (error) {
      toast.error("Teklif kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    toast.info("Önizleme özelliği yakında eklenecek");
  };

  const handleExportPDF = () => {
    toast.info("PDF dışa aktarma özelliği yakında eklenecek");
  };

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="Yeni Teklif"
      subtitle="Hızlı ve kolay teklif oluşturma"
    >
      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/proposals")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePreview} className="gap-2">
            <Eye className="h-4 w-4" />
            Önizleme
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <FileDown className="h-4 w-4" />
            PDF İndir
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            Taslak Kaydet
          </Button>
          <Button 
            onClick={() => handleSave('sent')}
            disabled={saving}
            className="gap-2"
          >
            <Calculator className="h-4 w-4" />
            {saving ? "Kaydediliyor..." : "Teklifi Kaydet"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Top Row - Customer & Proposal Details Combined */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="customer_company">Firma Adı *</Label>
                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerSearchOpen}
                        className={cn(
                          "w-full justify-between",
                          !formData.customer_company && "text-muted-foreground"
                        )}
                        disabled={isLoadingCustomers}
                      >
                        {formData.customer_company || "Müşteri ara..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command className="rounded-lg border shadow-md">
                        <CommandInput 
                          placeholder="Müşteri veya firma adı ile ara..." 
                          className="h-9"
                        />
                        <CommandList className="max-h-[300px]">
                          <CommandEmpty className="py-6 text-center text-sm">
                            Aramanızla eşleşen müşteri bulunamadı.
                          </CommandEmpty>
                          <CommandGroup>
                            {customers?.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={`${customer.name} ${customer.company || ''} ${customer.email || ''}`}
                                onSelect={() => {
                                  const selectedName = customer.company || customer.name;
                                  handleFieldChange('customer_company', selectedName);
                                  handleFieldChange('contact_name', customer.name);
                                  setCustomerSearchOpen(false);
                                }}
                                className="flex items-center gap-2 p-3 cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    formData.customer_company === (customer.company || customer.name) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    {customer.company ? (
                                      <>
                                        <span className="font-medium text-foreground truncate">
                                          {customer.company}
                                        </span>
                                        <span className="px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground">
                                          {customer.name}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="font-medium text-foreground truncate">
                                        {customer.name}
                                      </span>
                                    )}
                                  </div>
                                  {customer.email && (
                                    <span className="text-xs text-muted-foreground truncate">
                                      {customer.email}
                                    </span>
                                  )}
                                  {(customer.mobile_phone || customer.address) && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      {customer.mobile_phone && (
                                        <span>{customer.mobile_phone}</span>
                                      )}
                                      {customer.mobile_phone && customer.address && (
                                        <span>•</span>
                                      )}
                                      {customer.address && (
                                        <span className="truncate">{customer.address}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_name">İletişim Kişisi *</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name}
                      onChange={(e) => handleFieldChange('contact_name', e.target.value)}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_title">Ünvan</Label>
                    <Input
                      id="contact_title"
                      value={formData.contact_title}
                      onChange={(e) => handleFieldChange('contact_title', e.target.value)}
                      placeholder="Pozisyon/Ünvan"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="prepared_by">Teklifi Hazırlayan</Label>
                  <Input
                    id="prepared_by"
                    value={formData.prepared_by}
                    onChange={(e) => handleFieldChange('prepared_by', e.target.value)}
                    placeholder="Satış temsilcisi"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Teklif Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="offer_date">Teklif Tarihi</Label>
                  <Input
                    id="offer_date"
                    type="date"
                    value={formData.offer_date}
                    onChange={(e) => handleFieldChange('offer_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="offer_number">Teklif No</Label>
                  <Input
                    id="offer_number"
                    value={formData.offer_number}
                    onChange={(e) => handleFieldChange('offer_number', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="validity_date">Geçerlilik Tarihi *</Label>
                  <Input
                    id="validity_date"
                    type="date"
                    value={formData.validity_date}
                    onChange={(e) => handleFieldChange('validity_date', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Teklif hakkında özel notlar..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products/Services Table - Full Width */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Ürün/Hizmet Listesi</CardTitle>
                  <Button onClick={addItem} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Satır Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm text-gray-600">
                          Satır {item.row_number}
                        </span>
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5">
                          <Label>Ürün/Hizmet Açıklaması *</Label>
                          <Textarea
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Teknik detaylar ve açıklamalar..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Miktar</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            min="1"
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Birim</Label>
                          <Select 
                            value={item.name || 'Ad'} 
                            onValueChange={(value) => handleItemChange(index, 'name', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ad">Ad</SelectItem>
                              <SelectItem value="Paket">Paket</SelectItem>
                              <SelectItem value="Kg">Kg</SelectItem>
                              <SelectItem value="M2">M²</SelectItem>
                              <SelectItem value="M3">M³</SelectItem>
                              <SelectItem value="Saat">Saat</SelectItem>
                              <SelectItem value="Gün">Gün</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label>Birim Fiyat (₺)</Label>
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                            min="0"
                            step="0.01"
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Label>Toplam</Label>
                          <div className="mt-1 p-2 bg-gray-100 rounded text-right font-medium">
                            {formatCurrency(item.total_price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary - Right Side */}
          <div className="xl:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Finansal Özet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brüt Toplam:</span>
                    <span className="font-medium">{formatCurrency(calculations.gross_total)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discount">İndirim (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) => handleFieldChange('discount_percentage', Number(e.target.value))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  
                  {formData.discount_percentage > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>İndirim Tutarı:</span>
                      <span>-{formatCurrency(calculations.discount_amount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Toplam:</span>
                    <span className="font-medium">{formatCurrency(calculations.net_total)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="vat">KDV (%)</Label>
                    <Select 
                      value={formData.vat_percentage.toString()} 
                      onValueChange={(value) => handleFieldChange('vat_percentage', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="1">1%</SelectItem>
                        <SelectItem value="10">10%</SelectItem>
                        <SelectItem value="20">20%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">KDV Tutarı:</span>
                    <span className="font-medium">{formatCurrency(calculations.vat_amount)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>GENEL TOPLAM:</span>
                    <span className="text-green-600">{formatCurrency(calculations.grand_total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Terms & Conditions - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Şartlar ve Koşullar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="payment_terms">Ödeme Şartları</Label>
                <Textarea
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => handleFieldChange('payment_terms', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="delivery_terms">Teslimat Şartları</Label>
                <Textarea
                  id="delivery_terms"
                  value={formData.delivery_terms}
                  onChange={(e) => handleFieldChange('delivery_terms', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="warranty_terms">Garanti Şartları</Label>
                <Textarea
                  id="warranty_terms"
                  value={formData.warranty_terms}
                  onChange={(e) => handleFieldChange('warranty_terms', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default NewProposalCreate;