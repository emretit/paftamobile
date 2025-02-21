
import Navbar from "@/components/Navbar";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

interface EmployeeFormPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const EmployeeFormPage = ({ isCollapsed, setIsCollapsed }: EmployeeFormPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <EmployeeForm />
      </main>
    </div>
  );
};

export default EmployeeFormPage;
