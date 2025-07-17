import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, Plus, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EInvoiceForm from "@/components/einvoice/EInvoiceForm";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";

interface EInvoice {
  id: string;
  invoice_number: string;
  supplier_name: string;
  supplier_tax_number?: string;
  invoice_date: string;
  due_date?: string;
  status: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  currency: string;
  tax_amount: number;
  nilvera_id?: string;
  pdf_url?: string;
  created_at: string;
}

const EInvoiceManagement = () => {
  const [invoices, setInvoices] = useState<EInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('einvoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (dateFrom) {
        query = query.gte('invoice_date', format(dateFrom, 'yyyy-MM-dd'));
      }

      if (dateTo) {
        query = query.lte('invoice_date', format(dateTo, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvoices((data || []) as EInvoice[]);
    } catch (error) {
      console.error('Faturalar yüklenirken hata:', error);
      toast.error('Faturalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const authenticateNilvera = async () => {
    try {
      setIsAuthenticating(true);
      
      // Call edge function to authenticate with Nilvera
      const { data, error } = await supabase.functions.invoke('nilvera-auth', {
        body: { action: 'authenticate' }
      });

      if (error) throw error;
      
      if (data.success) {
        setIsAuthenticated(true);
        toast.success('Nilvera ile başarıyla bağlandı');
        // Fetch invoices from Nilvera
        await fetchNilveraInvoices();
      } else {
        throw new Error(data.error || 'Kimlik doğrulama başarısız');
      }
    } catch (error) {
      console.error('Nilvera kimlik doğrulama hatası:', error);
      toast.error('Nilvera bağlantısı kurulamadı');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchNilveraInvoices = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { action: 'fetch_incoming' }
      });

      if (error) throw error;
      
      if (data.success) {
        // Sync invoices with local database
        await syncInvoices(data.invoices);
        toast.success('Faturalar Nilvera\'dan güncellendi');
        fetchInvoices();
      }
    } catch (error) {
      console.error('Nilvera fatura çekme hatası:', error);
      toast.error('Faturalar Nilvera\'dan alınamadı');
    }
  };

  const syncInvoices = async (nilveraInvoices: any[]) => {
    for (const invoice of nilveraInvoices) {
      try {
        const { error } = await supabase
          .from('einvoices')
          .upsert({
            invoice_number: invoice.invoiceNumber,
            supplier_name: invoice.supplierName,
            supplier_tax_number: invoice.supplierTaxNumber,
            invoice_date: invoice.invoiceDate,
            due_date: invoice.dueDate,
            status: mapNilveraStatus(invoice.status),
            total_amount: invoice.totalAmount,
            paid_amount: invoice.paidAmount || 0,
            remaining_amount: invoice.totalAmount - (invoice.paidAmount || 0),
            currency: invoice.currency || 'TRY',
            tax_amount: invoice.taxAmount || 0,
            nilvera_id: invoice.id,
            pdf_url: invoice.pdfUrl,
            xml_data: invoice.xmlData
          }, { 
            onConflict: 'nilvera_id',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error('Fatura senkronizasyon hatası:', error);
        }
      } catch (error) {
        console.error('Fatura işleme hatası:', error);
      }
    }
  };

  const mapNilveraStatus = (status: string): EInvoice['status'] => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'paid';
      case 'partial': return 'partially_paid';
      case 'overdue': return 'overdue';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  const getStatusBadge = (status: EInvoice['status']) => {
    const statusConfig = {
      pending: { label: 'Beklemede', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Ödendi', className: 'bg-green-100 text-green-800' },
      partially_paid: { label: 'Kısmen Ödendi', className: 'bg-blue-100 text-blue-800' },
      overdue: { label: 'Gecikmiş', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'İptal', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportExcel = () => {
    const exportData = filteredInvoices.map(invoice => ({
      'Fatura No': invoice.invoice_number,
      'Tedarikçi': invoice.supplier_name,
      'Fatura Tarihi': format(new Date(invoice.invoice_date), 'dd.MM.yyyy'),
      'Son Ödeme Tarihi': invoice.due_date ? format(new Date(invoice.due_date), 'dd.MM.yyyy') : '-',
      'Durum': getStatusBadge(invoice.status).props.children,
      'Toplam Tutar': `${invoice.total_amount.toLocaleString('tr-TR')} ${invoice.currency}`,
      'Ödenen Tutar': `${invoice.paid_amount.toLocaleString('tr-TR')} ${invoice.currency}`,
      'Kalan Tutar': `${invoice.remaining_amount.toLocaleString('tr-TR')} ${invoice.currency}`
    }));
    
    exportToExcel(exportData, 'e-faturalar');
  };

  const handleExportPDF = () => {
    exportToPDF(filteredInvoices, 'e-faturalar', [
      { header: 'Fatura No', dataKey: 'invoice_number' },
      { header: 'Tedarikçi', dataKey: 'supplier_name' },
      { header: 'Fatura Tarihi', dataKey: 'invoice_date' },
      { header: 'Toplam Tutar', dataKey: 'total_amount' }
    ]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">E-Fatura Yönetimi</h1>
        <div className="flex gap-2">
          {!isAuthenticated && (
            <Button
              onClick={authenticateNilvera}
              disabled={isAuthenticating}
              variant="outline"
            >
              {isAuthenticating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Nilvera Bağlan
            </Button>
          )}
          {isAuthenticated && (
            <Button
              onClick={fetchNilveraInvoices}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Fatura Güncelle
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni E-Fatura Ekle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Fatura no veya tedarikçi ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Ödenmemiş</SelectItem>
            <SelectItem value="partially_paid">Kısmen Ödenmiş</SelectItem>
            <SelectItem value="paid">Ödenmiş</SelectItem>
            <SelectItem value="overdue">Gecikmiş</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "dd.MM.yyyy") : "Başlangıç"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} locale={tr} />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "dd.MM.yyyy") : "Bitiş"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={dateTo} onSelect={setDateTo} locale={tr} />
          </PopoverContent>
        </Popover>

        <Button onClick={fetchInvoices} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Yenile
        </Button>

        <Button onClick={handleExportExcel} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Excel
        </Button>

        <Button onClick={handleExportPDF} variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </Button>
      </div>

      {/* Invoice Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fatura No</TableHead>
              <TableHead>Tedarikçi</TableHead>
              <TableHead>Fatura Tarihi</TableHead>
              <TableHead>Son Ödeme Tarihi</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">Toplam Tutar</TableHead>
              <TableHead className="text-right">Ödenen Tutar</TableHead>
              <TableHead className="text-right">Kalan Tutar</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Yükleniyor...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  Fatura bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.supplier_name}</TableCell>
                  <TableCell>{format(new Date(invoice.invoice_date), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    {invoice.due_date ? format(new Date(invoice.due_date), 'dd.MM.yyyy') : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    {invoice.total_amount.toLocaleString('tr-TR')} {invoice.currency}
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.paid_amount.toLocaleString('tr-TR')} {invoice.currency}
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.remaining_amount.toLocaleString('tr-TR')} {invoice.currency}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {invoice.pdf_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(invoice.pdf_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <EInvoiceForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
};

export default EInvoiceManagement;