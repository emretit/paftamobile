
import { Proposal } from "@/types/proposal";

interface ProposalNotesTabProps {
  proposal: Proposal;
}

export const ProposalNotesTab = ({ proposal }: ProposalNotesTabProps) => {
  return (
    <div className="space-y-4">
      {proposal.internal_notes ? (
        <div className="rounded-md border p-4">
          <h4 className="font-medium mb-2">İç Notlar</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {proposal.internal_notes}
          </p>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Bu teklife ait notlar bulunmuyor
        </div>
      )}
    </div>
  );
};
