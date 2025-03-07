
import { Button } from "@/components/ui/button";
import { ProposalStatus } from "@/types/proposal";
import { workflowStages, finalStages } from "../constants";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProposalStatusSelectorProps {
  currentStatus: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
  isUpdating?: boolean;
}

export const ProposalStatusSelector = ({ 
  currentStatus, 
  onStatusChange,
  isUpdating = false
}: ProposalStatusSelectorProps) => {
  // Helper function to render status buttons
  const renderStatusButton = (stage: { status: ProposalStatus; label: string }, variant?: string) => {
    const isSelected = currentStatus === stage.status;
    const isUpdatingThis = isUpdating && currentStatus !== stage.status;
    
    return (
      <Button 
        key={stage.status}
        size="sm" 
        variant={isSelected ? 'default' : 'outline'}
        onClick={() => !isUpdating && onStatusChange(stage.status)}
        className={cn(
          "justify-start relative transition-all h-10",
          variant === 'approved' && 'bg-green-600 hover:bg-green-700 text-white',
          variant === 'rejected' && 'bg-red-600 hover:bg-red-700 text-white',
          variant === 'converted' && 'bg-indigo-600 hover:bg-indigo-700 text-white',
          isSelected && !variant && 'bg-blue-600 hover:bg-blue-700',
          isSelected && 'font-medium',
          !isSelected && variant && 'bg-white text-gray-800'
        )}
        disabled={isUpdating}
      >
        {isUpdatingThis ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isSelected ? (
          <Check className="mr-2 h-4 w-4" />
        ) : null}
        {stage.label}
      </Button>
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700">Süreç Aşamaları</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {workflowStages.map(stage => renderStatusButton(stage))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700">Sonuç Aşamaları</h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {finalStages.map(stage => renderStatusButton(
            stage, 
            stage.status === 'approved' ? 'approved' : 
            stage.status === 'rejected' ? 'rejected' : 
            stage.status === 'converted_to_order' ? 'converted' : undefined
          ))}
        </div>
      </div>
    </div>
  );
};
