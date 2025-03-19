
import React from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Task } from "@/types/task";
import TasksTableHeader from "./TasksTableHeader";
import TasksTableRow from "./TasksTableRow";
import TasksTableEmpty from "./TasksTableEmpty";
import TasksTableLoading from "./TasksTableLoading";
import { filterTasks } from "./utils/filterTasks";

export interface TasksTableProps {
  tasks: Task[];
  isLoading: boolean;
  onSelectTask: (task: Task) => void;
  searchQuery?: string;
  selectedEmployee?: string | null;
  selectedType?: string | null;
}

export const TasksTable = ({
  tasks,
  isLoading,
  onSelectTask,
  searchQuery = "",
  selectedEmployee = null,
  selectedType = null
}: TasksTableProps) => {
  const filteredTasks = filterTasks(tasks, searchQuery, selectedEmployee, selectedType);

  if (isLoading) {
    return <TasksTableLoading />;
  }

  return (
    <Table>
      <TasksTableHeader />
      <TableBody>
        {filteredTasks.length === 0 ? (
          <TasksTableEmpty />
        ) : (
          filteredTasks.map((task) => (
            <TasksTableRow 
              key={task.id} 
              task={task} 
              onSelectTask={onSelectTask} 
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TasksTable;
