
import { Proposal } from "@/types/proposal";

interface ProposalNotesTabProps {
  proposal: Proposal;
}

export const ProposalNotesTab = ({ proposal }: ProposalNotesTabProps) => {
  if (!proposal.internal_notes) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Bu teklif için henüz bir not bulunmamaktadır.
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-muted/30 rounded-lg whitespace-pre-wrap">
      {proposal.internal_notes}
    </div>
  );
};
