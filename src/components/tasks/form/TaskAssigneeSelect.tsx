
import { useQuery } from "@tanstack/react-query";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

interface TaskAssigneeSelectProps {
  form: UseFormReturn<any>;
  defaultValue?: string;
}

const TaskAssigneeSelect = ({ form, defaultValue }: TaskAssigneeSelectProps) => {
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, first_name, last_name")
          .eq("status", "aktif");
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching employees:", error);
        return [];
      }
    },
  });

  return (
    <FormField
      control={form.control}
      name="assignee_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Görevli</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Görevli seçin" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {employees.map((employee: any) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TaskAssigneeSelect;
