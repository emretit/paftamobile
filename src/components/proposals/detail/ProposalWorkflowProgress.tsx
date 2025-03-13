
import { ProposalStatus } from "@/types/proposal";
import { statusStyles, statusLabels } from "../constants";

const workflowSteps: ProposalStatus[] = [
  "draft",
  "new", 
  "sent", 
  "negotiation", 
  "accepted"
];

interface ProposalWorkflowProgressProps {
  currentStatus: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
}

export const ProposalWorkflowProgress = ({ 
  currentStatus, 
  onStatusChange 
}: ProposalWorkflowProgressProps) => {
  const currentStepIndex = workflowSteps.indexOf(currentStatus as ProposalStatus);
  
  return (
    <div className="relative">
      {/* Progress bar background */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
      
      {/* Progress bar filled */}
      {currentStepIndex > 0 && (
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary"
          style={{ width: `${(currentStepIndex / (workflowSteps.length - 1)) * 100}%` }}
        ></div>
      )}
      
      {/* Steps */}
      <div className="flex justify-between relative">
        {workflowSteps.map((step, index) => {
          const isActive = currentStepIndex >= index;
          const style = statusStyles[step] || {};
          
          return (
            <div 
              key={step} 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => onStatusChange(step)}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors
                  ${isActive ? (style.bg || 'bg-primary') : 'bg-gray-200'}`}
              >
                <span 
                  className={`text-xs font-bold 
                    ${isActive ? (style.text || 'text-white') : 'text-gray-500'}`}
                >
                  {index + 1}
                </span>
              </div>
              <span className={`text-xs mt-2 font-medium ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                {statusLabels[step] || step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
