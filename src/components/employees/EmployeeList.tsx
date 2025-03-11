
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List, RefreshCw } from "lucide-react";
import type { Employee, ViewMode } from "./types";
import EmployeeTable from "./EmployeeTable";
import { EmployeeGrid } from "./EmployeeGrid";
import { FilterBar } from "./FilterBar";
import { useToast } from "@/components/ui/use-toast";

export const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  const transformToEmployee = (item: any): Employee => {
    let status: 'active' | 'inactive';
    
    if (item.status === 'active') {
      status = 'active';
    } else {
      status = 'inactive';
    }

    return {
      id: item.id,
      first_name: item.first_name,
      last_name: item.last_name,
      email: item.email,
      phone: item.phone || "",
      position: item.position,
      department: item.department,
      hire_date: item.hire_date,
      status: status,
      avatar_url: item.avatar_url
    };
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      const transformedEmployees = data ? data.map(transformToEmployee) : [];
      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çalışan bilgileri yüklenirken bir hata oluştu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();

    const channel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEmployee = transformToEmployee(payload.new);
            setEmployees(prev => [newEmployee, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedEmployee = transformToEmployee(payload.new);
            setEmployees(prev => 
              prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
            );
          } else if (payload.eventType === 'DELETE') {
            setEmployees(prev => 
              prev.filter(emp => emp.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleClearEmployees = async () => {
    try {
      setIsLoading(true);
      
      // Delete all employees from the database
      const { error } = await supabase
        .from('employees')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Safety check to avoid deleting with an empty condition
        
      if (error) throw error;

      setEmployees([]);
      
      toast({
        title: "Başarılı",
        description: "Tüm çalışan bilgileri silindi.",
      });
    } catch (error) {
      console.error('Error clearing employees:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çalışan bilgileri silinirken bir hata oluştu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      searchQuery === '' || 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      employee.status === statusFilter;
    
    const matchesDepartment = 
      departmentFilter === 'all' || 
      employee.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleAddEmployee = () => {
    navigate('/employees/new');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Çalışan Listesi</h2>
        <div className="flex space-x-2">
          <Button
            size="icon"
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={fetchEmployees} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
          {employees.length > 0 && (
            <Button variant="destructive" onClick={handleClearEmployees} disabled={isLoading}>
              Tümünü Sil
            </Button>
          )}
          <Button onClick={handleAddEmployee} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Çalışan
          </Button>
        </div>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
      />

      {viewMode === 'table' ? (
        <EmployeeTable 
          employees={filteredEmployees} 
          isLoading={isLoading} 
        />
      ) : (
        <EmployeeGrid 
          employees={filteredEmployees} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
};
