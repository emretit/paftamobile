import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Calendar, 
  CalendarDays, 
  Search, 
  Loader2, 
  MoreHorizontal, 
  Download, 
  FileText, 
  Plus,
  AlertTriangle,
  LogIn,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import EInvoiceForm from "@/components/einvoice/EInvoiceForm";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

export const InvoiceManagementTab = () => {
  const [activeTab, setActiveTab] = useState("invoices");
  const [isNilveraAuthenticated, setIsNilveraAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [einvoices, setEinvoices] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('nilvera_auth')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (data && !error) {
        setIsNilveraAuthenticated(true);
        fetchInvoices();
      } else {
        setIsNilveraAuthenticated(false);
      }
    } catch (error) {
      console.log('No valid auth found');
      setIsNilveraAuthenticated(false);
    }
  };
  
  const authenticateNilvera = async () => {
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-auth', {
        body: { action: 'authenticate' }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setIsNilveraAuthenticated(true);
        toast({
          title: "Başarılı",
          description: "Nilvera'ya başarıyla giriş yapıldı.",
        });
        fetchInvoices();
      } else {
        throw new Error(data.error || 'Kimlik doğrulama başarısız');
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Nilvera kimlik doğrulama başarısız.",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { action: 'fetch_incoming' }
      });
      
      if (error) throw error;
      
      if (data.success) {
        console.log('Received invoices:', data.invoices);
        setEinvoices(data.invoices || []);
        toast({
          title: "Başarılı",
          description: `${data.invoices?.length || 0} fatura getirildi.`,
        });
      } else {
        throw new Error(data.error || 'Faturalar getirilemedi');
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Faturalar getirilemedi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'create',
          invoiceData 
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Başarılı",
          description: "E-fatura başarıyla oluşturuldu.",
        });
        setIsCreateFormOpen(false);
        fetchInvoices();
      } else {
        throw new Error(data.error || 'Fatura oluşturulamadı');
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "E-fatura oluşturulamadı.",
        variant: "destructive",
      });
    }
  };

  const handleViewPDF = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'get_pdf',
          invoice: { invoiceId }
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        // PDF'i yeni sekmede aç
        window.open(data.pdfUrl, '_blank');
        toast({
          title: "Başarılı",
          description: "PDF açılıyor...",
        });
      } else {
        throw new Error(data.error || 'PDF getirilemedi');
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "PDF getirilemedi.",
        variant: "destructive",
      });
    }
  };

  const handleExportToExcel = () => {
    const headers = [
      'Fatura No',
      'Tedarikçi',
      'Fatura Tarihi',
      'Son Ödeme Tarihi',
      'Durum',
      'Toplam Tutar',
      'Ödenen Tutar',
      'Kalan Tutar'
    ];
    
    const data = filteredInvoices.map(invoice => [
      invoice.invoiceNumber,
      invoice.supplierName,
      invoice.issueDate ? format(new Date(invoice.issueDate), 'dd/MM/yyyy') : '-',
      '-', // No due date in API response
      getStatusText(invoice.status),
      invoice.payableAmount,
      0, // No paid amount in current API
      invoice.payableAmount
    ]);
    
    exportToExcel([headers, ...data], 'e-faturalar');
  };

  const handleExportToPDF = () => {
    const headers = [
      'Fatura No',
      'Tedarikçi',
      'Fatura Tarihi',
      'Durum',
      'Toplam Tutar'
    ];
    
    const data = filteredInvoices.map(invoice => [
      invoice.invoiceNumber,
      invoice.supplierName,
      invoice.issueDate ? format(new Date(invoice.issueDate), 'dd/MM/yyyy') : '-',
      getStatusText(invoice.status),
      `${invoice.payableAmount?.toLocaleString('tr-TR') || '0'} ${invoice.currencyCode || 'TRY'}`
    ]);
    
    const columns = headers.map((header: string, index: number) => ({
      header,
      dataKey: index.toString()
    }));
    exportToPDF(data, 'E-Fatura Listesi', columns);
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      "pending": "Bekliyor",
      "paid": "Ödendi", 
      "partially_paid": "Kısmen Ödendi",
      "overdue": "Gecikmiş",
      "cancelled": "İptal"
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "pending": { label: "Bekliyor", variant: "default" as const },
      "paid": { label: "Ödendi", variant: "secondary" as const },
      "partially_paid": { label: "Kısmen Ödendi", variant: "warning" as const },
      "overdue": { label: "Gecikmiş", variant: "destructive" as const },
      "cancelled": { label: "İptal", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "default" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const parseInvoiceItems = (xmlData: any) => {
    if (!xmlData) return [];
    
    try {
      const invoiceLines = xmlData?.Invoice?.cac_InvoiceLine || xmlData?.cac_InvoiceLine || [];
      const lines = Array.isArray(invoiceLines) ? invoiceLines : [invoiceLines];
      
      return lines.map((line: any, index: number) => ({
        id: index + 1,
        description: line?.cac_Item?.cbc_Name || line?.cbc_Name || 'Ürün/Hizmet',
        quantity: parseFloat(line?.cbc_InvoicedQuantity?._text || line?.cbc_InvoicedQuantity || '0'),
        unit: line?.cbc_InvoicedQuantity?._attributes?.unitCode || line?.cbc_InvoicedQuantity?.unitCode || 'Adet',
        unitPrice: parseFloat(line?.cac_Price?.cbc_PriceAmount?._text || line?.cac_Price?.cbc_PriceAmount || '0'),
        taxRate: parseFloat(line?.cac_TaxTotal?.cac_TaxSubtotal?.cac_TaxCategory?.cbc_Percent?._text || 
                           line?.cac_TaxTotal?.cac_TaxSubtotal?.cac_TaxCategory?.cbc_Percent || '18'),
        lineTotal: parseFloat(line?.cbc_LineExtensionAmount?._text || line?.cbc_LineExtensionAmount || '0'),
        taxAmount: parseFloat(line?.cac_TaxTotal?.cbc_TaxAmount?._text || line?.cac_TaxTotal?.cbc_TaxAmount || '0'),
      }));
    } catch (error) {
      console.error('XML parsing error:', error);
      return [];
    }
  };

  const toggleInvoiceExpansion = (invoiceId: string) => {
    const newExpanded = new Set(expandedInvoices);
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId);
    } else {
      newExpanded.add(invoiceId);
    }
    setExpandedInvoices(newExpanded);
  };

  const InvoiceDetailsContent = ({ invoice }: { invoice: any }) => {
    const invoiceItems = parseInvoiceItems(invoice.xmlData);
    
    return (
      <div className="p-6 bg-muted/30 border-t">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Summary */}
          <div className="lg:col-span-1">
            <h4 className="font-medium mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Fatura Bilgileri
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fatura No:</span>
                <span className="font-medium">{invoice.InvoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tedarikçi:</span>
                <span className="font-medium">{invoice.SenderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vergi No:</span>
                <span className="font-medium">{invoice.SenderTaxNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Para Birimi:</span>
                <span className="font-medium">{invoice.CurrencyCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toplam Tutar:</span>
                <span className="font-semibold text-primary">
                  {invoice.PayableAmount?.toLocaleString('tr-TR', { 
                    style: 'currency', 
                    currency: invoice.CurrencyCode || 'TRY'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KDV Tutarı:</span>
                <span className="font-medium">
                  {invoice.TaxTotalAmount?.toLocaleString('tr-TR', { 
                    style: 'currency', 
                    currency: invoice.CurrencyCode || 'TRY'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="lg:col-span-2">
            <h4 className="font-medium mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Fatura Kalemleri ({invoiceItems.length})
            </h4>
            {invoiceItems.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Ürün/Hizmet</TableHead>
                      <TableHead className="w-20">Miktar</TableHead>
                      <TableHead className="w-16">Birim</TableHead>
                      <TableHead className="w-24 text-right">Birim Fiyat</TableHead>
                      <TableHead className="w-16 text-center">KDV %</TableHead>
                      <TableHead className="w-24 text-right">Toplam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground">{item.id}</TableCell>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.quantity.toLocaleString('tr-TR')}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">
                          {item.unitPrice.toLocaleString('tr-TR', { 
                            style: 'currency', 
                            currency: invoice.CurrencyCode || 'TRY'
                          })}
                        </TableCell>
                        <TableCell className="text-center">{item.taxRate}%</TableCell>
                        <TableCell className="text-right font-medium">
                          {(item.lineTotal + item.taxAmount).toLocaleString('tr-TR', { 
                            style: 'currency', 
                            currency: invoice.CurrencyCode || 'TRY'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Bu fatura için detay bilgisi bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const filteredInvoices = einvoices.filter(invoice => {
    const matchesSearch = invoice.InvoiceNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
                         invoice.SenderName?.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.StatusDetail?.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  if (!isNilveraAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Nilvera Kimlik Doğrulama Gerekli</h3>
          <p className="text-muted-foreground mb-4">
            E-fatura işlemlerini gerçekleştirmek için Nilvera'ya giriş yapmanız gerekiyor.
          </p>
          <Button onClick={authenticateNilvera} disabled={isAuthenticating}>
            {isAuthenticating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Giriş Yapılıyor...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Nilvera'ya Giriş Yap
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="invoices" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Gelen Faturalar
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Fatura Kes
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "invoices" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchInvoices}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Yenile"
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportToExcel}>
                    Excel'e Aktar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportToPDF}>
                    PDF'e Aktar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <TabsContent value="invoices">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Fatura ara..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="pending">Ödenmemiş</SelectItem>
                    <SelectItem value="partially_paid">Kısmen Ödenmiş</SelectItem>
                    <SelectItem value="paid">Ödenmiş</SelectItem>
                    <SelectItem value="overdue">Gecikmiş</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">E-fatura bulunamadı</h3>
                  <p className="text-muted-foreground">
                    {statusFilter === "all" 
                      ? "Henüz hiç e-fatura kaydı bulunmuyor." 
                      : "Seçilen kriterlere uygun e-fatura bulunamadı."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Fatura No</TableHead>
                        <TableHead>Tedarikçi</TableHead>
                        <TableHead>Fatura Tarihi</TableHead>
                        <TableHead>Son Ödeme Tarihi</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">Toplam</TableHead>
                        <TableHead className="text-center">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <Collapsible key={invoice.UUID} open={expandedInvoices.has(invoice.UUID)}>
                          <CollapsibleTrigger asChild>
                            <TableRow 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => toggleInvoiceExpansion(invoice.UUID)}
                            >
                              <TableCell>
                                {expandedInvoices.has(invoice.UUID) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{invoice.InvoiceNumber}</TableCell>
                              <TableCell>{invoice.SenderName}</TableCell>
                              <TableCell>
                                {invoice.IssueDate ? format(new Date(invoice.IssueDate), 'dd/MM/yyyy', { locale: tr }) : '-'}
                              </TableCell>
                              <TableCell>
                                -
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(invoice.StatusDetail)}
                              </TableCell>
                              <TableCell className="text-right">
                                {invoice.PayableAmount?.toLocaleString('tr-TR', { 
                                  style: 'currency', 
                                  currency: invoice.CurrencyCode || 'TRY'
                                })}
                              </TableCell>
                              <TableCell className="text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewPDF(invoice.UUID)}>
                                      <FileText className="h-4 w-4 mr-2" />
                                      PDF Görüntüle
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <TableRow>
                              <TableCell colSpan={8} className="p-0">
                                <InvoiceDetailsContent invoice={invoice} />
                              </TableCell>
                            </TableRow>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <EInvoiceForm 
            onClose={() => setActiveTab("invoices")} 
            onSuccess={() => {
              setActiveTab("invoices");
              fetchInvoices();
            }} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceManagementTab;