
import React, { useState } from 'react';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { Opportunity } from '@/types/crm';
import { useToast } from '@/components/ui/use-toast';
import OpportunitiesKanban from '@/components/opportunities/OpportunitiesKanban';
import OpportunitiesTable from '@/components/opportunities/OpportunitiesTable';
import OpportunityDetailSheet from '@/components/opportunities/OpportunityDetailSheet';
import OpportunityForm from '@/components/opportunities/OpportunityForm';
import { useOpportunities } from '@/hooks/useOpportunities';
import { mockCrmService } from '@/services/mockCrm';

interface OpportunitiesProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Opportunities: React.FC<OpportunitiesProps> = ({ isCollapsed, setIsCollapsed }) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const { toast } = useToast();
  
  const { 
    opportunities,
    loading,
    error,
    addOpportunity,
    updateOpportunity,
    refreshOpportunities
  } = useOpportunities();

  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDetailSheet(true);
  };

  const handleUpdateOpportunity = async (opportunity: Opportunity) => {
    try {
      const { error } = await mockCrmService.updateOpportunity(
        opportunity.id, 
        opportunity
      );
      
      if (error) {
        throw error;
      }
      
      await refreshOpportunities();
      
      toast({
        title: "Fırsat güncellendi",
        description: "Fırsat başarıyla güncellendi.",
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Fırsat güncellenirken bir hata oluştu.",
      });
      return false;
    }
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === 'kanban' ? 'table' : 'kanban');
  };

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="Fırsatlar"
      subtitle="Potansiyel satış fırsatlarınızı yönetin"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            onClick={() => setViewMode('kanban')}
            size="sm"
          >
            Kanban
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
            size="sm"
          >
            Liste
          </Button>
        </div>
        <Button onClick={() => setShowCreateSheet(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Fırsat
        </Button>
      </div>

      {viewMode === 'kanban' ? (
        <OpportunitiesKanban 
          opportunities={opportunities || []} 
          onOpportunityClick={handleOpportunityClick}
          onOpportunityUpdate={handleUpdateOpportunity} 
          loading={loading}
          error={error}
        />
      ) : (
        <OpportunitiesTable 
          opportunities={opportunities || []} 
          onOpportunityClick={handleOpportunityClick}
          loading={loading}
          error={error}
        />
      )}

      {selectedOpportunity && (
        <OpportunityDetailSheet
          opportunity={selectedOpportunity}
          open={showDetailSheet}
          onOpenChange={setShowDetailSheet}
          onUpdateOpportunity={handleUpdateOpportunity}
        />
      )}

      <Sheet
        open={showCreateSheet}
        onOpenChange={setShowCreateSheet}
      >
        <OpportunityForm
          onSubmit={async (data) => {
            const success = await addOpportunity(data);
            if (success) {
              setShowCreateSheet(false);
            }
            return success;
          }}
          onCancel={() => setShowCreateSheet(false)}
        />
      </Sheet>
    </DefaultLayout>
  );
};

export default Opportunities;
