
import { Proposal, ProposalStatus } from "@/types/proposal";
import { ProposalWorkflowProgress } from "./ProposalWorkflowProgress";
import { ProposalStatusSelector } from "./ProposalStatusSelector";

interface ProposalDetailsTabProps {
  proposal: Proposal;
  onStatusChange: (status: ProposalStatus) => void;
  isUpdating?: boolean;
}

export const ProposalDetailsTab = ({ 
  proposal, 
  onStatusChange,
  isUpdating = false
}: ProposalDetailsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <h4 className="font-medium mb-3">Teklif Durumu</h4>
        
        <div className="space-y-4">
          {/* Workflow progress visualization */}
          <ProposalWorkflowProgress 
            currentStatus={proposal.status} 
            onStatusChange={onStatusChange} 
          />
          
          {/* Status selection buttons */}
          <ProposalStatusSelector 
            currentStatus={proposal.status} 
            onStatusChange={onStatusChange}
            isUpdating={isUpdating}
          />
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h4 className="font-medium mb-2">Ödeme Koşulları</h4>
        <p className="text-sm text-gray-600">
          {proposal.payment_term || 'Belirtilmemiş'}
        </p>
      </div>

      {proposal.employee && (
        <div className="rounded-md border p-4">
          <h4 className="font-medium mb-2">Satış Temsilcisi</h4>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
              {proposal.employee.first_name?.charAt(0)}{proposal.employee.last_name?.charAt(0)}
            </div>
            <span>{proposal.employee.first_name} {proposal.employee.last_name}</span>
          </div>
        </div>
      )}
    </div>
  );
};
