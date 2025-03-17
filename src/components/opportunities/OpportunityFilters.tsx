
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  OpportunityStatus, 
  opportunityStatusLabels 
} from "@/types/crm";
import { useCustomerNames } from "@/hooks/useCustomerNames";
import { useEmployeeNames } from "@/hooks/useEmployeeNames";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface OpportunityFiltersProps {
  filters: {
    status: OpportunityStatus | 'all';
    search: string;
    employeeId?: string;
    customerId?: string;
  };
  onFilterChange: (filters: OpportunityFiltersProps['filters']) => void;
}

const OpportunityFilters = ({ filters, onFilterChange }: OpportunityFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const { customers } = useCustomerNames();
  const { employees } = useEmployeeNames();

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Update parent component filters when local filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange(localFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilters, onFilterChange]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  // Handle status select change
  const handleStatusChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: value as OpportunityStatus | 'all',
    }));
  };

  // Handle employee select change
  const handleEmployeeChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      employeeId: value === 'all' ? undefined : value,
    }));
  };

  // Handle customer select change
  const handleCustomerChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      customerId: value === 'all' ? undefined : value,
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="search">Arama</Label>
        <Input
          id="search"
          placeholder="Fırsat ara..."
          value={localFilters.search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status-filter">Durum</Label>
        <Select
          value={localFilters.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Durum seçiniz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            {Object.entries(opportunityStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee-filter">Sorumlu</Label>
        <Select
          value={localFilters.employeeId || 'all'}
          onValueChange={handleEmployeeChange}
        >
          <SelectTrigger id="employee-filter">
            <SelectValue placeholder="Sorumlu seçiniz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Sorumlular</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-filter">Müşteri</Label>
        <Select
          value={localFilters.customerId || 'all'}
          onValueChange={handleCustomerChange}
        >
          <SelectTrigger id="customer-filter">
            <SelectValue placeholder="Müşteri seçiniz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Müşteriler</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(localFilters.status !== 'all' || 
        localFilters.employeeId || 
        localFilters.customerId || 
        localFilters.search) && (
        <div className="col-span-full flex flex-wrap gap-2 mt-2">
          <div className="text-sm font-medium text-gray-500">Aktif Filtreler:</div>
          {localFilters.status !== 'all' && (
            <Badge variant="outline" className="bg-blue-50">
              Durum: {opportunityStatusLabels[localFilters.status as OpportunityStatus]}
            </Badge>
          )}
          {localFilters.employeeId && (
            <Badge variant="outline" className="bg-green-50">
              Sorumlu: {employees.find(e => e.id === localFilters.employeeId)?.first_name} {employees.find(e => e.id === localFilters.employeeId)?.last_name}
            </Badge>
          )}
          {localFilters.customerId && (
            <Badge variant="outline" className="bg-purple-50">
              Müşteri: {customers.find(c => c.id === localFilters.customerId)?.name}
            </Badge>
          )}
          {localFilters.search && (
            <Badge variant="outline" className="bg-amber-50">
              Arama: {localFilters.search}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default OpportunityFilters;
