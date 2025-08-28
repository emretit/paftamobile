
import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { Opportunity } from "@/types/crm";
import OpportunitiesTable from "./OpportunitiesTable";

interface OpportunitiesContentProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  error: any;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  searchQuery?: string;
  statusFilter?: string;
  priorityFilter?: string;
}

const OpportunitiesContent = ({
  opportunities,
  isLoading,
  error,
  onSelectOpportunity,
  searchQuery,
  statusFilter,
  priorityFilter
}: OpportunitiesContentProps) => {
  const { toast } = useToast();

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Fırsatlar yüklenirken bir hata oluştu.</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-xl border border-gray-200/60 shadow-lg shadow-gray-100/50 backdrop-blur-sm">
      <div className="p-8">
        <OpportunitiesTable
          opportunities={opportunities}
          isLoading={isLoading}
          onSelectOpportunity={onSelectOpportunity}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
        />
      </div>
    </div>
  );
};

export default OpportunitiesContent;
