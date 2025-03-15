
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerNames } from "@/hooks/useCustomerNames";
import { supabase } from "@/integrations/supabase/client";

interface ProposalFormData {
  title: string;
  customer_id: string;
  total_value: number;
  description: string;
  status: string;
}

export const ProposalForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { customers, isLoading: isLoadingCustomers } = useCustomerNames();
  
  const form = useForm<ProposalFormData>({
    defaultValues: {
      title: "",
      customer_id: "",
      total_value: 0,
      description: "",
      status: "discovery_scheduled" 
    }
  });

  const onSubmit = async (data: ProposalFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("proposals")
        .insert([
          {
            title: data.title,
            customer_id: data.customer_id,
            total_value: data.total_value,
            internal_notes: data.description,
            status: data.status
          }
        ]);
        
      if (error) throw error;
      
      toast.success("Proposal added successfully!");
      navigate("/proposals");
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("Failed to create proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Add New Proposal</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: "Proposal title is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proposal Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter proposal title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="customer_id"
            rules={{ required: "Client selection is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <Select
                  disabled={isLoadingCustomers}
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.company ? `(${customer.company})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="total_value"
            rules={{ 
              required: "Proposal amount is required",
              min: { value: 0, message: "Amount must be greater than zero" } 
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proposal Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proposal Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description (optional)"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="discovery_scheduled">🔎 Discovery Done</SelectItem>
                    <SelectItem value="approved">✅ Approved</SelectItem>
                    <SelectItem value="rejected">❌ Rejected</SelectItem>
                    <SelectItem value="converted_to_order">📦 Ordered</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => navigate("/proposals")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Proposal"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
