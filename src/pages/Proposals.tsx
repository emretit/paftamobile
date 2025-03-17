
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProposalFilters } from "@/components/proposals/types";
import { ProposalDetailSheet } from "@/components/proposals/ProposalDetailSheet";
import { Proposal } from "@/types/proposal";
import { Plus, Filter, Table as TableIcon, LayoutGrid, Search, FileText } from "lucide-react";
import { Table, TableBody } from "@/components/ui/table";
import { ProposalTableHeader } from "@/components/proposals/table/ProposalTableHeader";
import { ProposalTableRow } from "@/components/proposals/table/ProposalTableRow";
import { ProposalTableSkeleton } from "@/components/proposals/table/ProposalTableSkeleton";
import { Column } from "@/components/proposals/types";
import ProposalTable from "@/components/proposals/ProposalTable";

interface ProposalsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Proposals = ({ isCollapsed, setIsCollapsed }: ProposalsProps) => {
  const [filters, setFilters] = useState<ProposalFilters>({
    search: "",
    status: "all",
    dateRange: {
      from: null,
      to: null,
    },
  });
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const queryClient = useQueryClient();
  
  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('proposals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposals'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['proposals'] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // State for the detail sheet
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const handleProposalClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDetailSheetOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchText });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <TopBar />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-red-900">Teklifler</h1>
            <p className="text-gray-600 mt-1">
              Tüm teklifleri görüntüleyin ve yönetin
            </p>
          </div>

          {/* Search and actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <form onSubmit={handleSearchSubmit} className="flex w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Teklif ara..."
                  className="pl-9 pr-4 border-red-100 focus-visible:ring-red-200 w-full"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                variant="default" 
                className="ml-2 bg-red-800 hover:bg-red-900"
              >
                Ara
              </Button>
            </form>
            
            <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end">
              <div className="flex space-x-2">
                <Button 
                  variant={viewMode === "kanban" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className={viewMode === "kanban" ? "bg-red-800 hover:bg-red-900" : "border-red-200 text-red-700 hover:bg-red-50"}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </Button>
                <Button 
                  variant={viewMode === "table" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className={viewMode === "table" ? "bg-red-800 hover:bg-red-900" : "border-red-200 text-red-700 hover:bg-red-50"}
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Tablo
                </Button>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate("/proposals/new")}
                className="bg-red-800 hover:bg-red-900"
              >
                <Plus className="h-4 w-4 mr-2" />
                Teklif Ekle
              </Button>
            </div>
          </div>

          {/* Status filters */}
          <Card className="mb-6 border-red-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filters.status === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({...filters, status: "all"})}
                  className={filters.status === "all" ? "bg-red-800 hover:bg-red-900" : "border-red-200 text-red-700 hover:bg-red-50"}
                >
                  Tümü
                </Button>
                <Button 
                  variant={filters.status === "draft" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({...filters, status: "draft"})}
                  className={filters.status === "draft" ? "bg-red-800 hover:bg-red-900" : "border-red-200 text-red-700 hover:bg-red-50"}
                >
                  Hazırlanıyor
                </Button>
                <Button 
                  variant={filters.status === "pending_approval" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({...filters, status: "pending_approval"})}
                  className={filters.status === "pending_approval" ? "bg-red-800 hover:bg-red-900" : "border-red-200 text-red-700 hover:bg-red-50"}
                >
                  Onay Bekliyor
                </Button>
                <Button 
                  variant={filters.status === "sent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({...filters, status: "sent"})}
                  className={filters.status === "sent" ? "bg-red-800 hover:bg-red-900" : "border-red-200 text-red-700 hover:bg-red-50"}
                >
                  Gönderildi
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="ml-auto border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Gelişmiş Filtre
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table View */}
          <Card className="border-red-100 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <ProposalTable 
                filters={filters}
                onProposalSelect={handleProposalClick}
              />
            </CardContent>
          </Card>
          
          {/* Proposal Detail Sheet */}
          {selectedProposal && (
            <ProposalDetailSheet
              proposal={selectedProposal}
              isOpen={isDetailSheetOpen}
              onClose={() => {
                setIsDetailSheetOpen(false);
                setSelectedProposal(null);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Proposals;
