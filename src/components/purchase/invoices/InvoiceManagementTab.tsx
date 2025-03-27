
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter, Eye, Receipt, FileText, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InvoiceStatusBadge } from "../StatusBadge";
import { usePurchaseInvoices } from "@/hooks/usePurchaseInvoices";
import { formatMoney } from "../constants";
import { format } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const InvoiceManagementTab = () => {
  const { invoices, isLoading, filters, setFilters, recordPaymentMutation } = usePurchaseInvoices();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchValue });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFilterChange = (status: string) => {
    setFilters({ ...filters, status });
  };

  const handleCreateNew = () => {
    // Implement new invoice creation
    console.log("Create new invoice");
  };

  const handleViewInvoice = (invoice: any) => {
    // Implement invoice viewing
    console.log("View invoice", invoice);
  };

  const handleRecordPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentAmount((invoice.total_amount - invoice.paid_amount).toString());
    setPaymentDialogOpen(true);
  };

  const submitPayment = () => {
    if (selectedInvoice && paymentAmount) {
      recordPaymentMutation.mutate({
        id: selectedInvoice.id,
        amount: parseFloat(paymentAmount)
      });
      setPaymentDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Fatura Ara..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="pl-8"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Filter className="h-4 w-4 mr-2" />
            Filtrele
          </Button>
        </div>
        <Button onClick={handleCreateNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Yeni E-Fatura Ekle
        </Button>
      </div>

      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={filters.status === "" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("")}
        >
          Tümü
        </Button>
        <Button
          variant={filters.status === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("pending")}
        >
          Ödenmemiş
        </Button>
        <Button
          variant={filters.status === "partially_paid" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("partially_paid")}
        >
          Kısmen Ödenmiş
        </Button>
        <Button
          variant={filters.status === "paid" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("paid")}
        >
          Ödenmiş
        </Button>
        <Button
          variant={filters.status === "overdue" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("overdue")}
        >
          Gecikmiş
        </Button>
      </div>

      <div className="rounded-md border">
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center p-4">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : !invoices || invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center p-4">
                  Fatura bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow 
                  key={invoice.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewInvoice(invoice)}
                >
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.supplier_id}</TableCell>
                  <TableCell>{format(new Date(invoice.invoice_date), "dd.MM.yyyy")}</TableCell>
                  <TableCell>{format(new Date(invoice.due_date), "dd.MM.yyyy")}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">{formatMoney(invoice.total_amount, invoice.currency)}</TableCell>
                  <TableCell className="text-right">{formatMoney(invoice.paid_amount, invoice.currency)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleViewInvoice(invoice);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecordPayment(invoice);
                            }}
                            disabled={invoice.status === "paid"}
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            Ödeme Kaydet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Kaydet</DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <span>
                  Fatura: {selectedInvoice.invoice_number} - Kalan: {
                    formatMoney(
                      selectedInvoice.total_amount - selectedInvoice.paid_amount,
                      selectedInvoice.currency
                    )
                  }
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Ödeme Tutarı</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Ödeme Yöntemi</Label>
              <Select defaultValue="bank_transfer">
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Ödeme yöntemi seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="bank_transfer">Banka Transferi</SelectItem>
                    <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="check">Çek</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={submitPayment}>
              Ödemeyi Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceManagementTab;
