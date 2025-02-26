
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Clock, CheckCircle2, ListTodo } from "lucide-react";
import TaskColumn from "./TaskColumn";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  priority: "low" | "medium" | "high";
  type: "opportunity" | "proposal" | "general";
  relatedItemId?: string;
  relatedItemTitle?: string;
}

interface TasksState {
  todo: Task[];
  in_progress: Task[];
  completed: Task[];
}

interface TasksKanbanProps {
  searchQuery: string;
  selectedEmployee: string | null;
  selectedType: string | null;
}

const columns = [
  { id: "todo", title: "Yapılacaklar", icon: ListTodo },
  { id: "in_progress", title: "Devam Ediyor", icon: Clock },
  { id: "completed", title: "Tamamlandı", icon: CheckCircle2 },
];

// Dummy data for demonstration
const initialTasks: TasksState = {
  todo: [
    {
      id: "1",
      title: "Müşteri görüşmesi",
      description: "ABC firması ile görüşme",
      status: "todo",
      assignee: { id: "1", name: "Ahmet Yılmaz" },
      priority: "high",
      type: "opportunity",
      dueDate: "2024-03-20",
      relatedItemId: "opp_1",
      relatedItemTitle: "ABC Firması Projesi"
    }
  ],
  in_progress: [
    {
      id: "2",
      title: "Teklif hazırlama",
      description: "XYZ projesi için teklif hazırlanacak",
      status: "in_progress",
      assignee: { id: "2", name: "Ayşe Demir" },
      priority: "medium",
      type: "proposal",
      dueDate: "2024-03-22",
      relatedItemId: "prop_1",
      relatedItemTitle: "XYZ Projesi Teklifi"
    }
  ],
  completed: [
    {
      id: "3",
      title: "Dosyalama",
      description: "Geçmiş projelerin dosyalanması",
      status: "completed",
      assignee: { id: "1", name: "Ahmet Yılmaz" },
      priority: "low",
      type: "general",
      dueDate: "2024-03-18"
    }
  ]
};

const TasksKanban = ({ searchQuery, selectedEmployee, selectedType }: TasksKanbanProps) => {
  const handleDragEnd = (result: any) => {
    // Implement drag and drop logic here
    console.log("Drag ended:", result);
  };

  const filterTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEmployee = !selectedEmployee || 
        task.assignee?.id === selectedEmployee;
      
      const matchesType = !selectedType || 
        task.type === selectedType;

      return matchesSearch && matchesEmployee && matchesType;
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            tasks={filterTasks(initialTasks[column.id as keyof TasksState])}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default TasksKanban;
