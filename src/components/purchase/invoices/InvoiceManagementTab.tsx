
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
  ChevronRight
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
import { Invoice, InvoiceDetail } from "@/types/invoice";

export const InvoiceManagementTab = () => {
  const [activeTab, setActiveTab] = useState("invoices");
  const [isNilveraAuthenticated, setIsNilveraAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [einvoices, setEinvoices] = useState<Invoice[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());
  const [invoiceDetails, setInvoiceDetails] = useState<Record<string, InvoiceDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  
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

  const fetchInvoiceDetails = async (invoiceId: string) => {
    // If details already loaded, don't fetch again
    if (invoiceDetails[invoiceId]) {
      return;
    }

    setLoadingDetails(prev => new Set([...prev, invoiceId]));
    
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'get_invoice_details',
          invoice: { invoiceId }
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setInvoiceDetails(prev => ({
          ...prev,
          [invoiceId]: data.invoiceDetails
        }));
      } else {
        throw new Error(data.error || 'Fatura detayları getirilemedi');
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Fatura detayları getirilemedi.",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoiceId);
        return newSet;
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const toggleInvoiceExpansion = async (invoiceId: string) => {
    const newExpanded = new Set(expandedInvoices);
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId);
    } else {
      newExpanded.add(invoiceId);
      // Fetch details when expanding
      await fetchInvoiceDetails(invoiceId);
    }
    setExpandedInvoices(newExpanded);
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
      format(new Date(invoice.invoiceDate), 'dd/MM/yyyy'),
      invoice.dueDate ? format(new Date(invoice.dueDate), 'dd/MM/yyyy') : '-',
      getStatusText(invoice.status),
      invoice.totalAmount,
      invoice.paidAmount,
      invoice.totalAmount - invoice.paidAmount
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
      format(new Date(invoice.invoiceDate), 'dd/MM/yyyy'),
      getStatusText(invoice.status),
      `${invoice.totalAmount.toLocaleString('tr-TR')} ${invoice.currency}`
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

  const filteredInvoices = einvoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
                         invoice.supplierName?.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
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
                        <TableHead>Fatura No</TableHead>
                        <TableHead>Tedarikçi</TableHead>
                        <TableHead>Fatura Tarihi</TableHead>
                        <TableHead>Son Ödeme Tarihi</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">Toplam</TableHead>
                        <TableHead className="text-right">Ödenen</TableHead>
                        <TableHead className="text-center">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <React.Fragment key={invoice.id}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleInvoiceExpansion(invoice.id)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {expandedInvoices.has(invoice.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                {invoice.invoiceNumber}
                              </div>
                            </TableCell>
                            <TableCell>{invoice.supplierName}</TableCell>
                            <TableCell>
                              {format(new Date(invoice.invoiceDate), 'dd/MM/yyyy', { locale: tr })}
                            </TableCell>
                            <TableCell>
                              {invoice.dueDate 
                                ? format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: tr })
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(invoice.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              {invoice.totalAmount.toLocaleString('tr-TR', { 
                                style: 'currency', 
                                currency: invoice.currency 
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              {invoice.paidAmount.toLocaleString('tr-TR', { 
                                style: 'currency', 
                                currency: invoice.currency 
                              })}
                            </TableCell>
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewPDF(invoice.id)}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    PDF Görüntüle
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                          
                          {expandedInvoices.has(invoice.id) && (
                            <TableRow>
                              <TableCell colSpan={8} className="bg-muted/20 p-0">
                                <div className="p-4 space-y-4">
                                  {loadingDetails.has(invoice.id) ? (
                                    <div className="flex items-center justify-center py-8">
                                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                      <span>Fatura detayları yükleniyor...</span>
                                    </div>
                                  ) : invoiceDetails[invoice.id] ? (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <h4 className="font-medium text-sm mb-2">Fatura Bilgileri</h4>
                                          <div className="space-y-1 text-sm">
                                            <div><span className="font-medium">Vergi Numarası:</span> {invoice.supplierTaxNumber || '-'}</div>
                                            <div><span className="font-medium">Para Birimi:</span> {invoice.currency}</div>
                                            <div><span className="font-medium">Vergi Tutarı:</span> {invoice.taxAmount?.toLocaleString('tr-TR', { style: 'currency', currency: invoice.currency }) || '-'}</div>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <h4 className="font-medium text-sm mb-2">Ödeme Bilgileri</h4>
                                          <div className="space-y-1 text-sm">
                                            <div><span className="font-medium">Toplam Tutar:</span> {invoice.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: invoice.currency })}</div>
                                            <div><span className="font-medium">Ödenen Tutar:</span> {invoice.paidAmount.toLocaleString('tr-TR', { style: 'currency', currency: invoice.currency })}</div>
                                            <div><span className="font-medium">Kalan Tutar:</span> {(invoice.totalAmount - invoice.paidAmount).toLocaleString('tr-TR', { style: 'currency', currency: invoice.currency })}</div>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <h4 className="font-medium text-sm mb-2">Diğer Bilgiler</h4>
                                          <div className="space-y-1 text-sm">
                                            <div><span className="font-medium">Nilvera ID:</span> {invoice.id}</div>
                                            <div><span className="font-medium">Oluşturma Tarihi:</span> {format(new Date(invoice.invoiceDate), 'dd/MM/yyyy HH:mm', { locale: tr })}</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {invoiceDetails[invoice.id].items && invoiceDetails[invoice.id].items.length > 0 && (
                                        <div>
                                          <h4 className="font-medium text-sm mb-2">Fatura Kalemleri</h4>
                                          <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                              <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                  <TableHead className="h-8 text-xs">Ürün Kodu</TableHead>
                                                  <TableHead className="h-8 text-xs">Açıklama</TableHead>
                                                  <TableHead className="h-8 text-xs text-right">Miktar</TableHead>
                                                  <TableHead className="h-8 text-xs text-right">Birim</TableHead>
                                                  <TableHead className="h-8 text-xs text-right">Birim Fiyat</TableHead>
                                                  <TableHead className="h-8 text-xs text-right">KDV Oranı</TableHead>
                                                  <TableHead className="h-8 text-xs text-right">KDV Tutarı</TableHead>
                                                  <TableHead className="h-8 text-xs text-right">Toplam</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {invoiceDetails[invoice.id].items.map((item, index) => (
                                                  <TableRow key={index} className="text-sm">
                                                    <TableCell className="py-2 font-medium">{item.productCode || '-'}</TableCell>
                                                    <TableCell className="py-2">{item.description || '-'}</TableCell>
                                                    <TableCell className="py-2 text-right">{item.quantity?.toLocaleString('tr-TR') || '-'}</TableCell>
                                                    <TableCell className="py-2 text-right">{item.unit || '-'}</TableCell>
                                                    <TableCell className="py-2 text-right">
                                                      {item.unitPrice ? item.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: invoice.currency }) : '-'}
                                                    </TableCell>
                                                    <TableCell className="py-2 text-right">{item.vatRate ? `%${item.vatRate}` : '-'}</TableCell>
                                                    <TableCell className="py-2 text-right">
                                                      {item.vatAmount ? item.vatAmount.toLocaleString('tr-TR', { style: 'currency', currency: invoice.currency }) : '-'}
                                                    </TableCell>
                                                    <TableCell className="py-2 text-right">
                                                      {item.totalAmount ? item.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: invoice.currency }) : '-'}
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                      Fatura detayları yüklenemedi
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
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
