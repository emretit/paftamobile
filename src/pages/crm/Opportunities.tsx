
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Search, Filter } from "lucide-react";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { OpportunitiesState } from "@/types/crm";
import OpportunitiesKanban from "@/components/crm/OpportunitiesKanban";
import OpportunityDetailSheet from "@/components/crm/OpportunityDetailSheet";
import { crmService } from "@/services/crmService";
import DefaultLayout from "@/components/layouts/DefaultLayout";

interface OpportunitiesPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Opportunities = ({ isCollapsed, setIsCollapsed }: OpportunitiesPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch opportunities
  const { data: opportunities, isLoading, error } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await crmService.getOpportunities();
      if (error) throw error;
      return data || [];
    }
  });

  // Update opportunity mutation
  const updateOpportunityMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: OpportunityStatus }) => {
      const { data, error } = await crmService.updateOpportunity(id, { status });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });

  // Create new opportunity
  const createOpportunityMutation = useMutation({
    mutationFn: async (opportunityData: Partial<Opportunity>) => {
      const { data, error } = await crmService.createOpportunity(opportunityData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });

  // Filter opportunities based on search term
  const filteredOpportunities = opportunities?.filter(opportunity => 
    opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opportunity.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Organize opportunities by status for Kanban
  const organizedOpportunities: OpportunitiesState = {
    new: filteredOpportunities.filter(o => o.status === 'new'),
    first_contact: filteredOpportunities.filter(o => o.status === 'first_contact'),
    site_visit: filteredOpportunities.filter(o => o.status === 'site_visit'),
    preparing_proposal: filteredOpportunities.filter(o => o.status === 'preparing_proposal'),
    proposal_sent: filteredOpportunities.filter(o => o.status === 'proposal_sent'),
    accepted: filteredOpportunities.filter(o => o.status === 'accepted'),
    lost: filteredOpportunities.filter(o => o.status === 'lost')
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // No movement
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Get the opportunity that was moved
    const opportunity = filteredOpportunities.find(o => o.id === draggableId);
    if (!opportunity) return;

    // Update opportunity status
    await updateOpportunityMutation.mutateAsync({
      id: draggableId,
      status: destination.droppableId as OpportunityStatus
    });
  };

  // Handle clicking on an opportunity
  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailOpen(true);
  };

  // Create a new opportunity
  const handleCreateNewOpportunity = async () => {
    await createOpportunityMutation.mutateAsync({
      title: "Yeni Fırsat",
      status: "new",
      priority: "medium",
      value: 0
    });
  };

  // Close the detail sheet
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOpportunity(null);
  };

  return (
    <DefaultLayout isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fırsatlar</h1>
            <p className="text-gray-600">Tüm satış fırsatlarını yönetin ve takip edin</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="default"
              className="bg-red-800 hover:bg-red-900 text-white"
              onClick={handleCreateNewOpportunity}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Yeni Fırsat
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Fırsat ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              Filtrele
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {isLoading ? (
          <div className="text-center py-10">Fırsatlar yükleniyor...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">Bir hata oluştu.</div>
        ) : (
          <div className="pb-10">
            <OpportunitiesKanban
              opportunities={organizedOpportunities}
              onDragEnd={handleDragEnd}
              onOpportunityClick={handleOpportunityClick}
            />
          </div>
        )}
      </div>
      
      <OpportunityDetailSheet
        opportunity={selectedOpportunity}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </DefaultLayout>
  );
};

export default Opportunities;
