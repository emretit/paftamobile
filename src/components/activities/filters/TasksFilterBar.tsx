
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskStatus } from "@/types/task";
import { getStatusDisplay } from "../utils/taskDisplayUtils";

// Using the more complete Employee type from types/employee.ts
interface TaskFilterEmployee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  status?: string;
}

interface TasksFilterBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedEmployee: string | null;
  setSelectedEmployee: (value: string | null) => void;
  selectedType: string | null;
  setSelectedType: (value: string | null) => void;
  selectedStatus: TaskStatus | null;
  setSelectedStatus: (value: TaskStatus | null) => void;
  employees?: TaskFilterEmployee[];
}

const TasksFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedEmployee,
  setSelectedEmployee,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  employees
}: TasksFilterBarProps) => {
  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative min-w-[400px] flex-1">
          <Input
            placeholder="Görev ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedEmployee || "all"}
          onValueChange={(value) => setSelectedEmployee(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Atanan seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {employees?.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedType || "all"}
          onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Görev tipi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="opportunity">Fırsat</SelectItem>
            <SelectItem value="proposal">Teklif</SelectItem>
            <SelectItem value="general">Genel</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={selectedStatus || "all"}
          onValueChange={(value) => setSelectedStatus(value === "all" ? null : value as TaskStatus)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="todo">{getStatusDisplay("todo")}</SelectItem>
            <SelectItem value="in_progress">{getStatusDisplay("in_progress")}</SelectItem>
            <SelectItem value="completed">{getStatusDisplay("completed")}</SelectItem>
            <SelectItem value="postponed">{getStatusDisplay("postponed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};

export default TasksFilterBar;
