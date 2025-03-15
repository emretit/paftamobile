
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProposalStatus, Proposal } from "@/types/proposal";
import { ProposalWorkflowProgress } from "./ProposalWorkflowProgress";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  total_value: z.number().min(0, "Amount must be positive"),
  internal_notes: z.string().optional(),
  status: z.string()
});

type FormValues = z.infer<typeof formSchema>;

interface ProposalDetailsTabProps {
  proposal: Proposal;
  onStatusChange: (status: ProposalStatus) => void;
  isUpdating: boolean;
}

export const ProposalDetailsTab = ({ 
  proposal, 
  onStatusChange,
  isUpdating
}: ProposalDetailsTabProps) => {
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: proposal.title,
      total_value: proposal.total_value,
      internal_notes: proposal.internal_notes || "",
      status: proposal.status
    }
  });
  
  const updateNotesMutation = useMutation({
    mutationFn: async (data: { internal_notes: string }) => {
      const { error } = await supabase
        .from("proposals")
        .update({ internal_notes: data.internal_notes })
        .eq("id", proposal.id);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal", proposal.id] });
      toast.success("Notlar başarıyla kaydedildi");
    },
    onError: (error) => {
      console.error("Error updating notes:", error);
      toast.error("Notlar kaydedilirken bir hata oluştu");
    }
  });
  
  const handleSaveNotes = () => {
    const internal_notes = form.getValues("internal_notes");
    updateNotesMutation.mutate({ internal_notes });
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd.MM.yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Workflow progress section */}
      <Card className="p-4">
        <ProposalWorkflowProgress 
          currentStatus={proposal.status as ProposalStatus}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
        />
      </Card>
      
      <Separator className="my-6" />
      
      {/* Form fields section */}
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teklif Başlığı</FormLabel>
                <FormControl>
                  <Input placeholder="Teklif başlığı" {...field} readOnly className="bg-gray-50" />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="total_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Toplam Tutar</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      readOnly
                      className="bg-gray-50"
                      value={formatMoney(field.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Geçerlilik Tarihi</FormLabel>
              <Input 
                type="text" 
                readOnly
                className="bg-gray-50"
                value={formatDate(proposal.valid_until)}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="internal_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Açıklama / Notlar</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Teklif hakkında açıklama veya notlar..." 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <Button 
              type="button" 
              className="w-full"
              onClick={handleSaveNotes}
              disabled={updateNotesMutation.isPending}
            >
              {updateNotesMutation.isPending ? (
                "Kaydediliyor..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Notları Kaydet
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
