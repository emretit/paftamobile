
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Edit, ArrowLeft, Calculator, Check, ChevronsUpDown, Clock, Send, ShoppingCart, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatters";
import { useProposalEdit } from "@/hooks/useProposalEdit";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";
import { ProposalItem } from "@/types/proposal";
import { PdfDownloadDropdown } from "@/components/proposals/PdfDownloadDropdown";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { proposalStatusColors, proposalStatusLabels, ProposalStatus } from "@/types/proposal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { handleProposalStatusChange } from "@/services/workflow/proposalWorkflow";
import ProposalFormTerms from "@/components/proposals/form/ProposalFormTerms";
import EmployeeSelector from "@/components/proposals/form/EmployeeSelector";
import ContactPersonInput from "@/components/proposals/form/ContactPersonInput";
import ProductSelector from "@/components/proposals/form/ProductSelector";
import ProductDetailsModal from "@/components/proposals/form/ProductDetailsModal";

interface LineItem extends ProposalItem {
  row_number: number;
}

interface ProposalEditProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalEdit = ({ isCollapsed, setIsCollapsed }: ProposalEditProps) => {
  const navigate = useNavigate();
  const { proposal, loading, saving, handleBack, handleSave } = useProposalEdit();
  const { customers, isLoading: isLoadingCustomers } = useCustomerSelect();
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | undefined>(undefined);
  const [editingItemData, setEditingItemData] = useState<any>(null);
  
