
import { ArrowRight, Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusStyles, statusLabels, workflowSteps, finalStages } from "../constants";
import { ProposalStatus } from "@/types/crm";

interface ProposalWorkflowProgressProps {
  currentStatus: ProposalStatus;
  className?: string;
}

const ProposalWorkflowProgress = ({
  currentStatus,
  className,
}: ProposalWorkflowProgressProps) => {
  // Find the index of the current status in the workflow
  const currentStepIndex = workflowSteps.indexOf(currentStatus);
  
  // Check if the status is one of the final stages (accepted, rejected, expired)
  const isFinalStage = finalStages.includes(currentStatus);
  
  // Determine the variant (success, error, warning) for final stages
  const getFinalStageVariant = (status: ProposalStatus) => {
    switch (status) {
      case "accepted":
        return {
          icon: <Check className="h-5 w-5 text-green-600" />,
          label: "Teklif Kabul Edildi",
          message: "Teklif müşteri tarafından kabul edildi."
        };
      case "rejected":
        return {
          icon: <X className="h-5 w-5 text-red-600" />,
          label: "Teklif Reddedildi",
          message: "Teklif müşteri tarafından reddedildi."
        };
      case "expired":
        return {
          icon: <Clock className="h-5 w-5 text-amber-600" />,
          label: "Teklif Süresi Doldu",
          message: "Teklif geçerlilik süresi doldu."
        };
      default:
        return {
          icon: <Check className="h-5 w-5 text-green-600" />,
          label: statusLabels[currentStatus],
          message: ""
        };
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {isFinalStage ? (
        // Final stage view (Accepted, Rejected, Expired)
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center">
            {getFinalStageVariant(currentStatus).icon}
            <span className="ml-2 font-medium">{getFinalStageVariant(currentStatus).label}</span>
          </div>
          {getFinalStageVariant(currentStatus).message && (
            <p className="mt-2 text-sm text-gray-600">{getFinalStageVariant(currentStatus).message}</p>
          )}
        </div>
      ) : (
        // Workflow progress view
        <div className="flex items-center space-x-2">
          {workflowSteps.map((step, index) => {
            const isPast = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isFuture = index > currentStepIndex;
            
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      isPast && "bg-green-100 text-green-800",
                      isCurrent && statusStyles[currentStatus],
                      isFuture && "bg-gray-100 text-gray-500"
                    )}
                  >
                    {isPast ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <span 
                    className={cn(
                      "text-xs mt-1",
                      isPast && "text-green-800",
                      isCurrent && "font-medium",
                      isFuture && "text-gray-500"
                    )}
                  >
                    {statusLabels[step]}
                  </span>
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <ArrowRight 
                    className={cn(
                      "h-4 w-4",
                      index < currentStepIndex ? "text-green-500" : "text-gray-300"
                    )} 
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProposalWorkflowProgress;
