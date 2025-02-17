
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Search, LayoutGrid, Table as TableIcon } from "lucide-react";
import { ProposalStatus } from "@/types/proposal";
import ProposalTable from "@/components/proposals/ProposalTable";
import ProposalKanban from "@/components/proposals/ProposalKanban";

interface ProposalsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const statusOptions: { value: ProposalStatus; label: string }[] = [
  { value: "new", label: "Yeni" },
  { value: "review", label: "İncelemede" },
  { value: "negotiation", label: "Görüşmede" },
  { value: "accepted", label: "Kabul Edildi" },
  { value: "rejected", label: "Reddedildi" },
];

const Proposals = ({ isCollapsed, setIsCollapsed }: ProposalsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "">("");
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

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Teklif ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProposalStatus)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Durum Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tümü</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {viewType === "table" ? (
            <ProposalTable />
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
