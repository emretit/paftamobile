
import { ProposalStatus } from "@/types/proposal";
import { workflowStages } from "../constants";

interface ProposalWorkflowProgressProps {
  currentStatus: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
}

export const ProposalWorkflowProgress = ({ 
  currentStatus, 
  onStatusChange 
}: ProposalWorkflowProgressProps) => {
  return (
    <div className="relative mb-6">
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
      <div className="flex justify-between relative">
        {workflowStages.map((stage, index) => {
          // Calculate active stage based on current status and position
          const isActive = workflowStages.findIndex(s => s.status === currentStatus) >= index;
          const isPastStage = workflowStages.findIndex(s => s.status === currentStatus) > index;
          
          return (
            <div key={stage.status} className="flex flex-col items-center z-10">
              <button 
                className={`w-4 h-4 rounded-full ${
                  isPastStage ? 'bg-blue-600' : isActive ? 'bg-blue-500' : 'bg-gray-300'
                } mb-2`}
                onClick={() => onStatusChange(stage.status)}
                title={stage.label}
              />
              <span className="text-xs text-gray-600 whitespace-nowrap px-1">
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
