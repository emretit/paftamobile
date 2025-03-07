
import { ProposalStatus } from "@/types/proposal";
import { workflowStages } from "../constants";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProposalWorkflowProgressProps {
  currentStatus: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
}

export const ProposalWorkflowProgress = ({ 
  currentStatus, 
  onStatusChange 
}: ProposalWorkflowProgressProps) => {
  // Calculate current step index
  const currentIndex = workflowStages.findIndex(s => s.status === currentStatus);
  const progressPercentage = currentIndex >= 0 
    ? (currentIndex / (workflowStages.length - 1)) * 100 
    : 0;
  
  return (
    <div className="space-y-5">
      {/* Progress bar with animation */}
      <div className="relative">
        <Progress 
          value={progressPercentage} 
          className="h-2" 
          indicatorClassName="bg-blue-500 transition-all duration-500 ease-in-out"
        />
      </div>
      
      {/* Workflow stages */}
      <div className="flex justify-between relative">
        {workflowStages.map((stage, index) => {
          // Calculate stages status
          const isPastStage = currentIndex > index;
          const isCurrentStage = currentIndex === index;
          const isFutureStage = currentIndex < index;
          const isNextStep = index === currentIndex + 1;
          
          return (
            <div 
              key={stage.status} 
              className={cn(
                "flex flex-col items-center transition-all duration-300 z-10",
                isCurrentStage && "scale-105"
              )}
            >
              <button 
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm",
                  isPastStage && "bg-blue-500 border-blue-600 text-white",
                  isCurrentStage && "bg-blue-600 border-blue-700 text-white ring-4 ring-blue-100",
                  isFutureStage && "bg-white border-gray-200 text-gray-400",
                  isNextStep && "border-blue-300 cursor-pointer hover:border-blue-500",
                  (!isNextStep && isFutureStage) && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => isNextStep && onStatusChange(stage.status)}
                disabled={!isNextStep && !isCurrentStage}
                title={isNextStep ? `İlerle: ${stage.label}` : stage.label}
              >
                <span className="text-sm font-medium">{index + 1}</span>
              </button>
              <span className={cn(
                "text-xs mt-2 transition-all duration-200 text-center",
                isCurrentStage ? "font-semibold text-blue-700" : "text-gray-600",
                isPastStage && "text-gray-800",
                !isCurrentStage && !isNextStep && !isPastStage && "opacity-50"
              )}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
