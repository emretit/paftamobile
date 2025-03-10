
import { Tabs } from "@/components/ui/tabs";
import type { Employee } from "../types";
import { EmployeeTabsList } from "./tabs/TabsList";
import { EmployeeTabsContent } from "./tabs/TabsContent";

interface EmployeeDetailTabsProps {
  employee: Employee;
  activeTab: string;
  setActiveTab: (value: string) => void;
  isEditing: boolean;
  handleEmployeeUpdate: (updatedEmployee: Employee) => void;
}

export const EmployeeDetailTabs = ({ 
  employee, 
  activeTab, 
  setActiveTab, 
  isEditing, 
  handleEmployeeUpdate 
}: EmployeeDetailTabsProps) => {
  return (
    <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in">
      <EmployeeTabsList activeTab={activeTab} />
      
      <EmployeeTabsContent 
        employee={employee} 
        handleEmployeeUpdate={handleEmployeeUpdate} 
      />
    </Tabs>
  );
};
