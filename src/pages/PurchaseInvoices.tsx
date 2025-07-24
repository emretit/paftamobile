
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  FileText, 
  Calendar, 
  Eye,
  Edit,
  CreditCard,
  Trash2
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { usePurchaseInvoices } from '@/hooks/usePurchaseInvoices';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import InvoiceManagementTab from "@/components/purchase/invoices/InvoiceManagementTab";

interface PurchaseInvoicesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const PurchaseInvoices = ({ isCollapsed, setIsCollapsed }: PurchaseInvoicesProps) => {
  const [activeTab, setActiveTab] = useState('processed');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const { 
    invoices, 
    isLoading, 
    filters, 
    setFilters, 
    updateInvoiceMutation,
    recordPaymentMutation,
    deleteInvoiceMutation 
  } = usePurchaseInvoices();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setFilters({ ...filters, status: value });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    const safeRange = range || { from: undefined, to: undefined };
    setDateRange(safeRange);
    const convertedRange = {
      from: safeRange.from || null,
      to: safeRange.to || null
    };
    setFilters({ ...filters, dateRange: convertedRange });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Bekliyor', variant: 'secondary' as const },
      paid: { label: 'Ödendi', variant: 'default' as const },
      partially_paid: { label: 'Kısmi Ödendi', variant: 'outline' as const },
      overdue: { label: 'Gecikmiş', variant: 'destructive' as const },
      cancelled: { label: 'İptal', variant: 'destructive' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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
                Alış Faturaları
              </h1>
              <p className="text-gray-600">
                Alış faturalarının yönetimi
              </p>
            </div>
            <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90">
              <Plus className="h-4 w-4" />
              <span>Yeni Fatura</span>
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('processed')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'processed'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  İşlenmiş Faturalar
                  <Badge variant="secondary">{invoices?.length || 0}</Badge>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('incoming')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'incoming'
                    ? 'border-orange-500 text-orange-700 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Gelen E-Faturalar
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'processed' ? (
                <>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Fatura no, tedarikçi ara..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Durum Filtrele" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Durumlar</SelectItem>
                        <SelectItem value="pending">Bekliyor</SelectItem>
                        <SelectItem value="paid">Ödendi</SelectItem>
                        <SelectItem value="partially_paid">Kısmi Ödendi</SelectItem>
                        <SelectItem value="overdue">Gecikmiş</SelectItem>
                        <SelectItem value="cancelled">İptal</SelectItem>
                      </SelectContent>
                    </Select>
                    <DatePickerWithRange
                      value={dateRange}
                      onChange={handleDateRangeChange}
                    />
                  </div>

                  {/* Purchase Invoices Table */}
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fatura No</TableHead>
                          <TableHead>Tedarikçi</TableHead>
                          <TableHead>Tarih</TableHead>
                          <TableHead>Vade</TableHead>
                          <TableHead>Toplam</TableHead>
                          <TableHead>Ödenen</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              Yükleniyor...
                            </TableCell>
                          </TableRow>
                        ) : invoices?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              Henüz fatura bulunmuyor
                            </TableCell>
                          </TableRow>
                        ) : (
                          invoices?.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                              <TableCell>{invoice.supplier_id}</TableCell>
                              <TableCell>
                                {format(new Date(invoice.invoice_date), 'dd.MM.yyyy', { locale: tr })}
                              </TableCell>
                              <TableCell>
                                {format(new Date(invoice.due_date), 'dd.MM.yyyy', { locale: tr })}
                              </TableCell>
                              <TableCell>
                                {invoice.total_amount.toLocaleString('tr-TR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })} {invoice.currency}
                              </TableCell>
                              <TableCell>
                                {invoice.paid_amount.toLocaleString('tr-TR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })} {invoice.currency}
                              </TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <CreditCard className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <InvoiceManagementTab />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseInvoices;
