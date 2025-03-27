
import React, { useState } from "react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card } from "@/components/ui/card";
import { Search, FileDown, Filter, PackageCheck, PackageX, Loader, AlertCircle } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PurchaseOrderStatus } from "@/types/purchase";

const statusOptions = [
  { value: "draft", label: "Taslak", color: "bg-gray-200 text-gray-800" },
  { value: "sent", label: "Gönderildi", color: "bg-blue-100 text-blue-800" },
  { value: "confirmed", label: "Onaylandı", color: "bg-green-100 text-green-800" },
  { value: "received", label: "Teslim Alındı", color: "bg-purple-100 text-purple-800" },
  { value: "partially_received", label: "Kısmi Teslim", color: "bg-yellow-100 text-yellow-800" },
  { value: "cancelled", label: "İptal Edildi", color: "bg-red-100 text-red-800" }
];

const PurchaseOrdersTab = () => {
  const { 
    orders, 
    isLoading, 
    error, 
    filters, 
    setFilters,
    refetch 
  } = usePurchaseOrders();
  
  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, status });
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

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return (
      <Badge variant="outline" className={`${statusOption?.color}`}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Siparişler yükleniyor...</p>
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
            <h3 className="text-sm font-medium text-gray-500">Toplam Sipariş</h3>
            <PackageCheck className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{orders?.length || 0}</p>
        </Card>
        
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Onaylı Siparişler</h3>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Onaylı</Badge>
          </div>
          <p className="text-2xl font-bold">
            {orders?.filter(order => order.status === 'confirmed').length || 0}
          </p>
        </Card>
        
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Bekleyen Teslimatlar</h3>
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Beklemede</Badge>
          </div>
          <p className="text-2xl font-bold">
            {orders?.filter(order => 
              order.status === 'sent' || 
              order.status === 'confirmed' || 
              order.status === 'partially_received'
            ).length || 0}
          </p>
        </Card>
        
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">İptal Edilen</h3>
            <PackageX className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-2xl font-bold">
            {orders?.filter(order => order.status === 'cancelled').length || 0}
          </p>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Sipariş ara..."
              className="pl-9"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
          
          <Select
            value={filters.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tüm Durumlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tüm Durumlar</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DateRangePicker
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
                <TableHead>Sipariş No</TableHead>
                <TableHead>Tedarikçi</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Satın alma siparişi bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.po_number}</TableCell>
                    <TableCell>{order.supplier_id}</TableCell>
                    <TableCell>{order.total_amount} {order.currency}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
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

export default PurchaseOrdersTab;
