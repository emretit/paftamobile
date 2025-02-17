
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
import { Eye, Pencil, Trash2, SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Column {
  id: keyof Deal | 'actions';
  label: string;
  visible: boolean;
}

interface FilterState {
  status: Deal['status'] | 'all';
  customer: string;
  employee: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  valueRange: {
    min: string;
    max: string;
  };
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
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    customer: '',
    employee: '',
    dateRange: {
      from: undefined,
      to: undefined,
    },
    valueRange: {
      min: '',
      max: '',
    },
  });

  const toggleColumn = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "-";
    return format(new Date(date), 'dd.MM.yyyy', { locale: tr });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      customer: '',
      employee: '',
      dateRange: {
        from: undefined,
        to: undefined,
      },
      valueRange: {
        min: '',
        max: '',
      },
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.customer) count++;
    if (filters.employee) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.valueRange.min || filters.valueRange.max) count++;
    return count;
  };

  const filteredDeals = deals.filter(deal => {
    // Arama terimi kontrolü
    const searchMatch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.employeeName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Durum filtresi
    if (filters.status !== 'all' && deal.status !== filters.status) return false;

    // Müşteri filtresi
    if (filters.customer && !deal.customerName.toLowerCase().includes(filters.customer.toLowerCase())) return false;

    // Satış temsilcisi filtresi
    if (filters.employee && !deal.employeeName.toLowerCase().includes(filters.employee.toLowerCase())) return false;

    // Tarih aralığı kontrolü
    if (filters.dateRange.from && new Date(deal.proposalDate) < filters.dateRange.from) return false;
    if (filters.dateRange.to && new Date(deal.proposalDate) > filters.dateRange.to) return false;

    // Tutar aralığı kontrolü
    const minValue = filters.valueRange.min ? parseFloat(filters.valueRange.min) : 0;
    const maxValue = filters.valueRange.max ? parseFloat(filters.valueRange.max) : Infinity;
    if (deal.value < minValue || deal.value > maxValue) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <Input
            placeholder="Fırsat adı, müşteri veya temsilci ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtreler
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Durum</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value: Deal['status'] | 'all') => 
                      setFilters(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm durumlar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="new">Yeni Teklif</SelectItem>
                      <SelectItem value="negotiation">Görüşmede</SelectItem>
                      <SelectItem value="follow_up">Takipte</SelectItem>
                      <SelectItem value="won">Kazanıldı</SelectItem>
                      <SelectItem value="lost">Kaybedildi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Müşteri</Label>
                  <Input
                    placeholder="Müşteri adı"
                    value={filters.customer}
                    onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Satış Temsilcisi</Label>
                  <Input
                    placeholder="Temsilci adı"
                    value={filters.employee}
                    onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Teklif Tarihi Aralığı</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          {filters.dateRange.from ? (
                            format(filters.dateRange.from, 'dd.MM.yyyy')
                          ) : (
                            "Başlangıç"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) => 
                            setFilters(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, from: date }
                            }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          {filters.dateRange.to ? (
                            format(filters.dateRange.to, 'dd.MM.yyyy')
                          ) : (
                            "Bitiş"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) => 
                            setFilters(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, to: date }
                            }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tahmini Tutar Aralığı</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.valueRange.min}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        valueRange: { ...prev.valueRange, min: e.target.value }
                      }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.valueRange.max}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        valueRange: { ...prev.valueRange, max: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <Separator />

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Filtreleri Temizle
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Sütunlar
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
