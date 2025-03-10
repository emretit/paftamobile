
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { EmployeeDetailsView } from "@/components/employees/details/EmployeeDetailsView";
import { EmployeeDetailsHeader } from "@/components/employees/details/EmployeeDetailsHeader";
import { EmployeeDetailTabs } from "@/components/employees/details/EmployeeDetailTabs";
import { EmployeeDetailsLoading } from "@/components/employees/details/EmployeeDetailsLoading";
import { EmployeeNotFound } from "@/components/employees/details/EmployeeNotFound";
import { useEmployeeDetails } from "@/components/employees/details/useEmployeeDetails";

interface EmployeeDetailsPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const EmployeeDetails = ({ isCollapsed, setIsCollapsed }: EmployeeDetailsPageProps) => {
  const { id } = useParams();
  const { 
    employee, 
    isLoading, 
    activeTab, 
    setActiveTab, 
    handleEmployeeUpdate 
  } = useEmployeeDetails(id);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-6">
          <EmployeeDetailsHeader 
            employeeId={employee?.id} 
            employeeName={employee ? `${employee.first_name} ${employee.last_name}` : undefined}
          />
          
          {isLoading ? (
            <EmployeeDetailsLoading />
          ) : !employee ? (
            <EmployeeNotFound />
          ) : (
            <div className="space-y-8 pb-12 animate-fade-in">
              <EmployeeDetailsView employee={employee} />
              
              <EmployeeDetailTabs 
                employee={employee}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isEditing={false}
                handleEmployeeUpdate={handleEmployeeUpdate}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeDetails;
