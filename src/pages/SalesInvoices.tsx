import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  FileUp, 
  Search, 
  Filter, 
  Download,
  Eye,
  FileText,
  Check,
  X,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useSalesInvoices } from "@/hooks/useSalesInvoices";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutgoingInvoices } from "@/hooks/useOutgoingInvoices";
import { useEarchiveInvoices } from "@/hooks/useEarchiveInvoices";
import OutgoingInvoicesTable from "@/components/sales/OutgoingInvoicesTable";

interface SalesInvoicesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

// Nilvera Gelen E-Faturalar için tip tanımları
interface NilveraIncomingInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierTaxNumber: string;
  invoiceDate: string;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  status: string;
  pdfUrl?: string;
  xmlData?: any;
}

// Gelen E-Faturalar için hook
const useNilveraIncomingInvoices = () => {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading, refetch } = useQuery({
    queryKey: ['nilvera-incoming-invoices'],
    queryFn: async () => {
      console.log('Fetching incoming invoices...');
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { action: 'fetch_incoming' }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data.success) {
        console.error('API error:', data.error);
        throw new Error(data.error || 'Failed to fetch invoices');
      }

      console.log('Successfully fetched invoices:', data.invoices?.length || 0);
      return data.invoices || [];
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  const processInvoiceMutation = useMutation({
    mutationFn: async (invoice: NilveraIncomingInvoice) => {
      // Faturayi purchase_invoices tablosuna kaydet
      const { data, error } = await supabase
        .from('purchase_invoices')
        .insert({
          invoice_number: invoice.invoiceNumber,
          supplier_id: null, // Supplier matching yapılacak
          invoice_date: invoice.invoiceDate,
          due_date: invoice.invoiceDate, // Varsayılan olarak fatura tarihi
          total_amount: invoice.totalAmount,
          subtotal: invoice.totalAmount - invoice.taxAmount,
          tax_amount: invoice.taxAmount,
          paid_amount: 0,
          currency: invoice.currency,
          status: 'pending',
          notes: `E-Fatura - ${invoice.supplierName} (VKN: ${invoice.supplierTaxNumber})`
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('E-Fatura başarıyla işlendi ve alış faturalarına eklendi');
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
    },
    onError: (error) => {
      console.error('Process invoice error:', error);
      toast.error('E-Fatura işlenirken hata oluştu');
    }
  });

  return {
    invoices,
    isLoading,
    refetch,
    processInvoice: processInvoiceMutation.mutate,
    isProcessing: processInvoiceMutation.isPending
  };
};

// Gelen E-Faturalar Tab Bileşeni
const IncomingInvoicesTab = () => {
  const { invoices, isLoading, refetch, processInvoice, isProcessing } = useNilveraIncomingInvoices();
  const [filters, setFilters] = useState({
    search: "",
    dateRange: { from: null as Date | null, to: null as Date | null }
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'alındı yanıtı gönderildi.':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Alındı</Badge>;
      case 'reddedildi':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currencyCode: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd.MM.yyyy", { locale: tr });
    } catch {
      return dateStr;
    }
  };

  const filteredInvoices = invoices.filter((invoice: NilveraIncomingInvoice) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
        invoice.supplierName.toLowerCase().includes(searchLower) ||
        invoice.supplierTaxNumber.includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gelen E-Faturalar</h3>
          <p className="text-sm text-gray-600">Size kesilen e-faturaları işleyip alış faturalarına ekleyin</p>
        </div>
        <Button onClick={() => refetch()} size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Fatura no, tedarikçi adı veya vergi no ile ara..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Button variant="outline" onClick={() => setFilters({
              search: "",
              dateRange: { from: null, to: null }
            })}>
              <Filter className="h-4 w-4 mr-2" />
              Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fatura Listesi */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Gelen e-faturalar yükleniyor...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Gelen e-fatura bulunamadı
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Fatura No</th>
                    <th className="text-left p-4 font-medium text-gray-700">Tedarikçi</th>
                    <th className="text-left p-4 font-medium text-gray-700">Tarih</th>
                    <th className="text-left p-4 font-medium text-gray-700">Tutar</th>
                    <th className="text-left p-4 font-medium text-gray-700">Durum</th>
                    <th className="text-left p-4 font-medium text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice: NilveraIncomingInvoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-blue-600">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{invoice.supplierName}</div>
                        <div className="text-xs text-gray-500">VKN: {invoice.supplierTaxNumber}</div>
                      </td>
                      <td className="p-4">
                        <div>{formatDate(invoice.invoiceDate)}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {formatCurrency(invoice.totalAmount, invoice.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          KDV: {formatCurrency(invoice.taxAmount, invoice.currency)}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => processInvoice(invoice)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            İşle
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Görüntüle</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                XML Görüntüle
                              </DropdownMenuItem>
                              {invoice.pdfUrl && (
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  PDF Yazdır
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SalesInvoices = ({ isCollapsed, setIsCollapsed }: SalesInvoicesProps) => {
  const { 
    invoices, 
    isLoading, 
    filters, 
    setFilters,
  } = useSalesInvoices();
  
  const { outgoingInvoices, isLoading: isLoadingOutgoing, refetch: refetchOutgoing } = useOutgoingInvoices();
  const { earchiveInvoices, isLoading: isLoadingEarchive, refetch: refetchEarchive } = useEarchiveInvoices();
  
  const [dateOpen, setDateOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: any) => {
    switch (status) {
      case 'odendi':
        return <Badge className="bg-green-500">Ödendi</Badge>;
      case 'kismi_odendi':
        return <Badge className="bg-blue-500">Kısmi Ödeme</Badge>;
      case 'odenmedi':
        return <Badge className="bg-amber-500">Ödenmedi</Badge>;
      case 'gecikti':
        return <Badge className="bg-red-500">Gecikti</Badge>;
      case 'iptal':
        return <Badge className="bg-gray-500">İptal</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getDocumentTypeBadge = (type: any) => {
    switch (type) {
      case 'e_fatura':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">e-Fatura</Badge>;
      case 'e_arsiv':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">e-Arşiv</Badge>;
      case 'fatura':
        return <Badge variant="outline" className="border-gray-500 text-gray-700">Fatura</Badge>;
      case 'irsaliye':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">İrsaliye</Badge>;
      case 'makbuz':
        return <Badge variant="outline" className="border-green-500 text-green-700">Makbuz</Badge>;
      case 'serbest_meslek_makbuzu':
        return <Badge variant="outline" className="border-indigo-500 text-indigo-700">SMM</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Analytics calculation
  const totalInvoices = invoices?.length || 0;
  const totalPaid = invoices?.filter(i => i.odeme_durumu === 'odendi').length || 0;
  const totalUnpaid = invoices?.filter(i => i.odeme_durumu === 'odenmedi').length || 0;
  const totalOverdue = invoices?.filter(i => i.odeme_durumu === 'gecikti').length || 0;
  
  const totalAmountSum = invoices?.reduce((sum, invoice) => sum + Number(invoice.toplam_tutar), 0) || 0;
  const paidAmountSum = invoices?.reduce((sum, invoice) => sum + Number(invoice.odenen_tutar), 0) || 0;
  const unpaidAmountSum = totalAmountSum - paidAmountSum;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Satış Faturaları
              </h1>
              <p className="text-gray-600">
                Satış faturalarının yönetimi ve gelen e-faturaların işlenmesi
              </p>
            </div>
            <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90">
              <Plus className="h-4 w-4" />
              <span>Yeni Fatura</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-white shadow-sm">
              <CardContent className="p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Toplam Fatura</span>
                  <FileUp className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{totalInvoices}</p>
                <span className="text-sm text-gray-500">Bu dönem</span>
              </CardContent>
            </Card>
            
            <Card className="p-4 bg-white shadow-sm">
              <CardContent className="p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ödenen</span>
                  <FileUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmountSum)}</p>
                <span className="text-sm text-gray-500">{totalPaid} fatura</span>
              </CardContent>
            </Card>
            
            <Card className="p-4 bg-white shadow-sm">
              <CardContent className="p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bekleyen</span>
                  <FileUp className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(unpaidAmountSum)}</p>
                <span className="text-sm text-gray-500">{totalUnpaid} fatura</span>
              </CardContent>
            </Card>
            
            <Card className="p-4 bg-white shadow-sm">
              <CardContent className="p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Vadesi Geçmiş</span>
                  <FileUp className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">{totalOverdue}</p>
                <span className="text-sm text-gray-500">fatura</span>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">Satış Faturaları</h2>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Dışa Aktar
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ödeme Durumu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="odendi">Ödendi</SelectItem>
                      <SelectItem value="kismi_odendi">Kısmi Ödendi</SelectItem>
                      <SelectItem value="odenmedi">Ödenmedi</SelectItem>
                      <SelectItem value="gecikti">Gecikti</SelectItem>
                      <SelectItem value="iptal">İptal</SelectItem>
                    </SelectContent>
                  </Select>
                   <Button onClick={() => {
                     refetchOutgoing();
                     refetchEarchive();
                   }} size="sm" disabled={isLoadingOutgoing || isLoadingEarchive}>
                     <RefreshCw className={`h-4 w-4 mr-2 ${(isLoadingOutgoing || isLoadingEarchive) ? 'animate-spin' : ''}`} />
                     E-Faturalar
                   </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Fatura no, müşteri adı veya açıklama ile ara..."
                    className="pl-9"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              {isLoading || isLoadingOutgoing || isLoadingEarchive ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-8 w-[80px]" />
                    </div>
                  ))}
                </div>
              ) : (invoices && invoices.length > 0) || (outgoingInvoices && outgoingInvoices.length > 0) || (earchiveInvoices && earchiveInvoices.length > 0) ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-700">Fatura No</th>
                        <th className="text-left p-4 font-medium text-gray-700">Müşteri</th>
                        <th className="text-left p-4 font-medium text-gray-700">Tarih</th>
                        <th className="text-left p-4 font-medium text-gray-700">Tutar</th>
                        <th className="text-left p-4 font-medium text-gray-700">Ödeme Durumu</th>
                        <th className="text-left p-4 font-medium text-gray-700">Tip</th>
                        <th className="text-center p-4 font-medium text-gray-700">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                       {/* Combine all invoices and sort by date */}
                       {[
                         ...(invoices || []).map(invoice => ({
                           ...invoice,
                           sourceType: 'sales',
                           invoiceDate: invoice.fatura_tarihi,
                           sortDate: new Date(invoice.fatura_tarihi).getTime(),
                           displayNumber: invoice.fatura_no,
                           displayCustomer: invoice.customer?.name,
                           displayAmount: invoice.toplam_tutar,
                           displayPaidAmount: invoice.odenen_tutar
                         })),
                         ...(outgoingInvoices || []).map(invoice => ({
                           ...invoice,
                           sourceType: 'outgoing',
                           invoiceDate: invoice.invoiceDate,
                           sortDate: new Date(invoice.invoiceDate).getTime(),
                           displayNumber: invoice.invoiceNumber,
                           displayCustomer: invoice.customerName,
                           displayAmount: invoice.totalAmount,
                           displayPaidAmount: invoice.paidAmount
                         })),
                         ...(earchiveInvoices || []).map(invoice => ({
                           ...invoice,
                           sourceType: 'earchive',
                           invoiceDate: invoice.invoiceDate,
                           sortDate: new Date(invoice.invoiceDate).getTime(),
                           displayNumber: invoice.invoiceNumber,
                           displayCustomer: invoice.customerName,
                           displayAmount: invoice.totalAmount,
                           displayPaidAmount: invoice.paidAmount
                         }))
                       ]
                       .sort((a, b) => b.sortDate - a.sortDate)
                       .map((invoice, index) => (
                         <tr key={`${invoice.sourceType}-${invoice.id}-${index}`} className="border-b hover:bg-gray-50 transition-colors">
                           <td className="p-4">
                             <span className="font-medium text-blue-600">{invoice.displayNumber}</span>
                           </td>
                           <td className="p-4">
                              <div>
                                <div className="font-medium">{invoice.displayCustomer}</div>
                                {invoice.sourceType === 'sales' && (invoice as any).customer?.company && (
                                  <div className="text-sm text-gray-500">{(invoice as any).customer.company}</div>
                                )}
                                {(invoice.sourceType === 'outgoing' || invoice.sourceType === 'earchive') && (
                                  <div className="text-sm text-gray-500">VKN: {(invoice as any).customerTaxNumber}</div>
                                )}
                              </div>
                           </td>
                           <td className="p-4">
                             {format(new Date(invoice.invoiceDate), "dd.MM.yyyy", { locale: tr })}
                           </td>
                           <td className="p-4">
                             <div className="space-y-1">
                               <div className="font-medium">{formatCurrency(invoice.displayAmount)}</div>
                               {invoice.displayPaidAmount > 0 && (
                                 <div className="text-sm text-green-600">Ödenen: {formatCurrency(invoice.displayPaidAmount)}</div>
                               )}
                             </div>
                           </td>
                           <td className="p-4">
                              <div className="space-y-1">
                                {invoice.sourceType === 'sales' ? 
                                  getStatusBadge((invoice as any).odeme_durumu) : 
                                  getStatusBadge((invoice as any).status)
                                }
                                {invoice.sourceType === 'outgoing' && (invoice as any).answerCode && (
                                  <div className="text-xs text-gray-500">{(invoice as any).answerCode}</div>
                                )}
                                {invoice.sourceType === 'earchive' && (invoice as any).statusCode && (
                                  <div className="text-xs text-gray-500">{(invoice as any).statusCode}</div>
                                )}
                              </div>
                           </td>
                           <td className="p-4">
                             {invoice.sourceType === 'sales' && getDocumentTypeBadge((invoice as any).document_type)}
                             {invoice.sourceType === 'outgoing' && (
                               <Badge variant="outline" className="border-green-500 text-green-700">Giden E-Fatura</Badge>
                             )}
                             {invoice.sourceType === 'earchive' && (
                               <Badge variant="outline" className="border-purple-500 text-purple-700">E-Arşiv</Badge>
                             )}
                           </td>
                           <td className="p-4 text-center">
                             <Button variant="outline" size="sm">
                               <Eye className="h-4 w-4" />
                             </Button>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz fatura bulunmuyor</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SalesInvoices;