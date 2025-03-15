
import { ProposalStatus } from "@/types/proposal";
import { statusStyles, statusLabels, workflowSteps, finalStages } from "../constants";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProposalWorkflowProgressProps {
  currentStatus: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
  isUpdating?: boolean;
}

export const ProposalWorkflowProgress = ({ 
  currentStatus, 
  onStatusChange,
  isUpdating = false
}: ProposalWorkflowProgressProps) => {
  const currentStepIndex = workflowSteps.findIndex(step => step.status === currentStatus);
  
  // Calculate progress percentage
  const progressPercentage = currentStepIndex >= 0 
    ? ((currentStepIndex + 1) / workflowSteps.length) * 100 
    : 0;
  
  // Determine next step
  const nextStep = currentStepIndex >= 0 && currentStepIndex < workflowSteps.length - 1 
    ? workflowSteps[currentStepIndex + 1] 
    : null;
  
  // Check if current status is a final stage
  const isFinalStage = finalStages.some(stage => stage.status === currentStatus);
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Teklif Süreci</h3>
        
        {/* Progress bar */}
        <Progress 
          value={progressPercentage} 
          className="h-2 w-full bg-gray-100" 
          indicatorClassName="bg-blue-600"
        />
        
        {/* Steps */}
        <div className="flex justify-between relative mt-6">
          {/* Connect steps with line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
          
          {workflowSteps.map((step, index) => {
            const isActive = currentStepIndex >= index;
            const isCurrent = currentStepIndex === index;
            
            return (
              <div 
                key={step.status} 
                className="flex flex-col items-center cursor-pointer"
                onClick={() => !isUpdating && onStatusChange(step.status)}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${isCurrent 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-500'}`}
                >
                  {isActive && !isCurrent ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span 
                  className={`text-xs mt-2 font-medium text-center max-w-[70px]
                    ${isCurrent 
                      ? 'text-blue-600' 
                      : isActive 
                        ? 'text-gray-800' 
                        : 'text-gray-500'}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Next Action Section - only show if not in a final stage */}
      {nextStep && !isFinalStage && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Sonraki Adım</h3>
          <Button 
            variant="outline" 
            className="w-full flex justify-between items-center p-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            onClick={() => !isUpdating && onStatusChange(nextStep.status)}
            disabled={isUpdating}
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              <span>{nextStep.label}</span>
            </div>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {/* Final Status Section - only show if at negotiation stage */}
      {currentStatus === "negotiation" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sonuç Belirle</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="p-4 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 justify-start"
              onClick={() => !isUpdating && onStatusChange("approved")}
              disabled={isUpdating}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{statusLabels.approved}</p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="p-4 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 justify-start"
              onClick={() => !isUpdating && onStatusChange("rejected")}
              disabled={isUpdating}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{statusLabels.rejected}</p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="p-4 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 justify-start col-span-2"
              onClick={() => !isUpdating && onStatusChange("converted_to_order")}
              disabled={isUpdating}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{statusLabels.converted_to_order}</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      )}
      
      {/* Show status message if in final stage */}
      {isFinalStage && (
        <div className="rounded-lg border p-4 bg-gray-50">
          <p className="text-center text-gray-700">
            {finalStages.find(stage => stage.status === currentStatus)?.description || 
            "Teklif süreci tamamlandı"}
          </p>
        </div>
      )}
    </div>
  );
};
