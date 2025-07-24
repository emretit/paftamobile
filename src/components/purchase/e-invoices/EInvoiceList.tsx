import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  RefreshCw, 
  Eye, 
  Package, 
  FileText, 
  Calendar,
  Building,
  DollarSign,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useIncomingInvoices } from '@/hooks/useIncomingInvoices';
import { useToast } from '@/hooks/use-toast';
import EInvoiceProcessModal from './EInvoiceProcessModal';

export default function EInvoiceList() {
  const { incomingInvoices, isLoading, refetch } = useIncomingInvoices();
  const { toast } = useToast();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  // Filter unprocessed invoices only (not answered or processed)
  const unprocessedInvoices = incomingInvoices.filter(invoice => {
    // Only show invoices that haven't been answered with "ALINDI" 
    const isAnswered = invoice.responseStatus === 'ALINDI' || invoice.responseStatus === 'documentAnsweredAutomatically';
    return !isAnswered;
  });

  // Apply filters
  const filteredInvoices = unprocessedInvoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplierTaxNumber.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'unanswered' && !invoice.isAnswered) ||
      (statusFilter === 'pending' && invoice.status === 'pending') ||
      (statusFilter === 'overdue' && new Date(invoice.dueDate || invoice.invoiceDate) < new Date());

    const matchesDate = dateFilter === 'all' ||
      (dateFilter === 'today' && format(new Date(invoice.invoiceDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) ||
      (dateFilter === 'week' && new Date(invoice.invoiceDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(invoice.invoiceDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (invoice: any) => {
    if (invoice.isAnswered) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Cevaplanmış</Badge>;
    }
    
    const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date();
    if (isOverdue) {
      return <Badge variant="destructive">Gecikmiş</Badge>;
    }

    return <Badge variant="outline" className="bg-orange-100 text-orange-800">Cevaplanmadı</Badge>;
  };

  const handleProcessInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsProcessModalOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Yenilendi",
      description: "E-fatura listesi güncellendi"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400">
                İşlenmemiş E-Faturalar
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Henüz işlenmemiş gelen e-faturaları görüntüleyin ve işleme alın
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {filteredInvoices.length} Fatura
              </Badge>
              <Button 
                onClick={handleRefresh} 
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600"
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
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Fatura no, firma adı veya vergi no ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="unanswered">Cevaplanmamış</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="overdue">Gecikmiş</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tarih filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tarihler</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Bu Hafta</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="flex items-center p-4">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Toplam</p>
                  <p className="text-2xl font-bold text-blue-900">{unprocessedInvoices.length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="flex items-center p-4">
                <Clock className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-600">Cevaplanmamış</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {unprocessedInvoices.filter(inv => !inv.isAnswered).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardContent className="flex items-center p-4">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-600">Gecikmiş</p>
                  <p className="text-2xl font-bold text-red-900">
                    {unprocessedInvoices.filter(inv => 
                      inv.dueDate && new Date(inv.dueDate) < new Date()
                    ).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="flex items-center p-4">
                <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">Toplam Tutar</p>
                  <p className="text-lg font-bold text-green-900">
                    {filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString('tr-TR')} ₺
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-2 text-muted-foreground">E-faturalar yükleniyor...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">İşlenmemiş E-Fatura Bulunamadı</h3>
              <p className="text-muted-foreground">
                Tüm e-faturalar işlenmiş durumda veya filtre kriterlerinize uygun fatura bulunmuyor.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Durum</TableHead>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>Tedarikçi</TableHead>
                  <TableHead>Vergi No</TableHead>
                  <TableHead>Fatura Tarihi</TableHead>
                  <TableHead>Vade Tarihi</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead>Para Birimi</TableHead>
                  <TableHead className="text-center">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/50">
                    <TableCell>
                      {getStatusBadge(invoice)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-muted-foreground mr-2" />
                        {invoice.supplierName}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {invoice.supplierTaxNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        {format(new Date(invoice.invoiceDate), 'dd.MM.yyyy', { locale: tr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {invoice.dueDate ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                          {format(new Date(invoice.dueDate), 'dd.MM.yyyy', { locale: tr })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {invoice.totalAmount.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{invoice.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcessInvoice(invoice)}
                          className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                        >
                          <Package className="h-4 w-4 mr-1" />
                          İşle
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement preview functionality
                            toast({
                              title: "Önizleme",
                              description: "Fatura önizlemesi yakında eklenecek"
                            });
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Process Modal */}
      {selectedInvoice && (
        <EInvoiceProcessModal
          invoice={selectedInvoice}
          isOpen={isProcessModalOpen}
          onClose={() => {
            setIsProcessModalOpen(false);
            setSelectedInvoice(null);
          }}
          onProcessComplete={() => {
            setIsProcessModalOpen(false);
            setSelectedInvoice(null);
            refetch(); // Refresh the list
          }}
        />
      )}
    </div>
  );
}