
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from "@/types/task";

interface TasksFilterBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedEmployee: string | null;
  setSelectedEmployee: (value: string | null) => void;
  selectedType: string | null;
  setSelectedType: (value: string | null) => void;
  employees?: Employee[];
}

const TasksFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedEmployee,
  setSelectedEmployee,
  selectedType,
  setSelectedType,
  employees
}: TasksFilterBarProps) => {
  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Görev ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select
          value={selectedEmployee || "all"}
          onValueChange={(value) => setSelectedEmployee(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Çalışan seç" />
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
      </div>
    </Card>
  );
};

export default TasksFilterBar;
