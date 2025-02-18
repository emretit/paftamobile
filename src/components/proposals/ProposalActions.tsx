
import { toast } from "sonner";
import { 
  Copy, 
  Mail, 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  XSquare,
  Edit,
  MoreHorizontal 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Proposal } from "@/types/proposal";

interface ProposalActionsProps {
  proposal: Proposal;
  onEdit?: (proposal: Proposal) => void;
  onComment?: (proposal: Proposal) => void;
}

export const ProposalActions = ({ proposal, onEdit, onComment }: ProposalActionsProps) => {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("proposals")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ id: proposal.id, status });
      toast.success(`Teklif durumu güncellendi: ${status}`);
    } catch (error) {
      toast.error("Durum güncellenirken bir hata oluştu");
    }
  };

  const handleDuplicate = async () => {
    try {
      const { data: newProposal, error } = await supabase
        .from("proposals")
        .insert({
          ...proposal,
          id: undefined,
          status: "new",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sent_date: null,
          title: `${proposal.title} (Kopya)`,
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Teklif başarıyla kopyalandı");
    } catch (error) {
      toast.error("Teklif kopyalanırken bir hata oluştu");
    }
  };

  const handleEmailProposal = async () => {
    // This will be implemented with email service integration
    toast.info("Email gönderme özelliği yakında eklenecek");
  };

  const handleGeneratePDF = async () => {
    // This will be implemented with PDF generation service
    toast.info("PDF oluşturma özelliği yakında eklenecek");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit?.(proposal)} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          <span>Düzenle</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          <span>Kopyala</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEmailProposal} className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          <span>E-posta Gönder</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleGeneratePDF} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <span>PDF Oluştur</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleStatusUpdate("accepted")} 
          className="cursor-pointer text-green-600"
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          <span>Kabul Edildi</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusUpdate("rejected")} 
          className="cursor-pointer text-red-600"
        >
          <XSquare className="mr-2 h-4 w-4" />
          <span>Reddedildi</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onComment?.(proposal)} className="cursor-pointer">
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Yorum Ekle</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
