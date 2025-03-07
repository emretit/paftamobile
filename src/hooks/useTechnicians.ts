
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Technician {
  id: string;
  name: string;
  department: string;
  avatar_url?: string;
}

export const useTechnicians = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["technicians"],
    queryFn: async (): Promise<Technician[]> => {
      // Try to get employees from the technical service department
      const { data: technicians, error: techError } = await supabase
        .from("employees")
        .select("id, first_name, last_name, department, avatar_url")
        .eq("department", "Teknik Servis");
      
      if (techError) {
        console.error("Error fetching technicians:", techError);
        // Fallback to all employees if there's an error
        const { data: allEmployees, error: allError } = await supabase
          .from("employees")
          .select("id, first_name, last_name, department, avatar_url");
        
        if (allError) throw allError;
        
        return (allEmployees || []).map(emp => ({
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
          department: emp.department,
          avatar_url: emp.avatar_url
        }));
      }
      
      // If no technicians found, get all employees as a fallback
      if (!technicians || technicians.length === 0) {
        const { data: allEmployees, error: allError } = await supabase
          .from("employees")
          .select("id, first_name, last_name, department, avatar_url");
        
        if (allError) throw allError;
        
        return (allEmployees || []).map(emp => ({
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
          department: emp.department,
          avatar_url: emp.avatar_url
        }));
      }
      
      // Return technicians
      return technicians.map(tech => ({
        id: tech.id,
        name: `${tech.first_name} ${tech.last_name}`,
        department: tech.department,
        avatar_url: tech.avatar_url
      }));
    }
  });

  return {
    technicians: data || [],
    isLoading,
    error
  };
};
