
import { Proposal } from "@/types/proposal";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { FileText, Calendar, DollarSign, Users, Building2, User, Package } from "lucide-react";
import { statusLabels, statusStyles } from "./constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProposalDetailSheetProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProposalDetailSheet({ proposal, isOpen, onClose }: ProposalDetailSheetProps) {
  if (!proposal) return null;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const calculateSubTotal = (items: Proposal['items']) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTotalTax = (items: Proposal['items']) => {
    if (!items) return 0;
    return items.reduce((sum, item) => {
      const subtotal = item.quantity * item.unit_price;
      return sum + (subtotal * (item.tax_rate / 100));
    }, 0);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[800px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle>Teklif #{proposal.proposal_number}</SheetTitle>
            <Badge 
              className={`${statusStyles[proposal.status].bg} ${
                statusStyles[proposal.status].text
              }`}
            >
              {statusLabels[proposal.status]}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Oluşturulma Tarihi: {format(new Date(proposal.created_at), 'dd MMMM yyyy', { locale: tr })}</span>
            </div>
            {proposal.valid_until && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Geçerlilik Tarihi: {format(new Date(proposal.valid_until), 'dd MMMM yyyy', { locale: tr })}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Müşteri Bilgileri</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{proposal.customer?.name || 'Belirtilmemiş'}</span>
              </div>
              {proposal.employee && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Satış Temsilcisi: {proposal.employee.first_name} {proposal.employee.last_name}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Teklif Kalemleri
            </h3>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün/Hizmet</TableHead>
                    <TableHead className="text-right">Miktar</TableHead>
                    <TableHead className="text-right">Birim Fiyat</TableHead>
                    <TableHead className="text-right">KDV %</TableHead>
                    <TableHead className="text-right">Toplam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposal.items && proposal.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatMoney(item.unit_price)}</TableCell>
                      <TableCell className="text-right">%{item.tax_rate}</TableCell>
                      <TableCell className="text-right">{formatMoney(item.total_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Finansal Özet</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span>{formatMoney(calculateSubTotal(proposal.items))}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Toplam KDV</span>
                <span>{formatMoney(calculateTotalTax(proposal.items))}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium">Genel Toplam</span>
                </div>
                <span className="font-semibold">{formatMoney(proposal.total_value)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
            <Button>
              Düzenle
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
