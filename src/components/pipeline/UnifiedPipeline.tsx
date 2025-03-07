import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { usePipelineMutations } from "./hooks/usePipelineMutations";
import type { Task } from "@/types/task";

interface Deal {
  id: string;
  title: string;
  status: 'new' | 'negotiation' | 'won' | 'lost';
  amount: number;
  close_date: string;
  created_at: string;
  updated_at: string;
  employee_id: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  type: string;
}

const columnTitles = {
  todo: "Tasks To Do",
  in_progress: "Tasks In Progress",
  completed: "Tasks Completed",
  postponed: "Tasks Postponed",
  new: "Deals New",
  negotiation: "Deals Negotiation",
  won: "Deals Won",
  lost: "Deals Lost",
};

const statusMap = {
  new: "new",
  negotiation: "negotiation",
  won: "won",
  lost: "lost",
  todo: "todo",
  in_progress: "in_progress",
  completed: "completed",
  postponed: "postponed",
};

const UnifiedPipeline = () => {
  const [isRefetching, setIsRefetching] = useState(false);
  const { updateStatus } = usePipelineMutations();
  
  const { data: tasks, isLoading: isLoadingTasks, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      return (data.map(task => ({
        ...task,
        type: task.type || 'general',
        item_type: task.item_type || 'task',
        assignee: task.assignee ? {
          id: task.assignee.id,
          name: `${task.assignee.first_name} ${task.assignee.last_name}`,
          avatar: task.assignee.avatar_url
        } : undefined
      })) as unknown) as Task[];
    }
  });
  
  const { data: deals, isLoading: isLoadingDeals, refetch: refetchDeals } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          employee:employee_id (
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
      
      return (data.map(deal => ({
        ...deal,
        type: 'deal',
        employee: deal.employee ? {
          id: deal.employee.id,
          first_name: deal.employee.first_name,
          last_name: deal.employee.last_name,
          avatar_url: deal.employee.avatar_url
        } : undefined
      })) as unknown) as Deal[];
    }
  });
  
  const allItems = React.useMemo(() => {
    const normalizedTasks = (tasks || []).map(task => ({ ...task, type: task.type || 'task' }));
    const normalizedDeals = (deals || []).map(deal => ({ ...deal, type: 'deal' }));
    return [...normalizedTasks, ...normalizedDeals];
  }, [tasks, deals]);
  
  const isLoading = isLoadingTasks || isLoadingDeals;
  
  const groupedItems = React.useMemo(() => {
    if (!allItems) return {};
    
    return allItems.reduce((acc: { [key: string]: any[] }, item: any) => {
      const status = item.type === 'task' ? item.status : item.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(item);
      return acc;
    }, {});
  }, [allItems]);
  
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) {
      return;
    }
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    
    const itemId = draggableId;
    const newStatus = destination.droppableId as Task['status'];
    
    const item = allItems.find((item: any) => item.id === itemId);
    
    if (item) {
      const itemType = item.type === 'task' ? 'task' : 'opportunity';
      await handleUpdateStatus(itemId, newStatus, itemType);
    }
  };
  
  const handleUpdateStatus = (id: string, status: Task['status'], itemType: Task['item_type']) => {
    updateStatus.mutate({ id, status, itemType });
  };
  
  const refetchData = async () => {
    setIsRefetching(true);
    try {
      await Promise.all([refetchTasks(), refetchDeals()]);
    } finally {
      setIsRefetching(false);
    }
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
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between space-x-2 mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Unified Pipeline</h2>
        <Button variant="outline" size="sm" onClick={refetchData} disabled={isRefetching}>
          {isRefetching ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Yenileniyor...
            </>
          ) : (
            <>
              <ReloadIcon className="mr-2 h-4 w-4" />
              Yenile
            </>
          )}
        </Button>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 h-full">
          {Object.entries(statusMap).map(([statusKey, statusValue]) => (
            <div key={statusKey} className="flex flex-col h-full">
              <div className="text-sm font-bold mb-2">{columnTitles[statusValue as keyof typeof columnTitles] || statusKey}</div>
              <Droppable droppableId={statusValue}>
                {(provided, snapshot) => (
                  <ScrollArea
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn("flex-1 h-full p-2 rounded-md", snapshot.isDraggingOver ? "bg-secondary" : "bg-secondary/50")}
                  >
                    {isLoading ? (
                      <>
                        <Skeleton className="mb-2 h-32 rounded-md" />
                        <Skeleton className="mb-2 h-32 rounded-md" />
                        <Skeleton className="mb-2 h-32 rounded-md" />
                      </>
                    ) : groupedItems[statusValue]?.length === 0 ? (
                      <div className="text-muted-foreground text-center py-4">
                        No items in this column.
                      </div>
                    ) : (
                      groupedItems[statusValue]?.map((item: any, index: number) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn("mb-2", snapshot.isDragging ? "shadow-md" : "shadow")}
                            >
                              <Card>
                                <CardHeader>
                                  <CardTitle>{item.title}</CardTitle>
                                  <CardDescription>
                                    {item.type === 'deal' ? (
                                      <>Amount: ${item.amount}</>
                                    ) : (
                                      item.description
                                    )}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center space-x-4">
                                  <Avatar>
                                    <AvatarImage src={getEmployeeAvatar(item)} />
                                    <AvatarFallback>{getEmployeeName(item)?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="text-sm font-medium">{getEmployeeName(item)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.type === 'deal' ? 'Deal' : 'Task'}
                                    </div>
                                  </div>
                                </CardContent>
                                <CardFooter className="justify-between">
                                  {item.type === 'deal' && (
                                    <Badge variant="secondary">
                                      Close Date: {new Date(item.close_date).toLocaleDateString()}
                                    </Badge>
                                  )}
                                  <Badge className="capitalize">{item.type}</Badge>
                                </CardFooter>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </ScrollArea>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default UnifiedPipeline;
