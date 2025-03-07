
import { Proposal, ProposalStatus } from "@/types/proposal";
import { ProposalWorkflowProgress } from "./ProposalWorkflowProgress";
import { ProposalStatusSelector } from "./ProposalStatusSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Teklif Durumu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Workflow progress visualization */}
          <div className="mb-6">
            <ProposalWorkflowProgress 
              currentStatus={proposal.status} 
              onStatusChange={onStatusChange} 
            />
          </div>
          
          <div className="border-t pt-6">
            <ProposalStatusSelector 
              currentStatus={proposal.status} 
              onStatusChange={onStatusChange}
              isUpdating={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Ödeme Koşulları</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {proposal.payment_term || 'Belirtilmemiş'}
            </p>
          </CardContent>
        </Card>

        {proposal.employee && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Satış Temsilcisi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                  {proposal.employee.first_name?.charAt(0)}{proposal.employee.last_name?.charAt(0)}
                </div>
                <span className="text-sm">{proposal.employee.first_name} {proposal.employee.last_name}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
