
import { Check, Clock, X } from "lucide-react";
import { statusStyles, statusLabels, workflowSteps, finalStages } from "../constants";
import { ProposalStatus } from "@/types/crm";

interface ProposalWorkflowProgressProps {
  currentStatus: ProposalStatus;
}

const ProposalWorkflowProgress = ({ currentStatus }: ProposalWorkflowProgressProps) => {
  // Check if proposal is in a final stage
  const isFinalStage = finalStages.includes(currentStatus);
  
  // Get index of current step in workflow
  const currentStepIndex = workflowSteps.indexOf(currentStatus);
  
  // Generate step components based on workflow steps
  const getSteps = () => {
    return workflowSteps.map((step, index) => {
      // Determine if step is complete based on its position in workflow
      const isComplete = index < currentStepIndex;
      // Determine if step is current
      const isCurrent = step === currentStatus;
      // If in a final stage and not current step, get opacity based on completion
      const opacity = isFinalStage && !isCurrent ? (isComplete ? "opacity-100" : "opacity-30") : "";
      
      return (
        <div 
          key={step} 
          className={`flex-1 ${opacity}`}
        >
          <div className="relative flex items-center justify-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${statusStyles[step]}`}
            >
              {isComplete ? (
                <Check className="h-5 w-5" />
              ) : isCurrent ? (
                <Clock className="h-5 w-5" />
              ) : (
                <div className="w-3 h-3 bg-current rounded-full opacity-50" />
              )}
            </div>
            {index < workflowSteps.length - 1 && (
              <div 
                className={`h-[2px] absolute left-[50%] right-0 top-[50%] -translate-y-1/2 ${
                  index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
          <div className="text-xs text-center mt-2">
            {statusLabels[step]}
          </div>
        </div>
      );
    });
  };
  
  // Final stage logic (accepted, rejected, expired)
  const getFinalStage = () => {
    if (!isFinalStage) return null;
    
    return (
      <div className="mt-8 flex items-center justify-center">
        <div 
          className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyles[currentStatus]}`}
        >
          {currentStatus === "accepted" ? (
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4" />
              Teklif Kabul Edildi
            </div>
          ) : currentStatus === "rejected" ? (
            <div className="flex items-center">
              <X className="mr-2 h-4 w-4" />
              Teklif Reddedildi
            </div>
          ) : (
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Teklif Süresi Doldu
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center">
        {getSteps()}
      </div>
      {getFinalStage()}
    </div>
  );
};

export default ProposalWorkflowProgress;
