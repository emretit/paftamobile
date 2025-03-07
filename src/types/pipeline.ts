
import { Task } from "./task";
import { Deal } from "./deal";

export type PipelineView = 'tasks' | 'deals' | 'unified';
export type ItemType = 'task' | 'deal' | 'opportunity';

export interface PipelineColumn {
  id: string;
  name: string;
}

export interface PipelineFilter {
  employeeId?: string;
  customerName?: string;
  status?: string[];
  priority?: string[];
}

export type PipelineItem = Task | Deal;
