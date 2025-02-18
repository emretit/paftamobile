
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
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
    status: "all",
    dateRange: {
      from: null,
      to: null,
    },
    employeeId: null,
  });
  const [viewType, setViewType] = useState<"table" | "kanban">("table");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Teklifler
              </h1>
              <p className="text-gray-600">
                Tüm teklifleri görüntüle ve yönet
              </p>
            </div>
            <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90">
              <Plus className="h-4 w-4" />
              <span>Yeni Teklif</span>
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Tabs 
                value={viewType} 
                onValueChange={(value) => setViewType(value as "table" | "kanban")}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full sm:w-auto grid-cols-2">
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

            <div className="bg-gray-50/50 rounded-lg p-4">
              <ProposalFilters onFilterChange={setFilters} />
            </div>
          </div>

          <div className="animate-fade-in">
            {viewType === "table" ? (
              <ProposalTable filters={filters} />
            ) : (
              <ProposalKanban />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Proposals;
