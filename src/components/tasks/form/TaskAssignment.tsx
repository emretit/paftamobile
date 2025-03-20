
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormValues } from "./types";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";

interface TaskAssignmentProps {
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

const TaskAssignment = ({ watch, setValue }: TaskAssignmentProps) => {
  const [employees, setEmployees] = useState<{ id: string; first_name: string; last_name: string; }[]>([]);
  const assigneeId = watch("assignee_id");

  // Fetch employees
  const { isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees-for-assignment"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, first_name, last_name")
          .eq("status", "aktif");
        
        if (error) throw error;
        setEmployees(data || []);
        return data;
      } catch (error) {
        console.error("Error fetching employees:", error);
        return [];
      }
    },
  });

  return (
    <div className="grid gap-2">
      <Label>Atanan Çalışan <span className="text-red-500">*</span></Label>
      <Select 
        value={assigneeId || ""} 
        onValueChange={(value) => setValue("assignee_id", value || undefined)}
        disabled={isLoadingEmployees}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoadingEmployees ? "Yükleniyor..." : "Çalışan seçin"} />
        </SelectTrigger>
        <SelectContent>
          {employees && employees.length > 0 ? (
            <>
              <SelectItem value="">Atanmamış</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </SelectItem>
              ))}
            </>
          ) : (
            <SelectItem value="" disabled>
              {isLoadingEmployees ? "Yükleniyor..." : "Çalışan bulunamadı"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TaskAssignment;
