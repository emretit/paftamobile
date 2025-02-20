
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
import { CalendarCheck, CalendarClock, Filter } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: "technical" | "sales";
  category: string;
  description?: string;
}

const DualCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeCalendar, setActiveCalendar] = useState<"technical" | "sales">("technical");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Örnek kategoriler
  const categories = {
    technical: ["Bakım", "Onarım", "Kurulum", "Güncelleme"],
    sales: ["Toplantı", "Teklif Sunumu", "Müşteri Görüşmesi", "Sözleşme İmzalama"]
  };

  // Örnek etkinlikler
  const events: Event[] = [
    {
      id: "1",
      title: "Sistem Bakımı",
      date: new Date(),
      type: "technical",
      category: "Bakım",
      description: "Rutin sistem bakımı"
    },
    {
      id: "2",
      title: "Satış Toplantısı",
      date: new Date(),
      type: "sales",
      category: "Toplantı",
      description: "Potansiyel müşteri ile görüşme"
    }
  ];

  // Filtrelenmiş etkinlikleri getir
  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesType = event.type === activeCalendar;
      const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
      return matchesType && matchesCategory;
    });
  };

  // Seçili güne ait etkinlikleri getir
  const getDayEvents = (day: Date) => {
    return getFilteredEvents().filter(event => 
      event.date.toDateString() === day.toDateString()
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <Tabs value={activeCalendar} onValueChange={(value: "technical" | "sales") => setActiveCalendar(value)}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Teknik Takvim
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Satış Takvimi
            </TabsTrigger>
          </TabsList>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
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

        <div className="grid grid-cols-[300px_1fr] gap-8">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border shadow-sm"
            modifiers={{
              hasEvent: (date) => getDayEvents(date).length > 0,
            }}
            modifiersStyles={{
              hasEvent: { backgroundColor: "rgb(243 244 246)", fontWeight: "bold" }
            }}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedDate ? selectedDate.toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })} Etkinlikleri
            </h3>
            <div className="space-y-2">
              {getDayEvents(selectedDate || new Date()).map(event => (
                <div 
                  key={event.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    event.type === "technical" ? "bg-blue-50" : "bg-green-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    <span className="text-sm px-2 py-1 rounded-full bg-white">
                      {event.category}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  )}
                </div>
              ))}
              <Button className="w-full mt-4">
                + Yeni Etkinlik Ekle
              </Button>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default DualCalendar;
