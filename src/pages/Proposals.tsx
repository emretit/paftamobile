import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useSalesPerformance } from "@/hooks/useSalesPerformance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
import { ProposalStatus } from "@/types/proposal";
import ProposalTable from "@/components/proposals/ProposalTable";
import ProposalKanban from "@/components/proposals/ProposalKanban";
import { ProposalFilters } from "@/components/proposals/ProposalFilters";
import type { ProposalFilters as ProposalFiltersType } from "@/components/proposals/ProposalFilters";

interface ProposalsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Proposals = ({ isCollapsed, setIsCollapsed }: ProposalsProps) => {
  const [filters, setFilters] = useState<ProposalFiltersType>({
    search: "",
    status: "",
    dateRange: {
      from: null,
      to: null,
    },
    amountRange: {
      min: null,
      max: null,
    },
    employeeId: null,
  });
  const [viewType, setViewType] = useState<"table" | "kanban">("table");
  const { data: salesPerformance, isLoading } = useSalesPerformance();

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teklifler</h1>
              <p className="text-gray-600 mt-1">Tüm teklifleri görüntüle ve yönet</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Yeni Teklif</span>
            </Button>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <Tabs value={viewType} onValueChange={(value) => setViewType(value as "table" | "kanban")}>
                <TabsList>
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    <span>Tablo Görünümü</span>
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    <span>Kanban Görünümü</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ProposalFilters onFilterChange={setFilters} />
          </div>

          {viewType === "table" ? (
            <ProposalTable filters={filters} />
          ) : (
            <ProposalKanban />
          )}

          {/* Analytics Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Teklif Performansı</h2>
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Toplam Teklif</TableHead>
                    <TableHead>Kabul Edilen</TableHead>
                    <TableHead>Toplam Değer</TableHead>
                    <TableHead>Çalışan</TableHead>
                    <TableHead>Başarı Oranı</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesPerformance?.map((performance) => (
                    <TableRow key={`${performance.employee_id}-${performance.month}`}>
                      <TableCell>
                        {new Date(performance.month).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                        })}
                      </TableCell>
                      <TableCell>{performance.total_proposals}</TableCell>
                      <TableCell>{performance.accepted_proposals}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        }).format(performance.total_value)}
                      </TableCell>
                      <TableCell>{performance.employee_name}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("tr-TR", {
                          style: "percent",
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        }).format(performance.success_rate / 100)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Proposals;
