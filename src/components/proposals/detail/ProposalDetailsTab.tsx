
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProposalStatus, Proposal } from "@/types/proposal";
import { ProposalStatusSelector } from "./ProposalStatusSelector";

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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: proposal.title,
      total_value: proposal.total_value,
      internal_notes: proposal.internal_notes || "",
      status: proposal.status
    }
  });

  const onSubmit = (data: FormValues) => {
    // This is handled at the parent component level
    console.log("Form submitted:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teklif Başlığı</FormLabel>
              <FormControl>
                <Input placeholder="Teklif başlığı" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Toplam Tutar (₺)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  {...field}
                  value={field.value}
                  onChange={e => field.onChange(Number(e.target.value))} 
                />
              </FormControl>
            </FormItem>
          )}
        />

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

        <ProposalStatusSelector 
          currentStatus={proposal.status as ProposalStatus} 
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
        />
      </form>
    </Form>
  );
};
