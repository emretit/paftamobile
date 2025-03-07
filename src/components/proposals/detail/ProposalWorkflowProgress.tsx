
import { ProposalStatus } from "@/types/proposal";
import { workflowStages } from "../constants";
import { cn } from "@/lib/utils";

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
  
  return (
    <div className="relative pt-2">
      {/* Progress bar background */}
      <div className="absolute top-5 left-0 right-0 h-1.5 bg-gray-100 rounded-full"></div>
      
      {/* Active progress bar */}
      <div 
        className="absolute top-5 left-0 h-1.5 bg-blue-500 rounded-full transition-all duration-300"
        style={{ 
          width: `${currentIndex >= 0 
            ? (currentIndex / (workflowStages.length - 1)) * 100 
            : 0}%` 
        }}
      ></div>
      
      {/* Workflow stages */}
      <div className="flex justify-between relative">
        {workflowStages.map((stage, index) => {
          // Calculate stages status
          const isPastStage = currentIndex > index;
          const isCurrentStage = currentIndex === index;
          const isFutureStage = currentIndex < index;
          
          return (
            <div key={stage.status} className="flex flex-col items-center z-10">
              <button 
                className={cn(
                  "w-5 h-5 rounded-full transition-all duration-200",
                  isPastStage && "bg-blue-500 ring-2 ring-blue-100",
                  isCurrentStage && "bg-blue-500 ring-4 ring-blue-100 scale-110",
                  isFutureStage && "bg-gray-200",
                )}
                onClick={() => onStatusChange(stage.status)}
                title={stage.label}
              />
              <span className={cn(
                "text-xs mt-2 transition-colors duration-200",
                isCurrentStage ? "font-medium text-blue-700" : "text-gray-600"
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
