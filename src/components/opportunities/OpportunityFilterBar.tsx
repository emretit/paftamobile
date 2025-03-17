
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface OpportunityFilterBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedEmployee: string | null;
  setSelectedEmployee: (value: string | null) => void;
  selectedCustomer: string | null;
  setSelectedCustomer: (value: string | null) => void;
  employees: { id: string; name: string }[];
  customers: { id: string; name: string }[];
}

const OpportunityFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedEmployee,
  setSelectedEmployee,
  selectedCustomer,
  setSelectedCustomer,
  employees,
  customers
}: OpportunityFilterBarProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1 md:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Fırsatlarda ara..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Select
          value={selectedEmployee || ""}
          onValueChange={(value) => setSelectedEmployee(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Satış Temsilcisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">Tüm Satış Temsilcileri</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={selectedCustomer || ""}
          onValueChange={(value) => setSelectedCustomer(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Müşteri" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">Tüm Müşteriler</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default OpportunityFilterBar;
