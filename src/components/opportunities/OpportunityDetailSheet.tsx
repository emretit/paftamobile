
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Opportunity } from '@/types/crm';
import OpportunityDetailsTab from './tabs/OpportunityDetailsTab';
import OpportunityHistoryTab from './tabs/OpportunityHistoryTab';
import OpportunityTasksTab from './tabs/OpportunityTasksTab';

interface OpportunityDetailSheetProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Opportunity>) => Promise<Opportunity | null>;
}

const OpportunityDetailSheet = ({
  opportunity,
  isOpen,
  onClose,
  onUpdate
}: OpportunityDetailSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-xl font-semibold truncate">
            {opportunity.title}
          </SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start px-6 pt-2">
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="history">Görüşme Geçmişi</TabsTrigger>
            <TabsTrigger value="tasks">Görevler</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="p-0 m-0">
            <OpportunityDetailsTab 
              opportunity={opportunity}
              onUpdate={onUpdate}
            />
          </TabsContent>
          
          <TabsContent value="history" className="p-0 m-0">
            <OpportunityHistoryTab 
              opportunity={opportunity}
              onUpdate={onUpdate}
            />
          </TabsContent>
          
          <TabsContent value="tasks" className="p-0 m-0">
            <OpportunityTasksTab 
              opportunity={opportunity}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default OpportunityDetailSheet;