  // Global discount state
  const [globalDiscountType, setGlobalDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [globalDiscountValue, setGlobalDiscountValue] = useState<number>(0);

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

  // Form state matching the proposal edit format
  const [formData, setFormData] = useState({
    // Customer Section
    customer_company: "",
    contact_name: "",
    contact_title: "",
    offer_date: "",
    offer_number: "",
    
    // General Section
    validity_date: "",
    prepared_by: "",
    notes: "",
    
    // Financial settings
    currency: "TRY",
    discount_percentage: 0,
    vat_percentage: 20,
    
    // Terms
    payment_terms: "",
    delivery_terms: "",
    warranty_terms: "",
    
    // Backend compatibility fields
    title: "",
    customer_id: "",
    employee_id: "",
    description: "",
    status: "draft" as ProposalStatus
  });

  // Line items state
  const [items, setItems] = useState<LineItem[]>([]);
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when proposal loads
  useEffect(() => {
    if (proposal) {
      console.log("🔍 Proposal loaded:", proposal);
      console.log("🔍 Proposal items:", proposal.items);
      
      setFormData({
        customer_company: proposal.customer?.name || proposal.customer_name || "Müşteri Belirtilmemiş",
        contact_name: proposal.customer?.name || proposal.customer_name || "Müşteri Belirtilmemiş",
        contact_title: "",
        offer_date: proposal.created_at ? proposal.created_at.split('T')[0] : "",
        offer_number: proposal.proposal_number || "",
        validity_date: proposal.valid_until ? proposal.valid_until.split('T')[0] : "",
        prepared_by: proposal.employee ? ((proposal.employee.first_name || '') + ' ' + (proposal.employee.last_name || '')).trim() || proposal.employee_name : proposal.employee_name || "",
        notes: proposal.notes || "",
        currency: proposal.currency || "TRY",
        discount_percentage: 0,
        vat_percentage: 20,
        payment_terms: proposal.payment_terms || "Siparişle birlikte %50 avans, teslimde kalan tutar ödenecektir.",
        delivery_terms: proposal.delivery_terms || "Teslimat süresi: Sipariş tarihinden itibaren 15-20 iş günü",
        warranty_terms: "Ürünlerimiz 2 yıl garantilidir.",
        title: proposal.title || "",
        customer_id: proposal.customer_id || "",
        employee_id: proposal.employee_id || "",
        description: proposal.description || "",
        status: proposal.status as ProposalStatus
      });

      // Initialize items from proposal
      if (proposal.items && proposal.items.length > 0) {
        console.log("📦 Processing proposal items:", proposal.items);
        const initialItems = proposal.items.map((item, index) => {
          const lineItem = {
            ...item,
            id: item.id || crypto.randomUUID(),
            row_number: index + 1,
            name: item.name || "",
            description: item.description || item.name || "",
            quantity: item.quantity || 1,
            unit: item.unit || "adet",
            unit_price: item.unit_price || 0,
            total_price: item.total_price || (item.quantity || 1) * (item.unit_price || 0),
            currency: item.currency || proposal.currency || "TRY",
            tax_rate: item.tax_rate || 18,
            discount_rate: item.discount_rate || 0
          };
          console.log("📦 Processed line item:", lineItem);
          return lineItem;
        });
        setItems(initialItems);
        console.log("📦 Final items set:", initialItems);
      } else {
        console.log("📦 No items found, creating default item");
        setItems([{
          id: "1",
          row_number: 1,
          name: "",
          description: "",
          quantity: 1,
          unit: "adet",
          unit_price: 0,
          total_price: 0,
          currency: proposal.currency || "TRY"
        }]);
      }
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

  // Calculate totals by currency (modern approach like NewProposalCreate)
  const calculateTotalsByCurrency = () => {
    const totals: Record<string, { gross: number; discount: number; net: number; vat: number; grand: number }> = {};
    
    // First, collect all currencies used in items
    const usedCurrencies = new Set<string>();
    items.forEach(item => {
      const currency = item.currency || 'TRY';
      usedCurrencies.add(currency);
    });
    
    // Initialize totals for all used currencies
    usedCurrencies.forEach(currency => {
      totals[currency] = { gross: 0, discount: 0, net: 0, vat: 0, grand: 0 };
    });
    
    // Calculate gross totals
    items.forEach(item => {
      const currency = item.currency || 'TRY';
      totals[currency].gross += item.quantity * item.unit_price;
    });
    
    // Calculate total gross across all currencies for global discount
    const totalGross = Object.values(totals).reduce((sum, total) => sum + total.gross, 0);
    
    // Apply global discount and VAT calculations for each currency
    Object.keys(totals).forEach(currency => {
      const gross = totals[currency].gross;
      
      // Calculate global discount proportionally for this currency
      let globalDiscount = 0;
      if (globalDiscountValue > 0 && totalGross > 0) {
        const currencyProportion = gross / totalGross;
        if (globalDiscountType === 'percentage') {
          globalDiscount = (gross * globalDiscountValue) / 100;
        } else {
          // Amount discount distributed proportionally
          globalDiscount = globalDiscountValue * currencyProportion;
        }
      }
      
      const net = gross - globalDiscount;
      const vat = (net * formData.vat_percentage) / 100;
      const grand = net + vat;
      
      totals[currency] = {
        gross,
        discount: globalDiscount,
        net,
        vat,
        grand
      };
    });
    
    return totals;
  };

  const calculationsByCurrency = calculateTotalsByCurrency();
  
  // Legacy calculations for backward compatibility (using primary currency)
  const primaryCurrency = formData.currency;
  const primaryTotals = calculationsByCurrency[primaryCurrency] || {
    gross: 0,
    discount: 0,
    net: 0,
    vat: 0,
    grand: 0
  };
  
  const calculations = {
    gross_total: primaryTotals.gross,
    discount_amount: primaryTotals.discount,
    net_total: primaryTotals.net,
    vat_amount: primaryTotals.vat,
    grand_total: primaryTotals.grand
  };

  // Update item calculations
  useEffect(() => {
    const updatedItems = items.map(item => ({
      ...item,
      total_price: item.quantity * item.unit_price
    }));
    setItems(updatedItems);
  }, [items.map(item => `${item.quantity}-${item.unit_price}`).join(',')]);

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setItems(updatedItems);
    setHasChanges(true);
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
    setHasChanges(true);
  };

  const handleProductModalSelect = (product: any) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleAddProductToProposal = (productData: any, itemIndex?: number) => {
    if (itemIndex !== undefined) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        name: productData.name,
        description: productData.description,
        quantity: productData.quantity,
        unit: productData.unit,
        unit_price: productData.unit_price,
        total_price: productData.total_price,
        currency: productData.currency || formData.currency
      };
      setItems(updatedItems);
    } else {
      // Add new item
      const newItem: LineItem = {
        id: Date.now().toString(),
        row_number: items.length + 1,
        name: productData.name,
        description: productData.description,
        quantity: productData.quantity,
        unit: productData.unit,
        unit_price: productData.unit_price,
        total_price: productData.total_price,
        currency: productData.currency || formData.currency
      };
      setItems([...items, newItem]);
    }
    
    setProductModalOpen(false);
    setEditingItemIndex(undefined);
    setSelectedProduct(null);
    setHasChanges(true);
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
      setHasChanges(true);
    }
  };

