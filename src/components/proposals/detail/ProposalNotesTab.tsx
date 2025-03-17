
import { useState } from "react";
import { Proposal } from "@/types/proposal";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProposalNotesTabProps {
  proposal: Proposal;
  isReadOnly?: boolean;
}

export const ProposalNotesTab = ({ 
  proposal,
  isReadOnly = false
}: ProposalNotesTabProps) => {
  const [notes, setNotes] = useState(proposal.internal_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  const saveNotes = async () => {
    if (notes === proposal.internal_notes) return;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .update({ internal_notes: notes })
        .eq('id', proposal.id)
        .select()
        .single();
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success("Notlar başarıyla kaydedildi");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Notlar kaydedilirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isReadOnly) {
    return (
      <div className="space-y-4">
        {proposal.internal_notes ? (
          <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border">
            {proposal.internal_notes}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Bu teklif için not bulunmamaktadır.
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Teklif ile ilgili notlarınızı buraya yazabilirsiniz..."
        className="min-h-[200px] border-red-100 focus-visible:ring-red-200"
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={saveNotes} 
          disabled={isSaving || notes === proposal.internal_notes}
          className="bg-red-800 text-white hover:bg-red-900"
        >
          <Save className="mr-2 h-4 w-4" />
          Kaydet
        </Button>
      </div>
    </div>
  );
};
