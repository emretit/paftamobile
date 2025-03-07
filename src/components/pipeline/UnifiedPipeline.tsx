import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";
import type { Deal } from "@/types/deal";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface DealWithEmployee extends Deal {
  employee: Employee;
}

interface TaskWithAssignee extends Task {
  assignee: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface Column {
  id: string;
  title: string;
  items: (TaskWithAssignee | DealWithEmployee)[];
}

const columnOrder = ['opportunities', 'in_progress', 'completed', 'postponed'];

const UnifiedPipeline = () => {
  const [columns, setColumns] = useState<Record<string, Column>>({
    opportunities: {
      id: 'opportunities',
      title: 'Opportunities',
      items: [],
    },
    in_progress: {
      id: 'in_progress',
      title: 'In Progress',
      items: [],
    },
    completed: {
      id: 'completed',
      title: 'Completed',
      items: [],
    },
    postponed: {
      id: 'postponed',
      title: 'Postponed',
      items: [],
    },
  });

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['pipeline-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .in('status', ['todo', 'in_progress', 'completed', 'postponed'])
        .order('created_at', { ascending: false });
    
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
    
      return data.map(task => ({
        ...task,
        type: task.type || 'general',
        // Explicitly setting item_type as it's required in the Task interface
        item_type: 'task',
        assignee: task.assignee ? {
          id: task.assignee.id,
          name: `${task.assignee.first_name} ${task.assignee.last_name}`,
          avatar: task.assignee.avatar_url
        } : undefined
      })) as unknown as Task[];
    }
  });

  const { data: deals, isLoading: isDealsLoading } = useQuery({
    queryKey: ['pipeline-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          employee:employee_id(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching deals:', error);
        throw error;
      }
      
      return data as DealWithEmployee[];
    }
  });

  React.useEffect(() => {
    if (tasks && deals) {
      // Group tasks by status
      const groupedTasks = tasks.reduce((acc: Record<string, TaskWithAssignee[]>, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task as TaskWithAssignee);
        return acc;
      }, {});

      // Initialize items array for each column
      const newColumns: Record<string, Column> = {
        opportunities: { ...columns.opportunities, items: [] },
        in_progress: { ...columns.in_progress, items: [] },
        completed: { ...columns.completed, items: [] },
        postponed: { ...columns.postponed, items: [] },
      };

      // Add tasks to the appropriate column
      if (groupedTasks.todo) {
        newColumns.opportunities.items.push(...groupedTasks.todo);
      }
      if (groupedTasks.in_progress) {
        newColumns.in_progress.items.push(...groupedTasks.in_progress);
      }
      if (groupedTasks.completed) {
        newColumns.completed.items.push(...groupedTasks.completed);
      }
      if (groupedTasks.postponed) {
        newColumns.postponed.items.push(...groupedTasks.postponed);
      }

      // Add deals to the opportunities column
      newColumns.opportunities.items.push(...deals);

      // Update the state with the new columns
      setColumns(newColumns);
    }
  }, [tasks, deals]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    if (start === finish) {
      const newItemIds = Array.from(start.items);
      const [removed] = newItemIds.splice(source.index, 1);
      newItemIds.splice(destination.index, 0, removed);

      const newColumn = {
        ...start,
        items: newItemIds,
      };
      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      });
      return;
    }

    // Moving from one list to another
    const startItemIds = Array.from(start.items);
    const [removed] = startItemIds.splice(source.index, 1);

    const finishItemIds = Array.from(finish.items);
    finishItemIds.splice(destination.index, 0, removed);

    const newStart = {
      ...start,
      items: startItemIds,
    };

    const newFinish = {
      ...finish,
      items: finishItemIds,
    };

    setColumns({
      ...columns,
      [newStart.id]: newStart,
      [newFinish.id]: newFinish,
    });
  };

  const getEmployeeAvatar = (item: any) => {
    if ('assignee' in item && item.assignee) {
      return item.assignee.avatar;
    } else if ('employee' in item && item.employee) {
      return item.employee.avatar_url;
    }
    return null;
  };

  const getEmployeeName = (item: any) => {
    if ('assignee' in item && item.assignee) {
      return item.assignee.name;
    } else if ('employee' in item && item.employee) {
      return `${item.employee.first_name} ${item.employee.last_name}`;
    }
    return 'Unassigned';
  };

  if (isTasksLoading || isDealsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {columnOrder.map((columnId) => {
          const column = columns[columnId];
          return (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: '#f0f0f0',
                    padding: 8,
                    width: 250,
                    minHeight: 500,
                  }}
                >
                  <h2>{column.title}</h2>
                  {column.items.map((item, index) => (
                    <Draggable draggableId={item.id} index={index} key={item.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            userSelect: 'none',
                            padding: 16,
                            margin: '0 0 8px 0',
                            backgroundColor: 'white',
                            color: '#333',
                            ...provided.draggableProps.style,
                          }}
                        >
                          <Card>
                            <CardContent>
                              <div>
                                {item.title}
                                <br />
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={getEmployeeAvatar(item) || ''} />
                                  <AvatarFallback>{getEmployeeName(item)?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {getEmployeeName(item)}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default UnifiedPipeline;
