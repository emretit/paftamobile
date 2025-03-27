
import React, { useState } from "react";
import { usePurchaseInvoices } from "@/hooks/usePurchaseInvoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Card } from "@/components/ui/card";
import { Search, FileDown, Filter, Receipt, AlertCircle, Loader } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { InvoiceStatusBadge } from "@/components/purchase/StatusBadge";
import { InvoiceStatus } from "@/types/purchase";
import { formatMoney } from "@/components/purchase/constants";

const InvoiceManagementTab = () => {
  const { 
    invoices, 
    isLoading, 
    error, 
    filters, 
    setFilters,
    refetch 
  } = usePurchaseInvoices();
  
  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, status: status === "all" ? "" : status });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleDateRangeChange = (range: { from: Date | null, to: Date | null }) => {
    setFilters({ ...filters, dateRange: range });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR').format(date);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Faturalar yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertCircle className="h-8 w-8 mb-4" />
        <p>Veriler yüklenirken bir hata oluştu</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
          Yeniden Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Toplam Fatura</h3>
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{invoices?.length || 0}</p>
        </Card>
        
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Ödeme Bekleyen</h3>
            <InvoiceStatusBadge status="pending" size="sm" />
          </div>
          <p className="text-2xl font-bold">
            {invoices?.filter(invoice => invoice.status === 'pending').length || 0}
          </p>
        </Card>
        
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Kısmen Ödenen</h3>
            <InvoiceStatusBadge status="partially_paid" size="sm" />
          </div>
          <p className="text-2xl font-bold">
            {invoices?.filter(invoice => invoice.status === 'partially_paid').length || 0}
          </p>
        </Card>
        
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Vadesi Geçmiş</h3>
            <InvoiceStatusBadge status="overdue" size="sm" />
          </div>
          <p className="text-2xl font-bold">
            {invoices?.filter(invoice => invoice.status === 'overdue').length || 0}
          </p>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Fatura ara..."
              className="pl-9"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
          
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tüm Durumlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Ödeme Bekliyor</SelectItem>
              <SelectItem value="partially_paid">Kısmen Ödendi</SelectItem>
              <SelectItem value="paid">Ödendi</SelectItem>
              <SelectItem value="overdue">Gecikmiş</SelectItem>
              <SelectItem value="cancelled">İptal Edildi</SelectItem>
            </SelectContent>
          </Select>
          
          <DatePickerWithRange
            value={{
              from: filters.dateRange.from,
              to: filters.dateRange.to
            }}
            onChange={handleDateRangeChange}
            className="w-full md:w-auto"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura No</TableHead>
                <TableHead>Tedarikçi</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Fatura Tarihi</TableHead>
                <TableHead>Son Ödeme Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Fatura bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                invoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.supplier_id}</TableCell>
                    <TableCell>{formatMoney(invoice.total_amount, invoice.currency)}</TableCell>
                    <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Detaylar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagementTab;
