
import * as React from "react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarCheck, CalendarClock, Filter, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: "technical" | "sales";
  category: string;
  description?: string;
  assignedTo?: string;
}

interface Employee {
  id: string;
  name: string;
  department: "technical" | "sales";
}

const DualCalendar = (): JSX.Element => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeCalendar, setActiveCalendar] = useState<"technical" | "sales">("technical");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  const employees: Employee[] = [
    { id: "1", name: "Ahmet Yılmaz", department: "technical" },
    { id: "2", name: "Mehmet Demir", department: "technical" },
    { id: "3", name: "Ayşe Kaya", department: "sales" },
    { id: "4", name: "Fatma Şahin", department: "sales" }
  ];

  const categories = {
    technical: ["Bakım", "Onarım", "Kurulum", "Güncelleme"],
    sales: ["Toplantı", "Teklif Sunumu", "Müşteri Görüşmesi", "Sözleşme İmzalama"]
  };

  const events: Event[] = [
    {
      id: "1",
      title: "Sistem Bakımı",
      date: new Date(),
      type: "technical",
      category: "Bakım",
      description: "Rutin sistem bakımı",
      assignedTo: "1"
    },
    {
      id: "2",
      title: "Satış Toplantısı",
      date: new Date(),
      type: "sales",
      category: "Toplantı",
      description: "Potansiyel müşteri ile görüşme",
      assignedTo: "3"
    }
  ];

  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesType = event.type === activeCalendar;
      const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
      const matchesEmployee = employeeFilter === "all" || event.assignedTo === employeeFilter;
      return matchesType && matchesCategory && matchesEmployee;
    });
  };

  const getDayEvents = (day: Date) => {
    return getFilteredEvents().filter(event => 
      event.date.toDateString() === day.toDateString()
    );
  };

  const handleAddEvent = () => {
    toast({
      title: "Yeni Etkinlik",
      description: "Yeni etkinlik ekleme özelliği yakında eklenecektir.",
    });
  };

  return (
    <div className="bg-[#1A1F2C] p-6 rounded-lg shadow-lg border border-red-900/20">
      <Tabs defaultValue={activeCalendar} onValueChange={(value: "technical" | "sales") => setActiveCalendar(value)}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-[400px] grid-cols-2 bg-red-950/20">
            <TabsTrigger 
              value="technical" 
              className="flex items-center gap-2 data-[state=active]:bg-red-900 data-[state=active]:text-white"
            >
              <CalendarClock className="h-4 w-4" />
              Teknik Takvim
            </TabsTrigger>
            <TabsTrigger 
              value="sales" 
              className="flex items-center gap-2 data-[state=active]:bg-red-900 data-[state=active]:text-white"
            >
              <CalendarCheck className="h-4 w-4" />
              Satış Takvimi
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-4">
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-[200px] bg-red-950/10 border-red-900/20">
                <SelectValue placeholder="Çalışan Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Çalışanlar</SelectItem>
                {employees
                  .filter(emp => emp.department === activeCalendar)
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] bg-red-950/10 border-red-900/20">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Kategori Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories[activeCalendar].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeCalendar} className="mt-2">
          <div className="grid grid-cols-[300px_1fr] gap-8">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-red-900/20 bg-red-950/10"
              modifiers={{
                hasEvent: (date: Date): boolean => getDayEvents(date).length > 0
              }}
              modifiersStyles={{
                hasEvent: { backgroundColor: "rgb(127 29 29 / 0.1)", fontWeight: "bold" }
              }}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {selectedDate ? selectedDate.toLocaleDateString('tr-TR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })} Etkinlikleri
                </h3>
                <Button 
                  onClick={handleAddEvent}
                  className="bg-red-900 hover:bg-red-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Etkinlik Ekle
                </Button>
              </div>
              <div className="space-y-2">
                {getDayEvents(selectedDate || new Date()).map((event: Event) => (
                  <div 
                    key={event.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      event.type === "technical" ? "bg-red-950/20 border-red-900/20" : "bg-red-950/10 border-red-900/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{event.title}</h4>
                      <span className="text-sm px-2 py-1 rounded-full bg-red-900/30 text-white">
                        {event.category}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-300 mt-1">{event.description}</p>
                    )}
                    <div className="mt-2 text-sm text-gray-400">
                      Atanan: {employees.find(emp => emp.id === event.assignedTo)?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DualCalendar;
