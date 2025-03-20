
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormValues } from "./types";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TaskAssignmentProps {
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

const TaskAssignment = ({ watch, setValue }: TaskAssignmentProps) => {
  const [employees, setEmployees] = useState<{ id: string; first_name: string; last_name: string; }[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
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
        
        if (error) {
          setFetchError(error.message);
          throw error;
        }
        
        setEmployees(data || []);
        return data;
      } catch (error) {
        console.error("Error fetching employees:", error);
        setFetchError("Çalışanlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
        return [];
      }
    },
  });

  return (
    <div className="grid gap-2">
      <Label>Atanan Çalışan <span className="text-red-500">*</span></Label>
      {fetchError && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}
      <Select 
        value={assigneeId || ""} 
        onValueChange={(value) => setValue("assignee_id", value || undefined)}
        disabled={isLoadingEmployees}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoadingEmployees ? "Yükleniyor..." : "Çalışan seçin"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Atanmamış</SelectItem>
          {employees && employees.length > 0 ? (
            employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </SelectItem>
            ))
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
