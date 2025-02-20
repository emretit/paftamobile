
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, CalendarClock, Filter, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  event_type: "technical" | "sales";
  category: string;
  assigned_to?: string;
}

interface Employee {
  id: string;
  name: string;
  department: "technical" | "sales";
}

const DualCalendar = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [activeCalendar, setActiveCalendar] = React.useState<"technical" | "sales">("technical");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = React.useState<string>("all");
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddEventOpen, setIsAddEventOpen] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState<Partial<Event>>({
    event_type: "technical",
    start_time: new Date(),
    end_time: new Date(),
  });

  const categories = {
    technical: ["installation", "maintenance", "service_call", "support_ticket"],
    sales: ["proposal_deadline", "sales_meeting", "follow_up"]
  };

  const employees: Employee[] = [
    { id: "1", name: "Ahmet Yılmaz", department: "technical" },
    { id: "2", name: "Mehmet Demir", department: "technical" },
    { id: "3", name: "Ayşe Kaya", department: "sales" },
    { id: "4", name: "Fatma Şahin", department: "sales" }
  ];

  React.useEffect(() => {
    fetchEvents();
    subscribeToEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*');

      if (error) throw error;

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToEvents = () => {
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAddEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.category) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('events')
        .insert([newEvent]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event added successfully",
      });

      setIsAddEventOpen(false);
      setNewEvent({
        event_type: activeCalendar,
        start_time: new Date(),
        end_time: new Date(),
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesType = event.event_type === activeCalendar;
      const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
      const matchesEmployee = employeeFilter === "all" || event.assigned_to === employeeFilter;
      return matchesType && matchesCategory && matchesEmployee;
    });
  };

  const getDayEvents = (day: Date) => {
    return getFilteredEvents().filter(event => 
      new Date(event.start_time).toDateString() === day.toDateString()
    );
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
                hasEvent: (date: Date) => getDayEvents(date).length > 0
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
                <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-900 hover:bg-red-800">
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Etkinlik Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] text-white">
                    <DialogHeader>
                      <DialogTitle>Yeni Etkinlik Ekle</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Başlık</Label>
                        <Input
                          id="title"
                          value={newEvent.title || ''}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          className="bg-red-950/10 border-red-900/20"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Input
                          id="description"
                          value={newEvent.description || ''}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          className="bg-red-950/10 border-red-900/20"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select
                          value={newEvent.category}
                          onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                        >
                          <SelectTrigger className="bg-red-950/10 border-red-900/20">
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories[activeCalendar].map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="assigned">Atanan Kişi</Label>
                        <Select
                          value={newEvent.assigned_to}
                          onValueChange={(value) => setNewEvent({ ...newEvent, assigned_to: value })}
                        >
                          <SelectTrigger className="bg-red-950/10 border-red-900/20">
                            <SelectValue placeholder="Çalışan seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees
                              .filter(emp => emp.department === activeCalendar)
                              .map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddEventOpen(false)}
                        className="bg-red-950/10 border-red-900/20 hover:bg-red-900/20"
                      >
                        İptal
                      </Button>
                      <Button
                        onClick={handleAddEvent}
                        className="bg-red-900 hover:bg-red-800"
                      >
                        Ekle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center text-white">Loading...</div>
                ) : (
                  getDayEvents(selectedDate || new Date()).map((event) => (
                    <div 
                      key={event.id}
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        event.event_type === "technical" ? "bg-red-950/20 border-red-900/20" : "bg-red-950/10 border-red-900/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white">{event.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm px-2 py-1 rounded-full bg-red-900/30 text-white">
                            {event.category}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-300 mt-1">{event.description}</p>
                      )}
                      <div className="mt-2 text-sm text-gray-400">
                        Atanan: {employees.find(emp => emp.id === event.assigned_to)?.name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DualCalendar;
