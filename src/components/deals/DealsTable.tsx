
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Deal } from "@/types/deal";
import { Eye, Pencil, Trash2, SlidersHorizontal } from "lucide-react";

interface Column {
  id: keyof Deal | 'actions';
  label: string;
  visible: boolean;
}

interface DealsTableProps {
  deals: Deal[];
  onViewDeal: (deal: Deal) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (deal: Deal) => void;
  onUpdateDealStatus: (deal: Deal, newStatus: Deal['status']) => void;
}

const DealsTable = ({
  deals,
  onViewDeal,
  onEditDeal,
  onDeleteDeal,
  onUpdateDealStatus,
}: DealsTableProps) => {
  const [columns, setColumns] = useState<Column[]>([
    { id: "title", label: "Fırsat Adı", visible: true },
    { id: "customerName", label: "Müşteri", visible: true },
    { id: "status", label: "Durum", visible: true },
    { id: "employeeName", label: "Satış Temsilcisi", visible: true },
    { id: "value", label: "Tahmini Tutar", visible: true },
    { id: "proposalDate", label: "Teklif Tarihi", visible: true },
    { id: "expectedCloseDate", label: "Tahmini Kapanış", visible: true },
    { id: "actions", label: "İşlemler", visible: true },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleColumn = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const filteredDeals = deals.filter(deal =>
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.visible}
                  onCheckedChange={() => toggleColumn(column.id)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.filter(col => col.visible).map((column) => (
                <TableHead key={column.id}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeals.map((deal) => (
              <TableRow key={deal.id}>
                {columns.filter(col => col.visible).map((column) => (
                  <TableCell key={column.id}>
                    {column.id === "title" && deal.title}
                    {column.id === "customerName" && deal.customerName}
                    {column.id === "status" && (
                      <Select
                        value={deal.status}
                        onValueChange={(value: Deal['status']) => 
                          onUpdateDealStatus(deal, value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Yeni Teklif</SelectItem>
                          <SelectItem value="negotiation">Görüşmede</SelectItem>
                          <SelectItem value="follow_up">Takipte</SelectItem>
                          <SelectItem value="won">Kazanıldı</SelectItem>
                          <SelectItem value="lost">Kaybedildi</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {column.id === "employeeName" && deal.employeeName}
                    {column.id === "value" && formatMoney(deal.value)}
                    {column.id === "proposalDate" && formatDate(deal.proposalDate)}
                    {column.id === "expectedCloseDate" && formatDate(deal.expectedCloseDate)}
                    {column.id === "actions" && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDeal(deal)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditDeal(deal)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteDeal(deal)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DealsTable;