  // Save function
  const handleSaveChanges = async (status: ProposalStatus = proposal?.status || 'draft') => {
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
    if (items.length === 0 || items.every(item => !item.name.trim() && !item.description.trim())) {
      toast.error("En az bir teklif kalemi eklenmelidir");
      return;
    }

    setIsSaving(true);
    try {
      // Prepare data for backend
      const proposalData = {
        title: `${formData.customer_company} - Teklif`,
        description: formData.notes,
        customer_name: formData.customer_company,
        customer_id: formData.customer_id || "",
        employee_id: formData.employee_id || "",
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

      await handleSave(proposalData);
      setHasChanges(false);
      toast.success("Teklif başarıyla güncellendi");
    } catch (error) {
      toast.error("Teklif güncellenirken bir hata oluştu");
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

  const handlePreview = () => {
    toast.info("Önizleme özelliği yakında eklenecek");
  };

  const handleExportPDF = () => {
    toast.info("PDF dışa aktarma özelliği yakında eklenecek");
  };

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


  const handleDownloadPdf = async (templateId?: string) => {
    if (!proposal) return;
    
    try {
      const { ReactPdfGenerator } = await import('@/utils/reactPdfGenerator');
      const generator = new ReactPdfGenerator();
      await generator.generateProposalPdf(proposal, templateId);
      toast.success(`PDF ${templateId ? 'seçilen şablonla' : ''} yazdırma için hazırlandı`);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast.error("PDF oluşturulurken bir hata oluştu");
    }
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
      subtitle="Hızlı ve kolay teklif düzenleme"
    >
      {/* Header Actions */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold">Teklif Düzenle</h1>
            <Badge className={proposalStatusColors[proposal.status]}>
              {proposalStatusLabels[proposal.status]}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <PdfDownloadDropdown onDownloadWithTemplate={handleDownloadPdf} proposal={proposal} />
          <Button 
            variant="outline" 
            onClick={() => handleSaveChanges(proposal.status)}
            disabled={isSaving || !hasChanges}
            size="sm"
          >
            {hasChanges ? "Değişiklikleri Kaydet" : "Kaydedildi"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="bg-red-600 hover:bg-red-700 text-white" size="sm">
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
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Status Actions */}
      {getStatusActions()}

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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const existingData = {
                                name: item.name,
                                description: item.description || '',
                                quantity: item.quantity,
                                unit: item.unit,
                                unit_price: item.unit_price,
                                vat_rate: item.tax_rate || 20,
                                discount_rate: item.discount_rate || 0,
                                currency: item.currency || formData.currency
                              };
                              
                              setSelectedProduct(null);
                              setEditingItemIndex(index);
                              setEditingItemData(existingData);
                              setProductModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {items.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-7">
                          <Label className="text-sm">Ürün/Hizmet *</Label>
                          <ProductSelector
                            value={item.name || item.description || ''}
                            onChange={(productName) => {
                              handleItemChange(index, 'name', productName);
                              if (!item.description) {
                                handleItemChange(index, 'description', productName);
                              }
                            }}
                            onProductSelect={handleProductModalSelect}
                            placeholder="Ürün seçin..."
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Label className="text-sm">Miktar</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            min="1"
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Label className="text-sm">Birim</Label>
                          <div className="mt-1 p-2 bg-gray-100 rounded text-left font-medium text-sm">
                            {item.unit || 'adet'}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm">Birim Fiyat</Label>
                           <div className="mt-1 p-2 bg-gray-100 rounded text-right font-medium text-sm">
                             {formatCurrency(item.unit_price, item.currency || 'TRY')}
                           </div>
                         </div>
                         <div className="md:col-span-1">
                           <Label className="text-sm">Toplam</Label>
                           <div className="mt-1 p-2 bg-gray-100 rounded text-right font-medium text-sm">
                             {formatCurrency(item.total_price, item.currency || 'TRY')}
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
                {/* Multi-currency display */}
                <div className="space-y-4">
                  {Object.entries(calculationsByCurrency).map(([currency, totals]) => (
                    <div key={currency} className="border rounded-lg p-3 space-y-2">
                      <div className="font-medium text-sm text-center mb-2 text-primary">
                        {Object.keys(calculationsByCurrency).length > 1 ? `${currency} Toplamları` : "Finansal Toplam"}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Brüt Toplam:</span>
                          <span className="font-medium">{formatCurrency(totals.gross, currency)}</span>
                        </div>
                        
                        {/* Global Discount Controls */}
                        <div className="border-t pt-2 space-y-2">
                          <div className="font-medium text-xs text-center text-muted-foreground">
                            Genel İndirim
                          </div>
                          <div className="flex gap-2">
                            <Select value={globalDiscountType} onValueChange={(value: 'percentage' | 'amount') => setGlobalDiscountType(value)}>
                              <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">%</SelectItem>
                                <SelectItem value="amount">₺</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Input
                              type="number"
                              value={globalDiscountValue}
                              onChange={(e) => setGlobalDiscountValue(Number(e.target.value))}
                              placeholder="0"
                              min="0"
                              step={globalDiscountType === 'percentage' ? '0.1' : '0.01'}
                              className="flex-1 h-8 text-xs"
                            />
                          </div>
                        </div>
                        
                        {totals.discount > 0 && (
                          <div className="flex justify-between text-red-600 text-sm">
                            <span>İndirim:</span>
                            <span>-{formatCurrency(totals.discount, currency)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Net Toplam:</span>
                          <span className="font-medium">{formatCurrency(totals.net, currency)}</span>
                        </div>
                        
                        {totals.vat > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">KDV:</span>
                            <span className="font-medium">{formatCurrency(totals.vat, currency)}</span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between font-bold">
                          <span>GENEL TOPLAM:</span>
                          <span className="text-green-600">{formatCurrency(totals.grand, currency)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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

        {/* Product Details Modal */}
        <ProductDetailsModal
          open={productModalOpen}
          onOpenChange={(open) => {
            setProductModalOpen(open);
            if (!open) {
              setEditingItemIndex(undefined);
              setSelectedProduct(null);
              setEditingItemData(null);
            }
          }}
          product={selectedProduct}
          onAddToProposal={(productData) => handleAddProductToProposal(productData, editingItemIndex)}
          currency={formData.currency}
          existingData={editingItemData}
        />
      </div>
    </DefaultLayout>
  );
};

export default ProposalEdit;
