
import React, { useState } from "react";
import { usePurchaseInvoices } from "@/hooks/usePurchaseInvoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Search, FileText, FileCheck, Clock, AlertCircle, Wallet, Plus, FileClock, FileX, Loader } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSalesInvoices } from "@/hooks/useSalesInvoices";

const invoiceStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  partially_paid: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-200 text-gray-800"
};

const InvoiceManagementTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("incoming");
  const { 
    invoices: purchaseInvoices, 
    isLoading: isPurchaseLoading, 
    error: purchaseError, 
    filters: purchaseFilters, 
    setFilters: setPurchaseFilters,
    refetch: refetchPurchase
  } = usePurchaseInvoices();
  
  const { 
    invoices: salesInvoices, 
    isLoading: isSalesLoading, 
    error: salesError,
    filters: salesFilters,
    setFilters: setSalesFilters,
    refetch: refetchSales
  } = useSalesInvoices();

  const handleStatusChange = (status: string) => {
    if (activeSubTab === "incoming") {
      setPurchaseFilters({ ...purchaseFilters, status });
    } else {
      setSalesFilters({ ...salesFilters, status });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeSubTab === "incoming") {
      setPurchaseFilters({ ...purchaseFilters, search: e.target.value });
    } else {
      setSalesFilters({ ...salesFilters, search: e.target.value });
    }
  };

  const handleDateRangeChange = (range: { from: Date | null, to: Date | null }) => {
    if (activeSubTab === "incoming") {
      setPurchaseFilters({ ...purchaseFilters, dateRange: range });
    } else {
      setSalesFilters({ ...salesFilters, dateRange: range });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR').format(date);
  };

  const formatMoney = (amount: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency || 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colorClass = invoiceStatusColors[status as keyof typeof invoiceStatusColors] || "bg-gray-100 text-gray-800";
    const statusLabels: Record<string, string> = {
      pending: "Ödenmedi",
      paid: "Ödendi",
      partially_paid: "Kısmi Ödendi",
      overdue: "Gecikmiş",
      cancelled: "İptal",
      // Turkish mappings
      odenmedi: "Ödenmedi",
      odendi: "Ödendi",
      kismi_odendi: "Kısmi Ödendi",
      gecikti: "Gecikmiş",
      iptal: "İptal"
    };
    
    return (
      <Badge variant="outline" className={colorClass}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  // Helper for rendering loading state
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-gray-500">Faturalar yükleniyor...</p>
    </div>
  );

  // Helper for rendering error state
  const ErrorState = ({ refetchFn }: { refetchFn: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 text-destructive">
      <AlertCircle className="h-8 w-8 mb-4" />
      <p>Veriler yüklenirken bir hata oluştu</p>
      <Button variant="outline" size="sm" onClick={refetchFn} className="mt-4">
        Yeniden Dene
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="incoming" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Gelen Faturalar
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex items-center">
            <FileCheck className="h-4 w-4 mr-2" />
            Giden Faturalar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Toplam Fatura</h3>
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{purchaseInvoices?.length || 0}</p>
            </Card>
            
            <Card className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Ödenmemiş</h3>
                <FileClock className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">
                {purchaseInvoices?.filter(invoice => invoice.status === 'pending').length || 0}
              </p>
            </Card>
            
            <Card className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Ödenmiş</h3>
                <Wallet className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold">
                {purchaseInvoices?.filter(invoice => invoice.status === 'paid').length || 0}
              </p>
            </Card>
            
            <Card className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Gecikmiş</h3>
                <FileX className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-2xl font-bold">
                {purchaseInvoices?.filter(invoice => invoice.status === 'overdue').length || 0}
              </p>
            </Card>
          </div>

          <div className="flex justify-end mb-4">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yeni Fatura Ekle
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Fatura ara..."
                  className="pl-9"
                  value={purchaseFilters.search}
                  onChange={handleSearchChange}
                />
              </div>
              
              <Select
                value={purchaseFilters.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tüm Durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Ödenmedi</SelectItem>
                  <SelectItem value="paid">Ödendi</SelectItem>
                  <SelectItem value="partially_paid">Kısmi Ödendi</SelectItem>
                  <SelectItem value="overdue">Gecikmiş</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
              
              <DatePickerWithRange
                value={{
                  from: purchaseFilters.dateRange.from,
                  to: purchaseFilters.dateRange.to
                }}
                onChange={handleDateRangeChange}
                className="w-full md:w-auto"
              />
            </div>

            {isPurchaseLoading ? (
              <LoadingState />
            ) : purchaseError ? (
              <ErrorState refetchFn={refetchPurchase} />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fatura No</TableHead>
                      <TableHead>Tedarikçi</TableHead>
                      <TableHead>Fatura Tarihi</TableHead>
                      <TableHead>Vade</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseInvoices?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Gelen fatura bulunamadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchaseInvoices?.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.supplier_id}</TableCell>
                          <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                          <TableCell>{formatDate(invoice.due_date)}</TableCell>
                          <TableCell>{formatMoney(invoice.total_amount, invoice.currency)}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="outgoing">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Toplam Fatura</h3>
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{salesInvoices?.length || 0}</p>
            </Card>
            
            <Card className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Tahsil Edilmemiş</h3>
                <FileClock className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">
                {salesInvoices?.filter(invoice => invoice.odeme_durumu === 'odenmedi').length || 0}
              </p>
            </Card>
            
            <Card className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Tahsil Edilmiş</h3>
                <Wallet className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold">
                {salesInvoices?.filter(invoice => invoice.odeme_durumu === 'odendi').length || 0}
              </p>
            </Card>
            
            <Card className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Gecikmiş</h3>
                <FileX className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-2xl font-bold">
                {salesInvoices?.filter(invoice => invoice.odeme_durumu === 'gecikti').length || 0}
              </p>
            </Card>
          </div>

          <div className="flex justify-end mb-4">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yeni Fatura Oluştur
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Fatura ara..."
                  className="pl-9"
                  value={salesFilters.search}
                  onChange={handleSearchChange}
                />
              </div>
              
              <Select
                value={salesFilters.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tüm Durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm Durumlar</SelectItem>
                  <SelectItem value="odenmedi">Ödenmedi</SelectItem>
                  <SelectItem value="odendi">Ödendi</SelectItem>
                  <SelectItem value="kismi_odendi">Kısmi Ödendi</SelectItem>
                  <SelectItem value="gecikti">Gecikmiş</SelectItem>
                  <SelectItem value="iptal">İptal</SelectItem>
                </SelectContent>
              </Select>
              
              <DatePickerWithRange
                value={{
                  from: salesFilters.dateRange.from,
                  to: salesFilters.dateRange.to
                }}
                onChange={handleDateRangeChange}
                className="w-full md:w-auto"
              />
            </div>

            {isSalesLoading ? (
              <LoadingState />
            ) : salesError ? (
              <ErrorState refetchFn={refetchSales} />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fatura No</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Fatura Tarihi</TableHead>
                      <TableHead>Vade</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesInvoices?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Giden fatura bulunamadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesInvoices?.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.fatura_no}</TableCell>
                          <TableCell>{invoice.customer?.name || invoice.musteri_id}</TableCell>
                          <TableCell>{formatDate(invoice.fatura_tarihi)}</TableCell>
                          <TableCell>{formatDate(invoice.vade_tarihi)}</TableCell>
                          <TableCell>{formatMoney(invoice.toplam_tutar, invoice.para_birimi)}</TableCell>
                          <TableCell>{getStatusBadge(invoice.odeme_durumu)}</TableCell>
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
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceManagementTab;
