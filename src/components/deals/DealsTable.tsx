
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Deal } from "@/types/deal";
import { Column, FilterState, DealsTableProps } from "./types";
import { formatDate, formatMoney, filterDeals } from "./utils";
import DealsTableFilters from "./DealsTableFilters";
import DealsTableColumns from "./DealsTableColumns";
import DealsTableActions from "./DealsTableActions";

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

  const filteredDeals = filterDeals(deals, searchTerm, filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <DealsTableFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
          />
          <DealsTableColumns
            columns={columns}
            onToggleColumn={toggleColumn}
          />
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
                      <DealsTableActions
                        deal={deal}
                        onViewDeal={onViewDeal}
                        onEditDeal={onEditDeal}
                        onDeleteDeal={onDeleteDeal}
                      />
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
