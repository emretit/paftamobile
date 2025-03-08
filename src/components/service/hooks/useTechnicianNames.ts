
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTechnicianNames = () => {
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name");
      
      if (error) throw error;
      return data;
    },
  });

  const getTechnicianName = (technicianId?: string) => {
    if (!technicianId || !employees) return "-";
    
    const employee = employees.find((e) => e.id === technicianId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "-";
  };

  return { employees, getTechnicianName };
};
