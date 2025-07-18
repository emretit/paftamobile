import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  RefreshCw,
  Search, 
  Loader2, 
  FileText, 
  Package,
  ChevronDown,
  ChevronRight,
  Download,
  Database,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
  status: string;
  invoiceLines?: any[];
  productNames?: string[];
  enhancedAt?: string;
}

export const InvoiceManagementTab = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [syncingInvoices, setSyncingInvoices] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Faturaları yükleniyor...');
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { action: 'fetchInvoices' }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      console.log('📥 API Response:', data);

      if (data.success) {
        setInvoices(data.invoices || []);
        toast({
          title: "✅ Başarılı",
          description: `${data.invoices?.length || 0} fatura yüklendi`
        });
      } else {
        throw new Error(data.message || 'Faturalar yüklenemedi');
      }
    } catch (error: any) {
      console.error('❌ Load invoices error:', error);
      toast({
        title: "❌ Hata",
        description: error.message || "Faturalar yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRowExpansion = (invoiceId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId);
    } else {
      newExpanded.add(invoiceId);
    }
    setExpandedRows(newExpanded);
  };

  const syncInvoiceToSystem = async (invoice: Invoice) => {
    setSyncingInvoices(prev => new Set([...prev, invoice.id]));
    
    try {
      const { error } = await supabase
        .from('einvoices')
        .upsert({
          nilvera_id: invoice.id,
          invoice_number: invoice.invoiceNumber,
          supplier_name: invoice.supplierName,
          invoice_date: invoice.invoiceDate,
          total_amount: invoice.totalAmount,
          currency: invoice.currency,
          status: invoice.status,
          raw_data: invoice,
          synced_at: new Date().toISOString()
        }, {
          onConflict: 'nilvera_id'
        });

      if (error) throw error;

      toast({
        title: "✅ Başarılı",
        description: `Fatura ${invoice.invoiceNumber} sisteme kaydedildi`
      });
    } catch (error: any) {
      console.error('❌ Sync error:', error);
      toast({
        title: "❌ Hata", 
        description: "Fatura sisteme kaydedilirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSyncingInvoices(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoice.id);
        return newSet;
      });
    }
  };

  const downloadInvoicePDF = async (invoiceId: string) => {
    try {
      // PDF indirme işlemi - Nilvera API'den PDF çekilebilir
      toast({
        title: "📄 PDF İndiriliyor",
        description: "Fatura PDF'i hazırlanıyor...",
      });
    } catch (error: any) {
      toast({
        title: "❌ Hata",
        description: "PDF indirilemedi",
        variant: "destructive",
      });
    }
  };

  // Arama filtresi
  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.productNames?.some(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'PENDING': { label: 'Bekliyor', variant: 'default' as const },
      'APPROVED': { label: 'Onaylandı', variant: 'secondary' as const },
      'PAID': { label: 'Ödendi', variant: 'success' as const },
      'REJECTED': { label: 'Reddedildi', variant: 'destructive' as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { 
      label: status || 'Bilinmiyor', 
      variant: 'outline' as const 
    };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Gelen E-Faturalar</h2>
          <p className="text-gray-600">Nilvera üzerinden gelen faturalarınızı yönetin</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={loadInvoices} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Yenile
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Fatura no, tedarikçi adı veya ürün adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Fatura</p>
                <p className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredInvoices.reduce((sum, inv) => sum + (inv.productNames?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Tutar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Fatura Listesi ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Faturalar yükleniyor...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Fatura Bulunamadı</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Arama kriterlerinize uygun fatura bulunamadı.' : 'Henüz fatura yok.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Tedarikçi</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Ürünler</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <React.Fragment key={invoice.id}>
                      {/* Ana satır */}
                      <TableRow 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleRowExpansion(invoice.id)}
                      >
                        <TableCell>
                          {expandedRows.has(invoice.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>{invoice.supplierName}</TableCell>
                        <TableCell>
                          {new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {invoice.productNames?.length || invoice.invoiceLines?.length || 0} ürün
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {invoice.totalAmount.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: invoice.currency || 'TRY'
                          })}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadInvoicePDF(invoice.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => syncInvoiceToSystem(invoice)}
                              disabled={syncingInvoices.has(invoice.id)}
                            >
                              {syncingInvoices.has(invoice.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Database className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Detay satırı */}
                      {expandedRows.has(invoice.id) && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50/50 p-6">
                            <div className="space-y-4">
                              {/* Ürün Listesi */}
                              {(invoice.productNames?.length > 0 || invoice.invoiceLines?.length > 0) && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    Fatura Kalemleri
                                  </h4>
                                  
                                  {/* Önce gerçek ürün isimlerini göster */}
                                  {invoice.productNames && invoice.productNames.length > 0 && (
                                    <div className="mb-4">
                                      <p className="text-sm font-medium text-gray-700 mb-2">Ürün/Hizmet Adları:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {invoice.productNames.map((productName, index) => (
                                          <Badge key={index} variant="secondary" className="text-sm">
                                            {productName}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Detaylı fatura satırları */}
                                  {invoice.invoiceLines && invoice.invoiceLines.length > 0 && (
                                    <div className="border rounded-lg overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-gray-100">
                                            <TableHead className="text-xs">Ürün Adı</TableHead>
                                            <TableHead className="text-xs text-right">Miktar</TableHead>
                                            <TableHead className="text-xs text-right">Birim</TableHead>
                                            <TableHead className="text-xs text-right">Birim Fiyat</TableHead>
                                            <TableHead className="text-xs text-right">KDV %</TableHead>
                                            <TableHead className="text-xs text-right">Toplam</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {invoice.invoiceLines.map((line: any, index: number) => (
                                            <TableRow key={index} className="text-sm">
                                              <TableCell className="font-medium">
                                                {line.name || line.description || `Ürün ${index + 1}`}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                {line.quantity?.toLocaleString('tr-TR') || '-'}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                {line.unitType || 'Adet'}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                {line.price ? 
                                                  line.price.toLocaleString('tr-TR', { 
                                                    style: 'currency', 
                                                    currency: invoice.currency || 'TRY' 
                                                  }) : '-'
                                                }
                                              </TableCell>
                                              <TableCell className="text-right">
                                                <Badge variant="outline" className="text-xs">
                                                  %{line.kdvPercent || 0}
                                                </Badge>
                                              </TableCell>
                                              <TableCell className="text-right font-medium">
                                                {((line.quantity || 0) * (line.price || 0) + (line.kdvTotal || 0))
                                                  .toLocaleString('tr-TR', { 
                                                    style: 'currency', 
                                                    currency: invoice.currency || 'TRY' 
                                                  })}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Debug bilgisi (geliştirme aşamasında) */}
                              {invoice.enhancedAt && (
                                <div className="text-xs text-gray-500 border-t pt-3">
                                  Son güncelleme: {new Date(invoice.enhancedAt).toLocaleString('tr-TR')}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 