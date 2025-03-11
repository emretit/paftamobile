
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FormData } from "./types";

interface TaskAssignmentProps {
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
}

const TaskAssignment = ({ watch, setValue }: TaskAssignmentProps) => {
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-assignment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, avatar_url")
        .eq("status", "aktif");

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Atanan Kişi</Label>
        <Select
          value={watch("assignee_id") || ""}
          onValueChange={(value) => setValue("assignee_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kişi seçin" />
          </SelectTrigger>
          <SelectContent>
            {employees?.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Bitiş Tarihi</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !watch("due_date") && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watch("due_date") ? format(new Date(watch("due_date")), "PPP") : "Tarih seçin"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={watch("due_date") ? new Date(watch("due_date")) : undefined}
              onSelect={(date) => setValue("due_date", date?.toISOString())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TaskAssignment;
