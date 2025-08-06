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
import { PdfDownloadDropdown } from "@/components/proposals/PdfDownloadDropdown";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import ProposalFormTerms from "@/components/proposals/form/ProposalFormTerms";
import EmployeeSelector from "@/components/proposals/form/EmployeeSelector";
import ContactPersonInput from "@/components/proposals/form/ContactPersonInput";

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
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Turkish character normalization function
  const normalizeTurkish = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/ş/g, 's').replace(/Ş/g, 's')
      .replace(/ç/g, 'c').replace(/Ç/g, 'c')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
      .replace(/ü/g, 'u').replace(/Ü/g, 'u')
      .replace(/ö/g, 'o').replace(/Ö/g, 'o')
      .replace(/ı/g, 'i').replace(/I/g, 'i').replace(/İ/g, 'i');
  };

  // Filter customers based on search query
  const filteredCustomers = customers?.filter(customer => {
    if (!customerSearchQuery.trim()) return true;
    
    const normalizedQuery = normalizeTurkish(customerSearchQuery);
    return customer.searchableText.includes(normalizedQuery);
  });

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
      unit: "adet",
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
      unit: "adet",
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

  const handleExportPDF = async (templateId?: string) => {
    try {
      // Create proposal data for PDF generation
      const proposalData = {
        number: formData.offer_number,
        created_at: formData.offer_date,
        valid_until: formData.validity_date,
        status: 'sent',
        customer: {
          name: formData.customer_company,
          contact: formData.contact_name,
          title: formData.contact_title,
        },
        items: items.map(item => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        })),
        payment_terms: formData.payment_terms,
        delivery_terms: formData.delivery_terms,
        notes: formData.notes
      };

      // Import and use React PDF generator
      const { ReactPdfGenerator } = await import('@/utils/reactPdfGenerator');
      const generator = new ReactPdfGenerator();
      await generator.generateProposalPdf(proposalData as any, templateId);
      toast.success(`PDF ${templateId ? 'şablon ile' : ''} oluşturuldu`);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('PDF oluşturulurken hata oluştu');
    }
  };

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="Yeni Teklif"
      subtitle="Hızlı ve kolay teklif oluşturma"
    >
      {/* Header Actions */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
        
        <div className="flex items-center gap-2">
          <PdfDownloadDropdown onDownloadWithTemplate={handleExportPDF} />
          <Button 
            variant="outline" 
            onClick={() => handleSave('draft')}
            disabled={saving}
            size="sm"
          >
            Taslak Kaydet
          </Button>
          <Button 
            onClick={() => handleSave('sent')}
            disabled={saving}
            className="gap-2"
            size="sm"
          >
            <Calculator className="h-4 w-4" />
            {saving ? "Kaydediliyor..." : "Teklifi Kaydet"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Top Row - Customer & Proposal Details Combined */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="customer_company" className="text-sm">Firma Adı *</Label>
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
                       <Command shouldFilter={false} className="rounded-lg border shadow-md">
                         <CommandInput 
                           placeholder="Müşteri veya firma adı ile ara..." 
                           className="h-9"
                           value={customerSearchQuery}
                           onValueChange={setCustomerSearchQuery}
                         />
                        <CommandList className="max-h-[300px]">
                          <CommandEmpty className="py-6 text-center text-sm">
                            Aramanızla eşleşen müşteri bulunamadı.
                          </CommandEmpty>
                          <CommandGroup>
                             {filteredCustomers?.map((customer) => (
                               <CommandItem
                                 key={customer.id}
                                 value={customer.searchableText}
                                onSelect={() => {
                                  const selectedName = customer.company || customer.name;
                                  handleFieldChange('customer_company', selectedName);
                                  handleFieldChange('contact_name', customer.name);
                                  setCustomerSearchOpen(false);
                                }}
                                className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent-foreground rounded-sm transition-colors"
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
                <ContactPersonInput
                  value={formData.contact_name}
                  onChange={(value) => handleFieldChange('contact_name', value)}
                  customerId={formData.customer_id}
                  error=""
                />
                <div>
                  <Label htmlFor="prepared_by">Teklifi Hazırlayan</Label>
                  <EmployeeSelector
                    value={formData.prepared_by || ""}
                    onChange={(value) => handleFieldChange('prepared_by', value)}
                    error=""
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offer Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Teklif Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="offer_date" className="text-sm">Teklif Tarihi</Label>
                  <Input
                    id="offer_date"
                    type="date"
                    value={formData.offer_date}
                    onChange={(e) => handleFieldChange('offer_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="offer_number" className="text-sm">Teklif No</Label>
                  <Input
                    id="offer_number"
                    value={formData.offer_number}
                    onChange={(e) => handleFieldChange('offer_number', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="validity_date" className="text-sm">Geçerlilik Tarihi *</Label>
                  <Input
                    id="validity_date"
                    type="date"
                    value={formData.validity_date}
                    onChange={(e) => handleFieldChange('validity_date', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="text-sm">Notlar</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Teklif hakkında özel notlar..."
                  rows={2}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products/Services Table - Full Width */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Ürün/Hizmet Listesi</CardTitle>
                  <Button onClick={addItem} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Satır Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-3 bg-gray-50/50">
                      <div className="flex items-center justify-between mb-2">
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-5">
                          <Label className="text-sm">Ürün/Hizmet Açıklaması *</Label>
                          <Textarea
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Teknik detaylar ve açıklamalar..."
                            rows={2}
                            className="mt-1 resize-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm">Miktar</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            min="1"
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm">Birim</Label>
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
                          <Label className="text-sm">Birim Fiyat (₺)</Label>
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
                          <Label className="text-sm">Toplam</Label>
                          <div className="mt-1 p-2 bg-gray-100 rounded text-right font-medium text-sm">
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
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Finansal Özet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Brüt Toplam:</span>
                    <span className="font-medium">{formatCurrency(calculations.gross_total)}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="discount" className="text-sm">İndirim (%)</Label>
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
                    <div className="flex justify-between text-red-600 text-sm">
                      <span>İndirim Tutarı:</span>
                      <span>-{formatCurrency(calculations.discount_amount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Net Toplam:</span>
                    <span className="font-medium">{formatCurrency(calculations.net_total)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <Label htmlFor="vat" className="text-sm">KDV (%)</Label>
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
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">KDV Tutarı:</span>
                    <span className="font-medium">{formatCurrency(calculations.vat_amount)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
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
          <CardContent className="p-4">
            <ProposalFormTerms
              paymentTerms={formData.payment_terms}
              deliveryTerms={formData.delivery_terms}
              notes={formData.notes}
              onInputChange={(e) => handleFieldChange(e.target.name, e.target.value)}
            />
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default NewProposalCreate;