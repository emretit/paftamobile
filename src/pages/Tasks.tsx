
import { useState } from "react";
import Navbar from "@/components/Navbar";
import TasksContent from "@/components/tasks/TasksContent";

interface TasksPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Tasks = ({ isCollapsed, setIsCollapsed }: TasksPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedType, setSelectedType] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-8">
          <TasksContent 
            searchQuery={searchQuery}
            selectedEmployee={selectedEmployee}
            selectedType={selectedType}
            onSelectTask={() => {}}
          />
        </div>
      </main>
    </div>
  );
};

export default Tasks;
