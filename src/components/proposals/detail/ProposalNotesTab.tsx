
import { useState } from "react";
import { Proposal } from "@/types/proposal";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ProposalNotesTabProps {
  proposal: Proposal;
  onNotesChange?: (notes: string) => void;
}

export const ProposalNotesTab = ({ proposal, onNotesChange }: ProposalNotesTabProps) => {
  const [notes, setNotes] = useState(proposal.internal_notes || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (onNotesChange) {
      onNotesChange(notes);
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        {notes ? (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg whitespace-pre-wrap">
            {notes}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Bu teklif için henüz bir not bulunmamaktadır.
          </div>
        )}
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Düzenle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Bu teklif hakkında notlarınızı buraya yazın..."
        className="min-h-[200px]"
      />
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          İptal
        </Button>
        <Button onClick={handleSave}>
          Kaydet
        </Button>
      </div>
    </div>
  );
};
