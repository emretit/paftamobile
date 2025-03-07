
import { Button } from "@/components/ui/button";
import { ProposalStatus } from "@/types/proposal";
import { workflowStages, finalStages } from "../constants";

interface ProposalStatusSelectorProps {
  currentStatus: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
}

export const ProposalStatusSelector = ({ 
  currentStatus, 
  onStatusChange 
}: ProposalStatusSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h5 className="text-sm font-medium">Süreç Aşamaları</h5>
        <div className="grid grid-cols-2 gap-2">
          {workflowStages.map(stage => (
            <Button 
              key={stage.status}
              size="sm" 
              variant={currentStatus === stage.status ? 'default' : 'outline'}
              onClick={() => onStatusChange(stage.status)}
              className="justify-start"
            >
              {stage.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h5 className="text-sm font-medium">Sonuç Aşamaları</h5>
        <div className="grid grid-cols-2 gap-2">
          {finalStages.map(stage => (
            <Button 
              key={stage.status}
              size="sm" 
              variant={currentStatus === stage.status ? 'default' : 'outline'}
              onClick={() => onStatusChange(stage.status)}
              className={`justify-start ${
                stage.status === 'approved' ? 'bg-green-600 hover:bg-green-700 text-white' : 
                stage.status === 'rejected' ? 'bg-red-600 hover:bg-red-700 text-white' : 
                stage.status === 'converted_to_order' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''
              } ${currentStatus !== stage.status ? 'bg-white text-gray-800' : ''}`}
            >
              {stage.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
