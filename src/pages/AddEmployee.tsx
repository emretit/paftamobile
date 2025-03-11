
import Navbar from "@/components/Navbar";
import SimpleEmployeeForm from "@/components/employees/form/SimpleEmployeeForm";

interface AddEmployeeProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const AddEmployee = ({ isCollapsed, setIsCollapsed }: AddEmployeeProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
            <p className="text-gray-500">Create a new employee record</p>
          </div>
          
          <SimpleEmployeeForm />
        </div>
      </main>
    </div>
  );
};

export default AddEmployee;
