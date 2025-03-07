
import { Button } from "@/components/ui/button";
import { ProposalStatus } from "@/types/proposal";
import { workflowStages, finalStages } from "../constants";
import { Loader2, Check, X, Package, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  // Find current index in workflow
  const currentIndex = workflowStages.findIndex(s => s.status === currentStatus);
  
  // Determine next possible step
  const nextStep = currentIndex < workflowStages.length - 1 
    ? workflowStages[currentIndex + 1] 
    : null;
  
  // Helper function to get icon for final stages
  const getStatusIcon = (status: ProposalStatus) => {
    switch(status) {
      case 'approved':
        return <Check className="mr-2 h-5 w-5 text-green-500" />;
      case 'rejected':
        return <X className="mr-2 h-5 w-5 text-red-500" />;
      case 'converted_to_order':
        return <Package className="mr-2 h-5 w-5 text-indigo-500" />;
      default:
        return <Clock className="mr-2 h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Next step selector */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-700">Sonraki Adım</h5>
        
        {nextStep ? (
          <Button 
            className="w-full h-auto py-4 flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
            onClick={() => !isUpdating && onStatusChange(nextStep.status)}
            disabled={isUpdating}
          >
            <div className="flex items-center">
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-5 w-5" />
              )}
              <div className="text-left">
                <div className="font-medium">{nextStep.label}</div>
                <div className="text-xs text-blue-600">Süreci bir sonraki aşamaya taşı</div>
              </div>
            </div>
            <div className="text-2xl font-light opacity-70">→</div>
          </Button>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center text-sm text-blue-700">
            <p className="font-medium">Son işlem aşamasındasınız</p>
            <p className="text-xs mt-1">Aşağıdan sonuç seçeneği belirleyin</p>
          </div>
        )}

        {/* Workflow stage dropdown for mobile/alternative selection */}
        <div className="pt-2">
          <Select 
            value={currentStatus}
            onValueChange={(value) => onStatusChange(value as ProposalStatus)}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Durum Değiştir" />
            </SelectTrigger>
            <SelectContent>
              {workflowStages.map((stage) => (
                <SelectItem 
                  key={stage.status} 
                  value={stage.status}
                  disabled={isUpdating}
                >
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Final outcome selection */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-700">Sonuç Belirle</h5>
        <div className="grid grid-cols-1 gap-3">
          {finalStages.map((stage) => {
            const isSelected = currentStatus === stage.status;
            const isUpdatingThis = isUpdating && currentStatus !== stage.status;
            
            return (
              <Button 
                key={stage.status}
                onClick={() => !isUpdating && onStatusChange(stage.status)}
                className={cn(
                  "justify-start relative transition-all h-auto py-3 px-4",
                  stage.status === 'approved' && !isSelected && "bg-white hover:bg-green-50 text-gray-800 border-2 border-green-300",
                  stage.status === 'rejected' && !isSelected && "bg-white hover:bg-red-50 text-gray-800 border-2 border-red-300",
                  stage.status === 'converted_to_order' && !isSelected && "bg-white hover:bg-indigo-50 text-gray-800 border-2 border-indigo-300",
                  stage.status === 'approved' && isSelected && "bg-green-600 hover:bg-green-700 text-white",
                  stage.status === 'rejected' && isSelected && "bg-red-600 hover:bg-red-700 text-white",
                  stage.status === 'converted_to_order' && isSelected && "bg-indigo-600 hover:bg-indigo-700 text-white",
                )}
                disabled={isUpdating}
                size="lg"
              >
                <div className="flex flex-col items-start text-left">
                  <div className="flex items-center">
                    {isUpdatingThis ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      getStatusIcon(stage.status)
                    )}
                    <span className="font-medium">{stage.label}</span>
                  </div>
                  <span className={cn(
                    "text-xs mt-1",
                    isSelected 
                      ? "text-white opacity-90" 
                      : "text-gray-600"
                  )}>
                    {stage.description}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
