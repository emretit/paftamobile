
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Plus } from "lucide-react";
import TasksKanban from "@/components/tasks/TasksKanban";

interface TasksProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Tasks = ({ isCollapsed, setIsCollapsed }: TasksProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${
        isCollapsed ? 'ml-[60px]' : 'ml-64'
      }`}>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Görevler</h1>
              <p className="text-gray-600 mt-1">Tüm görevleri görüntüleyin ve yönetin</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrele
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Görev Ekle
              </Button>
            </div>
          </div>

          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Görev ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select
                value={selectedEmployee || ""}
                onValueChange={(value) => setSelectedEmployee(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Çalışan seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="1">Ahmet Yılmaz</SelectItem>
                  <SelectItem value="2">Ayşe Demir</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedType || ""}
                onValueChange={(value) => setSelectedType(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Görev tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="opportunity">Fırsat</SelectItem>
                  <SelectItem value="proposal">Teklif</SelectItem>
                  <SelectItem value="general">Genel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <TasksKanban
              searchQuery={searchQuery}
              selectedEmployee={selectedEmployee}
              selectedType={selectedType}
            />
          </ScrollArea>
        </div>
      </main>
    </div>
  );
};

export default Tasks;
